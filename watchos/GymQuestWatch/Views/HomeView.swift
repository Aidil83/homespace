import SwiftUI

struct HomeView: View {
    @Environment(WorkoutManager.self) private var manager

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Workout type
                VStack(spacing: 4) {
                    Text("GYMQUEST")
                        .font(.system(size: 11, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(GymColors.secondaryLabel)

                    Text("Full Body 💪")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(GymColors.label)
                }

                // Streak
                HStack(spacing: 6) {
                    Text("🔥")
                        .font(.system(size: 14))
                    Text("12 Day Streak")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(GymColors.orange)
                }
                .padding(.vertical, 6)
                .padding(.horizontal, 14)
                .background(GymColors.orange.opacity(0.12))
                .clipShape(Capsule())

                // Exercise count
                Text("8 exercises")
                    .font(.system(size: 13))
                    .foregroundStyle(GymColors.tertiaryLabel)

                // Start button
                Button {
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
            .padding(.horizontal, 8)
        }
        .navigationBarHidden(true)
    }
}
