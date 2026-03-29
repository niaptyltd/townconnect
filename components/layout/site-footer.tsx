import Link from "next/link";

import { publicNavigation } from "@/constants/navigation";
import { APP_NAME, APP_TAGLINE, SOCIAL_LINKS } from "@/constants/platform";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-line bg-white">
      <div className="container-shell grid gap-10 py-12 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-semibold text-brand-ink">{APP_NAME}</h3>
          <p className="max-w-md text-sm leading-6 text-slate-600">{APP_TAGLINE}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Explore</h4>
          <div className="grid gap-3">
            {publicNavigation.map((item) => (
              <Link className="text-sm text-slate-700 transition hover:text-brand-forest" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</h4>
          <div className="grid gap-3">
            {SOCIAL_LINKS.map((item) => (
              <Link className="text-sm text-slate-700 transition hover:text-brand-forest" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
