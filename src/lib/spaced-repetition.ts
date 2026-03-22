export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ReviewState {
  intervalDays: number;
  nextReviewDate: string; // "YYYY-MM-DD"
  reviewCount: number;
  mastered: boolean;
  masteryStreak: number;
}

export type ReviewStatus = "mastered" | "overdue" | "due" | "scheduled" | "none";

export const RATING_LABELS: Record<Rating, { label: string; description: string }> = {
  1: { label: "Blank", description: "Had no idea, needed the solution" },
  2: { label: "Struggled", description: "Right direction but couldn't finish" },
  3: { label: "Slow", description: "Solved it but took too long" },
  4: { label: "Good", description: "Solved with minor hesitation" },
  5: { label: "Nailed", description: "Quick and confident" },
};

/**
 * 5-point spaced repetition algorithm.
 *
 * 1 (Blank):     learning phase, review in 1 day
 * 2 (Struggled): learning phase, review in 2 days
 * 3 (Slow):      review phase, moderate interval
 * 4 (Good):      review phase, double interval
 * 5 (Nailed):    review phase, 2.5x interval
 *
 * Mastery: 3 consecutive ratings of 4 or 5.
 * Rating 1-2 resets the mastery streak.
 * Rating 3 keeps the streak but doesn't advance it.
 */
export function computeNextReview(
  rating: Rating,
  currentIntervalDays: number,
  currentReviewCount: number,
  currentMasteryStreak: number
): ReviewState {
  let intervalDays: number;
  let masteryStreak: number;

  switch (rating) {
    case 1:
      intervalDays = 1;
      masteryStreak = 0;
      break;
    case 2:
      intervalDays = 2;
      masteryStreak = 0;
      break;
    case 3:
      intervalDays =
        currentIntervalDays === 0
          ? 4
          : Math.max(3, Math.floor(currentIntervalDays * 0.75));
      masteryStreak = currentMasteryStreak; // no change
      break;
    case 4:
      intervalDays =
        currentIntervalDays === 0
          ? 7
          : Math.min(Math.floor(currentIntervalDays * 2), 120);
      masteryStreak = currentMasteryStreak + 1;
      break;
    case 5:
      intervalDays =
        currentIntervalDays === 0
          ? 14
          : Math.min(Math.floor(currentIntervalDays * 2.5), 120);
      masteryStreak = currentMasteryStreak + 1;
      break;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const nextReviewDate = nextDate.toISOString().split("T")[0];

  const reviewCount = currentReviewCount + 1;
  const mastered = masteryStreak >= 3;

  return { intervalDays, nextReviewDate, reviewCount, mastered, masteryStreak };
}

/**
 * Determine the review status of a problem.
 */
export function getReviewStatus(
  nextReviewDate: string | null,
  mastered: boolean
): ReviewStatus {
  if (mastered) return "mastered";
  if (!nextReviewDate) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(nextReviewDate + "T00:00:00");
  const diffMs = today.getTime() - reviewDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 2) return "overdue";
  if (diffDays >= 0) return "due";
  return "scheduled";
}

/**
 * Format interval days for display.
 */
export function formatInterval(days: number): string {
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

/**
 * Get what each rating would produce given the current interval.
 */
export function getIntervalPreview(currentIntervalDays: number): Record<Rating, string> {
  return {
    1: "1d",
    2: "2d",
    3: formatInterval(currentIntervalDays === 0 ? 4 : Math.max(3, Math.floor(currentIntervalDays * 0.75))),
    4: formatInterval(currentIntervalDays === 0 ? 7 : Math.min(Math.floor(currentIntervalDays * 2), 120)),
    5: formatInterval(currentIntervalDays === 0 ? 14 : Math.min(Math.floor(currentIntervalDays * 2.5), 120)),
  };
}
