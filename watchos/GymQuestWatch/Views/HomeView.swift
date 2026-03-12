import SwiftUI

struct HomeView: View {
    @Environment(WorkoutManager.self) private var manager

    // Mon=2, Thu=5, Sat=7 in Calendar.current.component(.weekday)
    // weekday: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    private var isWorkoutDay: Bool {
        let weekday = Calendar.current.component(.weekday, from: Date())
        return [2, 5, 7].contains(weekday) // Mon, Thu, Sat
    }

    private var todayLabel: String {
        isWorkoutDay ? "Full Body 💪" : "Rest Day 💤"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Workout type
                VStack(spacing: 4) {
                    Text("GYMQUEST")
                        .font(.system(size: 11, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(GymColors.secondaryLabel)

                    Text(todayLabel)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(GymColors.label)
                }

                // Streak
                if manager.currentStreak > 0 {
                    HStack(spacing: 6) {
                        Text("🔥")
                            .font(.system(size: 14))
                        Text("\(manager.currentStreak) Day Streak")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(GymColors.orange)
                    }
                    .padding(.vertical, 6)
                    .padding(.horizontal, 14)
                    .background(GymColors.orange.opacity(0.12))
                    .clipShape(Capsule())
                } else {
                    Text("Start your streak!")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(GymColors.tertiaryLabel)
                }

                if isWorkoutDay {
                    // Exercise count
                    Text("8 exercises")
                        .font(.system(size: 13))
                        .foregroundStyle(GymColors.tertiaryLabel)

                    // Start button
                    Button {
                        Haptic.start()
                        manager.startWorkout()
                    } label: {
                        Text("Start Workout")
                            .font(.system(size: 17, weight: .bold))
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(GymColors.green)
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 4)
                }
            }
            .padding(.horizontal, 8)
        }
        .navigationBarHidden(true)
    }
}
