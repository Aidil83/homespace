import SwiftUI

struct WorkoutSummaryView: View {
    @Environment(WorkoutManager.self) private var manager
    @State private var showCheck = false
    @State private var showConfetti = false

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                // Animated checkmark
                ZStack {
                    Circle()
                        .fill(GymColors.green)
                        .frame(width: 52, height: 52)

                    Image(systemName: "checkmark")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(.black)
                }
                .scaleEffect(showCheck ? 1 : 0)
                .animation(.spring(response: 0.4, dampingFraction: 0.6), value: showCheck)

                Text("Workout Complete!")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(GymColors.label)

                // PR callout
                HStack(spacing: 6) {
                    Text("🏆")
                        .font(.system(size: 14))
                    Text("New PR! Squats 1RM: 171 lbs")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(GymColors.gold)
                }
                .padding(.vertical, 5)
                .padding(.horizontal, 14)
                .background(GymColors.gold.opacity(0.12))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(GymColors.gold.opacity(0.25), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 14))

                // Stats grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    StatItemView(label: "PRs Hit", value: "1 🏆", highlight: true)
                    StatItemView(label: "Exercises", value: "\(manager.completedExercises.count)/8")
                    StatItemView(label: "Duration", value: manager.formattedDuration)
                    StatItemView(label: "Streak", value: "12 days 🔥")
                }
                .padding(.top, 8)

                // Done button
                Button {
                    manager.finishSummary()
                } label: {
                    Text("Done")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(GymColors.label)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(GymColors.grayMid)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                }
                .buttonStyle(.plain)
                .padding(.top, 12)
            }
            .padding(.horizontal, 4)
        }
        .navigationBarBackButtonHidden(true)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            withAnimation {
                showCheck = true
            }
        }
    }
}
