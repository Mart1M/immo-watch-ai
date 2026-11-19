"use client";

import { useState, useTransition } from "react";
import { Stepper } from "@/components/arc/stepper/stepper";
import { Button } from "@/components/arc/button/button";
import { Input } from "@/components/arc/input/input";
import { Textarea } from "@/components/arc/textarea/textarea";
import { NumberField } from "@/components/arc/number-field/number-field";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { TagInput } from "@/components/arc/tag-input/tag-input";
import { ChipGroup } from "@/components/arc/chip-group/chip-group";
import { Select } from "@/components/arc/select/select";
import { createSearch } from "@/app/actions";
import { dictionary as d } from "@/lib/i18n";

const SOURCES = ["bienici", "pap", "seloger"];

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [transaction, setTransaction] = useState<"buy" | "rent">("buy");
  const [types, setTypes] = useState<string[]>(["flat"]);
  const [locations, setLocations] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(250000);
  const [minSurface, setMinSurface] = useState(40);
  const [minRooms, setMinRooms] = useState(2);
  const [notes, setNotes] = useState("");
  const [sources, setSources] = useState<string[]>(SOURCES);
  const [interval, setIntervalMin] = useState("360");
  const [error, setError] = useState("");

  const next = () => {
    if (step === 1 && locations.length === 0) return setError(d.needPlace);
    setError("");
    setStep(step + 1);
  };

  const submit = () =>
    start(async () => {
      await createSearch({
        name: `${locations.join(", ")} · ${transaction === "buy" ? d.buy : d.rent}`,
        criteria: { transaction, propertyTypes: types, locations, maxPrice, minSurface, minRooms, notes: notes || undefined },
        sources,
        intervalMinutes: Number(interval),
      });
    });

  return (
    <div className="onboard">
      <Stepper compact current={step} steps={[{ id: "1", label: d.step1 }, { id: "2", label: d.step2 }, { id: "3", label: d.step3 }]} />
      <h1>{d.welcome}</h1>

      {step === 0 && (
        <div className="stack">
          <SegmentedControl fullWidth label={d.step1} value={transaction} onValueChange={(v) => setTransaction(v as "buy" | "rent")}
            options={[{ value: "buy", label: d.buy }, { value: "rent", label: d.rent }]} />
          <ChipGroup label={d.step1} multiple value={types} onValueChange={setTypes}
            options={[{ value: "flat", label: d.flat }, { value: "house", label: d.house }]} />
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <TagInput label={d.where} placeholder={d.whereHint} value={locations} onValueChange={setLocations} />
          <NumberField label={d.maxPrice} value={maxPrice} onValueChange={setMaxPrice} min={0} step={transaction === "buy" ? 5000 : 50} suffix=" €" />
          <div className="grid2">
            <NumberField label={d.minSurface} value={minSurface} onValueChange={setMinSurface} min={0} step={5} suffix=" m²" />
            <NumberField label={d.minRooms} value={minRooms} onValueChange={setMinRooms} min={1} max={10} />
          </div>
          {error && <span className="err">{error}</span>}
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <Textarea label={d.notes} placeholder={d.notesHint} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <ChipGroup label={d.sources} multiple value={sources} onValueChange={setSources}
            options={SOURCES.map((s) => ({ value: s, label: s }))} />
          <Select label={d.frequency} value={interval} onValueChange={setIntervalMin}
            options={[{ value: "60", label: d.h1 }, { value: "360", label: d.h6 }, { value: "1440", label: d.h24 }]} />
        </div>
      )}

      <div className="actions">
        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>{d.back}</Button>
        {step < 2 ? <Button onClick={next}>{d.next}</Button> : <Button onClick={submit} loading={pending} disabled={sources.length === 0}>{d.start}</Button>}
      </div>
    </div>
  );
}
