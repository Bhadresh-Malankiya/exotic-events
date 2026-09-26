"use client";
import { useState } from "react";
import {
  estimateTotal,
  rupees,
  type EstimateProfile,
} from "@/lib/business/schema";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
export function EstimateCalculator({
  profile: p,
}: {
  profile: EstimateProfile;
}) {
  const [values, setValues] = useState<Record<string, number>>({});
  const t = estimateTotal(p, values);
  return (
    <section className="estimate-calculator">
      <div>
        <p className="x-kicker">Find your starting point</p>
        <h2>{p.title}</h2>
        <p>Adjust a few details to see an indicative budget range.</p>
        {p.factors.map((f) => (
          <label key={f.id}>
            <span>
              {f.title}
              <strong>
                {values[f.id] ?? f.defaultValue} {f.unit}
              </strong>
            </span>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={1}
              value={values[f.id] ?? f.defaultValue}
              onChange={(e) =>
                setValues({ ...values, [f.id]: Number(e.target.value) })
              }
            />
          </label>
        ))}
      </div>
      <aside>
        <small>YOUR INDICATIVE RANGE</small>
        <h3>
          {rupees(t.low)}
          <br />
          <span>to {rupees(t.high)}</span>
        </h3>
        <p>{p.note}</p>
        <EnquiryDialog
          triggerLabel="Discuss This Estimate →"
          triggerClassName="x-button x-button-gold"
          initialMessage={`I explored ${p.title}. Indicative range: ${rupees(t.low)} to ${rupees(t.high)}.\n${p.factors.map((f) => `${f.title}: ${values[f.id] ?? f.defaultValue} ${f.unit}`).join("\n")}\n\nMy occasion: `}
        />
      </aside>
    </section>
  );
}
