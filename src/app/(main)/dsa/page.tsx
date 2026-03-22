import { DailyChallenges } from "@/components/dsa/daily-challenges";
import { DueForReview } from "@/components/dsa/due-for-review";
import { NeetcodeRoadmap } from "@/components/dsa/neetcode-roadmap";
import { RecentActivity } from "@/components/dsa/recent-activity";

export default function DSAPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <DailyChallenges />
      <DueForReview />
      <RecentActivity />
      <NeetcodeRoadmap />
    </div>
  );
}
