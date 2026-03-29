import { PageState } from "@/components/ui/page-state";

export default function ForbiddenPage() {
  return (
    <PageState
      title="Access denied"
      description="Your account does not have permission to view that area. Sign in with the right role, or return to the main directory."
      actionHref="/"
      actionLabel="Back to home"
      tone="error"
    />
  );
}
