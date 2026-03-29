import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-emerald">404</p>
      <h1 className="font-heading text-4xl font-semibold text-brand-ink">Page not found</h1>
      <p className="max-w-md text-sm text-slate-600">
        The page you requested does not exist yet, or the listing has been removed.
      </p>
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-ink"
        href="/"
      >
        Back to home
      </Link>
    </div>
  );
}
