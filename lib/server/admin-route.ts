import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/lib/auth/session-cookie";
import { saveServerDocument } from "@/lib/server/collection-store";
import type { ActivityLog, SessionUser } from "@/types";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

export class AdminRouteError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createSuccessResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { ok: true, data },
    {
      status: init?.status ?? 200,
      headers: {
        ...NO_STORE_HEADERS,
        ...(init?.headers ?? {})
      }
    }
  );
}

export function createErrorResponse(error: unknown) {
  if (error instanceof AdminRouteError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      {
        status: error.status,
        headers: NO_STORE_HEADERS
      }
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong while processing this admin request."
      }
    },
    {
      status: 500,
      headers: NO_STORE_HEADERS
    }
  );
}

export async function requireAdminSession() {
  const session = await getServerSession();

  if (!session) {
    throw new AdminRouteError(401, "UNAUTHENTICATED", "Please sign in to continue.");
  }

  if (!session.isActive) {
    throw new AdminRouteError(403, "ACCOUNT_INACTIVE", "Your account is inactive.");
  }

  if (session.role !== "admin") {
    throw new AdminRouteError(403, "FORBIDDEN", "You do not have permission to perform this action.");
  }

  return session;
}

export async function parseAdminBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AdminRouteError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AdminRouteError(
      400,
      "VALIDATION_ERROR",
      "The submitted data is invalid.",
      parsed.error.flatten()
    );
  }

  return parsed.data;
}

function sanitizeActivityMetadata(metadata: Record<string, unknown>): ActivityLog["metadata"] {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) =>
        typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      )
      .map(([key, value]) => [key, value as string | number | boolean])
  );
}

export async function writeAdminActivity(input: {
  actor: SessionUser;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  const activityLog: ActivityLog = {
    id: `activity_${randomUUID().slice(0, 8)}`,
    actorId: input.actor.id,
    actorRole: input.actor.role,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    metadata: sanitizeActivityMetadata(input.metadata ?? {}),
    createdAt: new Date().toISOString()
  };

  await saveServerDocument("activity_logs", activityLog);
  return activityLog;
}
