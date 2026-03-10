import SwiftUI

struct ActiveExerciseView: View {
    @Environment(WorkoutManager.self) private var manager
    let exerciseIndex: Int
    let setIndex: Int

    @State private var weight: Int = 0
    @State private var reps: Int = 8
    @State private var elapsed: Int = 0
    @State private var timer: Timer?

    private var exercise: Exercise { sampleExercises[exerciseIndex] }
    private var e1rm: Int { E1RMCalculator.estimate(weight: weight, reps: reps) }
    private var prev1rm: Int { E1RMCalculator.estimate(weight: exercise.prevWeight, reps: exercise.prevReps) }
    private var isPR: Bool { e1rm > prev1rm && e1rm > 0 }

    private var elapsedStr: String {
        let m = elapsed / 60
        let s = elapsed % 60
        return String(format: "%d:%02d", m, s)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                // Stopwatch + Heart rate
                HStack(spacing: 12) {
                    // Stopwatch
                    HStack(spacing: 4) {
                        Image(systemName: "stopwatch")
                            .font(.system(size: 10))
                            .foregroundStyle(GymColors.green)
                        Text(elapsedStr)
                            .font(.system(size: 12, weight: .semibold).monospacedDigit())
                            .foregroundStyle(GymColors.green)
                    }
                    // Heart rate
                    HStack(spacing: 3) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(GymColors.red)
                        Text("\(142 + (elapsed % 8))")
                            .font(.system(size: 12, weight: .semibold).monospacedDigit())
                            .foregroundStyle(GymColors.red)
                    }
                }

                // Exercise name
                Text(exercise.name)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(GymColors.label)

                // Set dots
                SetDotsView(current: setIndex, total: exercise.sets)
                    .padding(.vertical, 2)

                Text("Set \(setIndex + 1) / \(exercise.sets)")
                    .font(.system(size: 11))
                    .foregroundStyle(GymColors.secondaryLabel)

                // Weight stepper
                StepperControl(
                    value: $weight,
                    label: "LBS",
                    step: 5,
                    minimum: 0,
                    fontSize: 32
                )
                .padding(.top, 4)

                // Reps stepper
                StepperControl(
                    value: $reps,
                    label: "REPS",
                    step: 1,
                    minimum: 1,
                    fontSize: 26
                )

                // 1RM display
                VStack(spacing: 2) {
                    Text(isPR ? "🏆 1RM: \(e1rm) lbs PR!" : "1RM: \(e1rm) lbs")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(isPR ? GymColors.gold : GymColors.orange)

                    if isPR {
                        Text("+\(e1rm - prev1rm) lbs over previous")
                            .font(.system(size: 10))
                            .foregroundStyle(GymColors.gold)
                    }
                }
                .padding(.top, 8)

                // Previous reference
                Text("\(exercise.prevWeight) lbs × \(exercise.prevReps) reps")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(GymColors.secondaryLabel)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 3)
                    .background(GymColors.grayDark)
                    .clipShape(Capsule())
                    .padding(.top, 4)

                // Complete Set
                Button {
                    manager.completeSet(
                        exerciseIndex: exerciseIndex,
                        setIndex: setIndex,
                        weight: weight,
                        reps: reps
                    )
                } label: {
                    Text("Complete Set")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(GymColors.green)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                }
                .buttonStyle(.plain)
                .padding(.top, 8)
            }
            .padding(.horizontal, 4)
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            weight = exercise.weight
            reps = 8
            elapsed = 0
            timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
                elapsed += 1
            }
        }
        .onDisappear {
            timer?.invalidate()
            timer = nil
        }
    }
}
