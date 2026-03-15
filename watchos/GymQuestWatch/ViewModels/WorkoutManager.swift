import SwiftUI
import SwiftData

struct SessionPR: Identifiable {
    let id: Int // exercise id
    let exerciseName: String
    let e1rm: Int
}

@Observable
final class WorkoutManager {
    var path: [AppRoute] = []
    var completedExercises: Set<Int> = []
    var setWeights: [String: Int] = [:]  // "exerciseIndex-setIndex" -> weight
    var setReps: [String: Int] = [:]     // "exerciseIndex-setIndex" -> reps
    var workoutStartTime: Date?
    var workoutElapsed: TimeInterval = 0
    var modelContext: ModelContext?

    // Progressive overload
    var suggestions: [Int: OverloadSuggestion] = [:]
    var sessionPRs: [SessionPR] = []
    var currentStreak: Int = 0

    var isWorkoutActive: Bool {
        workoutStartTime != nil
    }

    func refreshStreak() {
        currentStreak = calculateStreak()
    }

    func startWorkout() {
        completedExercises = []
        setWeights = [:]
        setReps = [:]
        workoutStartTime = Date()
        workoutElapsed = 0
        sessionPRs = []

        // Pre-compute suggestions for all exercises
        for (index, exercise) in sampleExercises.enumerated() {
            suggestions[index] = computeSuggestion(for: exercise)
        }

        path = [.exerciseList]
    }

    func navigateToExercise(index: Int, setIndex: Int = 0) {
        path.append(.activeExercise(exerciseIndex: index, setIndex: setIndex))
    }

    func completeSet(exerciseIndex: Int, setIndex: Int, weight: Int, reps: Int) {
        let key = "\(exerciseIndex)-\(setIndex)"
        setWeights[key] = weight
        setReps[key] = reps

        let exercise = sampleExercises[exerciseIndex]
        if setIndex >= exercise.sets - 1 {
            completedExercises.insert(exerciseIndex)
        }

        // Check for PR
        checkForPR(exerciseIndex: exerciseIndex, weight: weight, reps: reps)

        // Keep stack clean: exerciseList → restTimer
        path = [.exerciseList, .restTimer(exerciseIndex: exerciseIndex, setIndex: setIndex)]
    }

    func restComplete(exerciseIndex: Int, setIndex: Int) {
        let exercise = sampleExercises[exerciseIndex]
        let isLastSet = setIndex >= exercise.sets - 1
        let isLastExercise = exerciseIndex >= sampleExercises.count - 1

        if isLastSet {
            completedExercises.insert(exerciseIndex)
        }

        if isLastSet && isLastExercise {
            endWorkout()
        } else if isLastSet {
            // Back to exercise list, push next exercise
            path = [.exerciseList, .activeExercise(exerciseIndex: exerciseIndex + 1, setIndex: 0)]
        } else {
            // Back to exercise list, push next set
            path = [.exerciseList, .activeExercise(exerciseIndex: exerciseIndex, setIndex: setIndex + 1)]
        }
    }

    func endWorkout() {
        if let start = workoutStartTime {
            workoutElapsed = Date().timeIntervalSince(start)
        }
        saveWorkout()
        path = [.summary]
    }

    func finishSummary() {
        workoutStartTime = nil
        suggestions = [:]
        sessionPRs = []
        refreshStreak()
        path = []
    }

    var formattedDuration: String {
        let total = Int(workoutElapsed > 0 ? workoutElapsed : (workoutStartTime.map { Date().timeIntervalSince($0) } ?? 0))
        let m = total / 60
        let s = total % 60
        return String(format: "%d:%02d", m, s)
    }

    // MARK: - Persistence

