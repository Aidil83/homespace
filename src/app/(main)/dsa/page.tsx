import Link from "next/link";
import { DailyChallenges } from "@/components/dsa/daily-challenges";
import { DueForReview } from "@/components/dsa/due-for-review";
import { NeetcodeRoadmap } from "@/components/dsa/neetcode-roadmap";
import { RecentActivity } from "@/components/dsa/recent-activity";
import { FlaskConical } from "lucide-react";

export default function DSAPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <DailyChallenges />
      <DueForReview />
      <RecentActivity />
      <NeetcodeRoadmap />
      <Link
        href="/dsa/spaced-repetition-demo"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg transition-colors hover:text-foreground hover:border-muted-foreground/40"
      >
        <FlaskConical className="h-4 w-4" />
        SR Demo
      </Link>
    </div>
  );
}
