import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { ListingsTable, type ListingRow } from "@/components/listings-table";
import { MetricCard } from "@/components/arc/metric-card/metric-card";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { listings, onboardingDone, stats } from "@/lib/queries";
import { t, lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await onboardingDone())) redirect("/onboarding");
  const [s, rows] = await Promise.all([stats(), listings()]);
  const when = s.last_run ? new Date(s.last_run).toLocaleString(lang) : t("never");
  return (
    <Shell active="listings">
      <div className="metrics">
        <MetricCard label={t("total")} value={s.total} context={`${t("lastRun")}: ${when}`} />
        <MetricCard label={t("newToday")} value={s.new_today} context={t("newOnly")} />
        <MetricCard label={t("activeSearches")} value={s.active} context="cron" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyHint")} />
      ) : (
        <ListingsTable rows={JSON.parse(JSON.stringify(rows)) as ListingRow[]} />
      )}
    </Shell>
  );
}
