import SwiftUI

private enum CrownField {
    case weight, reps
}

struct ActiveExerciseView: View {
    @Environment(WorkoutManager.self) private var manager
    let exerciseIndex: Int
    let setIndex: Int

    @State private var weight: Int = 0
    @State private var reps: Int = 8
    @State private var elapsed: Int = 0
    @State private var timer: Timer?

    // Digital Crown
    @State private var crownField: CrownField = .weight
    @State private var crownValue: Double = 0

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
        VStack(spacing: 3) {
            // Status row: stopwatch + HR + set — all on one line
            HStack(spacing: 8) {
                HStack(spacing: 3) {
                    Image(systemName: "stopwatch")
                        .font(.system(size: 9))
                        .foregroundStyle(GymColors.green)
                    Text(elapsedStr)
                        .font(.system(size: 10, weight: .semibold).monospacedDigit())
                        .foregroundStyle(GymColors.green)
                }
                HStack(spacing: 2) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 9))
                        .foregroundStyle(GymColors.red)
                    Text("\(142 + (elapsed % 8))")
                        .font(.system(size: 10, weight: .semibold).monospacedDigit())
                        .foregroundStyle(GymColors.red)
                }
                Spacer()
                Text("Set \(setIndex + 1)/\(exercise.sets)")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(GymColors.secondaryLabel)
            }

            // Weight stepper — no label, it's obviously lbs
            CompactStepper(
                value: $weight,
                step: 5,
                minimum: 0,
                valueFontSize: 28,
                buttonSize: 32,
                isCrownActive: crownField == .weight,
                onTap: { switchCrown(to: .weight) }
            )
            .padding(.top, 2)

            // Reps stepper — label kept for clarity
            CompactStepper(
                value: $reps,
                label: "REPS",
                step: 1,
                minimum: 1,
                valueFontSize: 22,
                buttonSize: 30,
                isCrownActive: crownField == .reps,
                onTap: { switchCrown(to: .reps) }
            )

            // 1RM + previous ref
            HStack(spacing: 0) {
                if isPR {
                    Text("🏆 ")
                        .font(.system(size: 11))
                }
                Text("1RM: \(e1rm)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(isPR ? GymColors.gold : GymColors.orange)
                Text("  prev \(exercise.prevWeight)×\(exercise.prevReps)")
                    .font(.system(size: 10))
                    .foregroundStyle(GymColors.tertiaryLabel)
            }
            .padding(.top, 2)

            // Complete Set
            Button {
                if isPR { Haptic.notification() } else { Haptic.success() }
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
                    .padding(.vertical, 10)
                    .background(GymColors.green)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .padding(.horizontal, 6)
        .focusable(true)
        .digitalCrownRotation(
            $crownValue,
            from: crownField == .weight ? 0.0 : 1.0,
            through: crownField == .weight ? 500.0 : 50.0,
            by: crownField == .weight ? 5.0 : 1.0,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: crownValue) { _, newValue in
            switch crownField {
            case .weight:
                weight = max(0, Int(newValue))
            case .reps:
                reps = max(1, Int(newValue))
            }
        }
        .navigationTitle(exercise.name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            weight = exercise.weight
            reps = 8
            elapsed = 0
            crownField = .weight
            crownValue = Double(exercise.weight)
            timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
                elapsed += 1
            }
        }
        .onDisappear {
            timer?.invalidate()
            timer = nil
        }
    }

    private func switchCrown(to field: CrownField) {
        crownField = field
        switch field {
        case .weight:
            crownValue = Double(weight)
        case .reps:
            crownValue = Double(reps)
        }
    }
}

/// Compact inline stepper for watch
private struct CompactStepper: View {
    @Binding var value: Int
    var label: String? = nil
    var step: Int = 1
    var minimum: Int = 0
    var valueFontSize: CGFloat = 28
    var buttonSize: CGFloat = 32
    var isCrownActive: Bool = false
    var onTap: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: 8) {
            Button {
                value = max(minimum, value - step)
                Haptic.directionDown()
            } label: {
                Image(systemName: "minus")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(GymColors.label)
                    .frame(width: buttonSize, height: buttonSize)
                    .background(GymColors.grayMid)
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)

            VStack(spacing: 0) {
                Text("\(value)")
                    .font(.system(size: valueFontSize, weight: .bold).monospacedDigit())
                    .foregroundStyle(isCrownActive ? GymColors.green : GymColors.label)
                if let label {
                    Text(label)
                        .font(.system(size: 9))
                        .foregroundStyle(isCrownActive ? GymColors.green : GymColors.tertiaryLabel)
                }
            }
            .frame(minWidth: 60)
            .padding(.vertical, 2)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isCrownActive ? GymColors.green.opacity(0.5) : Color.clear, lineWidth: 1.5)
            )
            .contentShape(Rectangle())
            .onTapGesture {
                onTap?()
                Haptic.tap()
            }

            Button {
                value += step
                Haptic.directionUp()
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(GymColors.label)
                    .frame(width: buttonSize, height: buttonSize)
                    .background(GymColors.grayMid)
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)
        }
    }
}