    private func saveWorkout() {
        guard let context = modelContext, let start = workoutStartTime else { return }

        let sessionId = UUID()
        let session = WorkoutSession(id: sessionId, date: start, duration: workoutElapsed)
        context.insert(session)

        for (key, weight) in setWeights {
            let parts = key.split(separator: "-").compactMap { Int($0) }
            guard parts.count == 2 else { continue }
            let exerciseIndex = parts[0]
            let setIndex = parts[1]
            let reps = setReps[key] ?? 0

            let record = ExerciseSetRecord(
                sessionId: sessionId,
                sessionDate: start,
                exerciseId: sampleExercises[exerciseIndex].id,
                setIndex: setIndex,
                weight: weight,
                reps: reps
            )
            context.insert(record)
        }

        try? context.save()
    }

    // MARK: - Suggestions

    func computeSuggestion(for exercise: Exercise) -> OverloadSuggestion {
        guard let context = modelContext else {
            return OverloadSuggestion(
                weight: exercise.weight,
                targetReps: OverloadEngine.parseRepRange(exercise.reps).low,
                type: .firstTime,
                label: "First session"
            )
        }

        let exerciseId = exercise.id
        let descriptor = FetchDescriptor<ExerciseSetRecord>(
            predicate: #Predicate<ExerciseSetRecord> { $0.exerciseId == exerciseId },
            sortBy: [SortDescriptor(\.sessionDate, order: .reverse)]
        )

        let history = (try? context.fetch(descriptor)) ?? []
        return OverloadEngine.suggest(for: exercise, history: history)
    }

    // MARK: - PR Detection

    func bestHistoricalE1RM(for exerciseId: Int) -> Int {
        guard let context = modelContext else { return 0 }

        let descriptor = FetchDescriptor<ExerciseSetRecord>(
            predicate: #Predicate<ExerciseSetRecord> { $0.exerciseId == exerciseId }
        )

        let history = (try? context.fetch(descriptor)) ?? []
        return history.map(\.e1rm).max() ?? 0
    }

    private func checkForPR(exerciseIndex: Int, weight: Int, reps: Int) {
        let exercise = sampleExercises[exerciseIndex]
        let currentE1RM = E1RMCalculator.estimate(weight: weight, reps: reps)

        // Compare against best historical e1RM, fallback to seed data
        let bestHistorical = bestHistoricalE1RM(for: exercise.id)
        let baseline = bestHistorical > 0
            ? bestHistorical
            : E1RMCalculator.estimate(weight: exercise.prevWeight, reps: exercise.prevReps)

        guard currentE1RM > baseline && currentE1RM > 0 else { return }

        if let idx = sessionPRs.firstIndex(where: { $0.id == exercise.id }) {
            if currentE1RM > sessionPRs[idx].e1rm {
                sessionPRs[idx] = SessionPR(id: exercise.id, exerciseName: exercise.name, e1rm: currentE1RM)
            }
        } else {
            sessionPRs.append(SessionPR(id: exercise.id, exerciseName: exercise.name, e1rm: currentE1RM))
        }
    }

    // MARK: - Streak

    private func calculateStreak() -> Int {
        guard let context = modelContext else { return 0 }

        let descriptor = FetchDescriptor<WorkoutSession>(
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        guard let sessions = try? context.fetch(descriptor), !sessions.isEmpty else { return 0 }

        let calendar = Calendar.current
        let uniqueDays = Set(sessions.map { calendar.startOfDay(for: $0.date) }).sorted(by: >)

        let today = calendar.startOfDay(for: Date())
        guard let mostRecent = uniqueDays.first else { return 0 }

        // If last workout was more than 2 days ago, streak is broken
        let daysSince = calendar.dateComponents([.day], from: mostRecent, to: today).day ?? 0
        if daysSince > 2 { return 0 }

        var streak = 1
        for i in 1..<uniqueDays.count {
            let gap = calendar.dateComponents([.day], from: uniqueDays[i], to: uniqueDays[i - 1]).day ?? 0
            if gap <= 2 { // allow 1 rest day between workouts
                streak += 1
            } else {
                break
            }
        }

        return streak
    }
}
