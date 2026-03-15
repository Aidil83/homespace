import Foundation

enum SuggestionType {
    case levelUp    // all sets hit rep ceiling → bump weight
    case maintain   // still working within range
    case deload     // declining performance → reduce weight
    case firstTime  // no history yet
}

struct OverloadSuggestion {
    let weight: Int
    let targetReps: Int
    let type: SuggestionType
    let label: String
}

enum OverloadEngine {

    static func suggest(
        for exercise: Exercise,
        history: [ExerciseSetRecord]
    ) -> OverloadSuggestion {
        let range = parseRepRange(exercise.reps)

        // No history → use default weight
        guard !history.isEmpty else {
            return OverloadSuggestion(
                weight: exercise.weight,
                targetReps: range.low,
                type: .firstTime,
                label: "First session"
            )
        }

        // Get last session's sets (most recent sessionDate)
        let lastDate = history.map(\.sessionDate).max()!
        let calendar = Calendar.current
        let lastSets = history
            .filter { calendar.isDate($0.sessionDate, inSameDayAs: lastDate) }
            .sorted { $0.setIndex < $1.setIndex }

        let lastWeight = lastSets.first?.weight ?? exercise.weight

        // Check if all sets hit the rep ceiling
        let allHitCeiling = lastSets.allSatisfy { $0.reps >= range.high }

        if allHitCeiling {
            let newWeight = roundToNearest(lastWeight + exercise.increment, nearest: 5)
            return OverloadSuggestion(
                weight: newWeight,
                targetReps: range.low,
                type: .levelUp,
                label: "↑\(exercise.increment) — hit \(range.high) on all sets"
            )
        }

        // Check for declining trend (need 3+ sessions)
        let sessionDates = Set(history.map { calendar.startOfDay(for: $0.sessionDate) }).sorted()
        if sessionDates.count >= 3 {
            let recent3 = Array(sessionDates.suffix(3))
            let e1rms = recent3.map { date -> Int in
                history
                    .filter { calendar.isDate($0.sessionDate, inSameDayAs: date) }
                    .map(\.e1rm)
                    .max() ?? 0
            }

            // Strictly declining
            if e1rms[0] > e1rms[1] && e1rms[1] > e1rms[2] {
                let deloadWeight = roundToNearest(Int(Double(lastWeight) * 0.9), nearest: 5)
                return OverloadSuggestion(
                    weight: deloadWeight,
                    targetReps: range.high,
                    type: .deload,
                    label: "Deload — performance declining"
                )
            }
        }

        // Default: maintain weight, push for more reps
        let avgReps = lastSets.map(\.reps).reduce(0, +) / max(1, lastSets.count)
        let target = min(avgReps + 1, range.high)
        return OverloadSuggestion(
            weight: lastWeight,
            targetReps: target,
            type: .maintain,
            label: "Aim for \(target) reps"
        )
    }

    static func parseRepRange(_ rangeStr: String) -> (low: Int, high: Int) {
        let parts = rangeStr.split(separator: "-").compactMap { Int($0) }
        if parts.count == 2 {
            return (parts[0], parts[1])
        }
        if let single = parts.first {
            return (single, single)
        }
        return (8, 8)
    }

    private static func roundToNearest(_ value: Int, nearest: Int) -> Int {
        max(nearest, (value / nearest) * nearest)
    }
}
