import SwiftUI

struct ContentView: View {
    @State private var manager = WorkoutManager()

    var body: some View {
        NavigationStack(path: $manager.path) {
            HomeView()
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .home:
                        HomeView()
                    case .exerciseList:
                        ExerciseListView()
                    case .activeExercise(let exerciseIndex, let setIndex):
                        ActiveExerciseView(exerciseIndex: exerciseIndex, setIndex: setIndex)
                    case .restTimer(let exerciseIndex, let setIndex):
                        RestTimerView(exerciseIndex: exerciseIndex, setIndex: setIndex)
                    case .summary:
                        WorkoutSummaryView()
                    }
                }
        }
        .environment(manager)
    }
}
