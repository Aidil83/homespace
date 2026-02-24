import { DailyChallenges } from "@/components/dsa/daily-challenges";
import { NeetcodeRoadmap } from "@/components/dsa/neetcode-roadmap";

export default function DSAPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <DailyChallenges />
      <NeetcodeRoadmap />
    </div>
  );
}
