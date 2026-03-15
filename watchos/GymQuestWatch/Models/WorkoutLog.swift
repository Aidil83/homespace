import Foundation
import SwiftData

@Model
final class WorkoutSession {
    var id: UUID
    var date: Date
    var duration: TimeInterval

    init(id: UUID = UUID(), date: Date = Date(), duration: TimeInterval = 0) {
        self.id = id
        self.date = date
        self.duration = duration
    }
}

@Model
final class ExerciseSetRecord {
    var sessionId: UUID
    var sessionDate: Date
    var exerciseId: Int
    var setIndex: Int
    var weight: Int
    var reps: Int

    init(sessionId: UUID, sessionDate: Date, exerciseId: Int, setIndex: Int, weight: Int, reps: Int) {
        self.sessionId = sessionId
        self.sessionDate = sessionDate
        self.exerciseId = exerciseId
        self.setIndex = setIndex
        self.weight = weight
        self.reps = reps
    }

    var e1rm: Int {
        E1RMCalculator.estimate(weight: weight, reps: reps)
    }
}
