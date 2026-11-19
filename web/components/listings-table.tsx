"use client";

import { useState } from "react";
import { SortableDataTable, type DataColumn } from "@/components/arc/sortable-data-table/sortable-data-table";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { Badge } from "@/components/arc/badge/badge";
import { dictionary as d } from "@/lib/i18n";

export type ListingRow = {
  id: number; source: string; url: string | null; title: string | null; price: number | null; surface: number | null;
  rooms: number | null; city: string | null; image_url: string | null; score: number | null; is_new: boolean;
  [key: string]: unknown;
};

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const columns: DataColumn<ListingRow>[] = [
  {
    key: "title", label: d.listings, sortable: false,
    render: (_, r) => (
      <a className="title" href={r.url ?? "#"} target="_blank" rel="noreferrer">
        {r.image_url ? <img className="thumb" src={r.image_url} alt="" loading="lazy" /> : <span className="thumb" />}
        <span>{r.title || `${r.rooms ?? "?"} p · ${r.city ?? ""}`} {r.is_new && <Badge tone="info" size="sm">{d.fresh}</Badge>}</span>
      </a>
    ),
  },
  { key: "price", label: d.price, sortable: true, numeric: true, render: (v) => (v == null ? "–" : eur.format(v as number)) },
  { key: "surface", label: d.surface, sortable: true, numeric: true, render: (v) => (v == null ? "–" : `${Math.round(v as number)} m²`) },
  { key: "rooms", label: d.rooms, sortable: true, numeric: true },
  { key: "city", label: d.city, sortable: true },
  { key: "source", label: d.source, sortable: true },
  { key: "score", label: d.score, sortable: true, numeric: true, render: (v) => (v == null ? "–" : `${v}%`) },
];

export function ListingsTable({ rows }: { rows: ListingRow[] }) {
  const [view, setView] = useState("all");
  const shown = view === "new" ? rows.filter((r) => r.is_new) : rows;
  return (
    <>
      <div className="toolbar">
        <SegmentedControl label={d.listings} value={view} onValueChange={setView}
          options={[{ value: "all", label: d.all }, { value: "new", label: d.newOnly }]} />
      </div>
      <SortableDataTable rows={shown} columns={columns} rowKey={(r) => String(r.id)} caption={d.listings} emptyMessage={d.empty}
        defaultSort={{ key: "price", direction: "asc" }} />
    </>
  );
}
