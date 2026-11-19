import { Shell } from "@/components/shell";
import { SearchControls } from "@/components/search-controls";
import { Badge } from "@/components/arc/badge/badge";
import { recentRuns, searches, type Criteria } from "@/lib/queries";
import { t, lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const tone = { ok: "success", blocked: "warning", error: "danger" } as const;

export default async function Searches() {
  const [list, runs] = await Promise.all([searches(), recentRuns()]);
  return (
    <Shell active="searches">
      {list.map((s) => {
        const c = s.criteria as Criteria;
        return (
          <div className="panel" key={s.id}>
            <div className="toolbar">
              <div>
                <h2>{s.name}</h2>
                <span className="muted">
                  {c.maxPrice ? `≤ ${c.maxPrice.toLocaleString(lang)} €` : ""}{c.minSurface ? ` · ≥ ${c.minSurface} m²` : ""}{c.minRooms ? ` · ≥ ${c.minRooms} p` : ""} · {(s.sources as string[]).join(", ")}
                </span>
              </div>
              <SearchControls id={s.id} active={s.active} interval={s.interval_minutes} />
            </div>
            <span className="muted">{t("lastRun")}: {s.last_run_at ? new Date(s.last_run_at).toLocaleString(lang) : t("never")}</span>
          </div>
        );
      })}
      <h2>{t("history")}</h2>
      {runs.length === 0 ? <span className="muted">{t("noRuns")}</span> : runs.map((r) => (
        <div className="row" key={r.id} style={{ padding: "6px 0" }}>
          <Badge tone={tone[r.status as keyof typeof tone] ?? "neutral"} size="sm">{r.status}</Badge>
          <span>{r.source}</span>
          <span className="muted">{r.status === "ok" ? `${r.found} · ${r.new_count} ${t("new")}` : r.error}</span>
          <span className="muted" style={{ marginLeft: "auto" }}>{new Date(r.started_at).toLocaleString(lang)}</span>
        </div>
      ))}
    </Shell>
  );
}
