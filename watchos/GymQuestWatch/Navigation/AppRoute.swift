import Foundation

enum AppRoute: Hashable {
    case home
    case exerciseList
    case activeExercise(exerciseIndex: Int, setIndex: Int)
    case restTimer(exerciseIndex: Int, setIndex: Int)
    case summary
}
