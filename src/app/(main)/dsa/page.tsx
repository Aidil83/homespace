import { ProblemList } from "@/components/dsa/problem-list";
import { DailyChallenges } from "@/components/dsa/daily-challenges";

export default function DSAPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <DailyChallenges />
      <ProblemList />
    </div>
  );
}
