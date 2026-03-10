import SwiftUI

@Observable
final class WorkoutManager {
    var path: [AppRoute] = []
    var completedExercises: Set<Int> = []
    var setWeights: [String: Int] = [:]  // "exerciseIndex-setIndex" -> weight
    var setReps: [String: Int] = [:]     // "exerciseIndex-setIndex" -> reps
    var workoutStartTime: Date?
    var workoutElapsed: TimeInterval = 0

    var isWorkoutActive: Bool {
        workoutStartTime != nil
    }

    func startWorkout() {
        completedExercises = []
        setWeights = [:]
        setReps = [:]
        workoutStartTime = Date()
        workoutElapsed = 0
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
        path = [.summary]
    }

    func finishSummary() {
        workoutStartTime = nil
        path = []
    }

    var formattedDuration: String {
        let total = Int(workoutElapsed > 0 ? workoutElapsed : (workoutStartTime.map { Date().timeIntervalSince($0) } ?? 0))
        let m = total / 60
        let s = total % 60
        return String(format: "%d:%02d", m, s)
    }
}
