import Link from "next/link";
import { t } from "@/lib/i18n";

export function Shell({ active, children }: { active: "listings" | "searches"; children: React.ReactNode }) {
  const cur = (k: string) => (k === active ? "page" : undefined);
  return (
    <div className="shell">
      <header className="bar">
        <Link href="/" className="brand">Immo Watch</Link>
        <nav className="nav">
          <Link href="/" aria-current={cur("listings")}>{t("listings")}</Link>
          <Link href="/searches" aria-current={cur("searches")}>{t("searches")}</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
