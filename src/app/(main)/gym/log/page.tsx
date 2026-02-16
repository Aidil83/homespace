"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WorkoutLog } from "@/components/gym/workout-log";

function WorkoutLogWithParams() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;
  return <WorkoutLog date={date} />;
}

export default function GymLogPage() {
  return (
    <Suspense>
      <WorkoutLogWithParams />
    </Suspense>
  );
}
