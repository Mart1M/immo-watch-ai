"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/arc/switch/switch";
import { Select } from "@/components/arc/select/select";
import { Button } from "@/components/arc/button/button";
import { runSearch, updateSearch } from "@/app/actions";
import { dictionary as d } from "@/lib/i18n";

export function SearchControls({ id, active, interval }: { id: number; active: boolean; interval: number }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <div className="row">
      <Switch checked={active} aria-label={d.active} onCheckedChange={(v) => start(() => updateSearch(id, { active: v }))} />
      <Select label={d.every} value={String(interval)} onValueChange={(v) => start(() => updateSearch(id, { intervalMinutes: Number(v) }))}
        options={[{ value: "15", label: "15 min" }, { value: "60", label: d.h1 }, { value: "360", label: d.h6 }, { value: "1440", label: d.h24 }]} />
      <Button size="sm" variant="secondary" loading={pending}
        onClick={() => start(async () => setMsg((await runSearch(id)) ? d.started : d.agentDown))}>{d.runNow}</Button>
      {msg && <span className="muted">{msg}</span>}
    </div>
  );
}
