"use client";

import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { computeE1RM } from "./gym-utils";

export function E1RMCalculator() {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  const estimated = w > 0 && r > 0 ? computeE1RM(w, r) : null;

  // Reverse Epley: weight = 1RM / (1 + reps/30)
  const repMaxes = estimated
    ? [1, 3, 5, 8, 10].map((rep) => ({
        reps: rep,
        weight: rep === 1 ? estimated : Math.round(estimated / (1 + rep / 30)),
      }))
    : [];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">1RM Calculator</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                Epley Formula
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-medium uppercase text-muted-foreground mb-1 block">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="135"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-medium uppercase text-muted-foreground mb-1 block">
                  Reps
                </label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {estimated && (
              <>
                <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 text-center">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
                    Estimated 1 Rep Max
                  </p>
                  <p className="text-3xl font-extrabold text-purple-400">
                    {estimated} lbs
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {repMaxes.map(({ reps: rep, weight: w }) => (
                    <div
                      key={rep}
                      className="rounded-lg bg-muted/50 p-2 text-center"
                    >
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {rep}RM
                      </p>
                      <p className="text-sm font-bold">{w}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
