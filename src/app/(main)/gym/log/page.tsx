"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const GymQuestWorkoutLog = dynamic(
  () => import("@/components/gym/gymquest-workout-log").then((m) => m.GymQuestWorkoutLog),
  { ssr: false }
);

function WorkoutLogWithParams() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;
  return <GymQuestWorkoutLog date={date} />;
}

export default function GymLogPage() {
  return (
    <Suspense>
      <WorkoutLogWithParams />
    </Suspense>
  );
}
