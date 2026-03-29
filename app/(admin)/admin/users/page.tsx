"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useAdminCollection } from "@/hooks/use-admin-collection";
import { listUsers, saveUserStatus } from "@/services/admin-service";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const users = useAdminCollection<UserProfile>(listUsers);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.items.filter((user) =>
        [user.fullName, user.email, user.role].join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [query, users.items]
  );

  async function toggleActive(user: UserProfile) {
    setPendingUserId(user.id);
    try {
      await saveUserStatus({
        id: user.id,
        isActive: !user.isActive
      });
      await users.refresh();
      setMessage(user.isActive ? `${user.fullName} deactivated.` : `${user.fullName} activated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the user.");
    } finally {
      setPendingUserId("");
    }
  }

  if (users.loading) {
    return <Card>Loading users...</Card>;
  }

  if (users.error) {
    return <Card className="text-sm text-rose-700">{users.error}</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search users, inspect owners and activate or deactivate accounts."
      />

      {message ? <Card className="text-sm text-brand-ink">{message}</Card> : null}

      <Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users"
        value={query}
      />

      {filteredUsers.length === 0 ? (
        <EmptyState
          description="Try a broader name, email, or role search."
          title="No users found"
        />
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card className="space-y-3" key={user.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-brand-ink">
                    {user.fullName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.isActive ? "success" : "danger"}>{user.role}</Badge>
                  <Button
                    disabled={pendingUserId === user.id}
                    onClick={() => void toggleActive(user)}
                    variant="outline"
                  >
                    {pendingUserId === user.id
                      ? "Saving..."
                      : user.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
