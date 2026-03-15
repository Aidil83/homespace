import SwiftUI
import SwiftData

@main
struct GymQuestWatchApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [WorkoutSession.self, ExerciseSetRecord.self])
    }
}
