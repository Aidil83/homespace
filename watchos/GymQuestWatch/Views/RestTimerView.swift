import SwiftUI

struct RestTimerView: View {
    @Environment(WorkoutManager.self) private var manager
    let exerciseIndex: Int
    let setIndex: Int

    @State private var totalTime: Int = 90
    @State private var remaining: Int = 90
    @State private var running: Bool = true
    @State private var timer: Timer?

    // Digital Crown — cumulative adjustment in seconds
    @State private var crownAdjustment: Double = 0

    private var progress: Double {
        guard totalTime > 0 else { return 0 }
        return Double(remaining) / Double(totalTime)
    }

    private var timeStr: String {
        let m = remaining / 60
        let s = remaining % 60
        return String(format: "%d:%02d", m, s)
    }

    private var nextLabel: String {
        let exercise = sampleExercises[exerciseIndex]
        let isLastSet = setIndex >= exercise.sets - 1
        let isLastExercise = exerciseIndex >= sampleExercises.count - 1

        if isLastSet && isLastExercise {
            return "Workout Summary"
        } else if isLastSet {
            return sampleExercises[exerciseIndex + 1].name
        } else {
            return "\(exercise.name) Set \(setIndex + 2)"
        }
    }

    var body: some View {
        VStack(spacing: 8) {
            Text("REST")
                .font(.system(size: 11, weight: .bold))
                .tracking(1)
                .foregroundStyle(GymColors.secondaryLabel)

            // Circular timer
            ZStack {
                ProgressRingView(
                    progress: progress,
                    color: remaining > 0 ? GymColors.green : GymColors.red,
                    lineWidth: 8,
                    size: 120
                )

                Text(timeStr)
                    .font(.system(size: 36, weight: .light).monospacedDigit())
                    .foregroundStyle(GymColors.label)
            }

            // Controls
            HStack(spacing: 10) {
                if remaining > 0 {
                    Button {
                        adjustTime(-60)
                        Haptic.directionDown()
                    } label: {
                        Text("−1m")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(GymColors.secondaryLabel)
                            .frame(width: 36, height: 36)
                            .background(GymColors.grayMid)
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }

                Button {
                    if remaining > 0 {
                        skipTimer()
                    } else {
                        continueWorkout()
                    }
                } label: {
                    Text(remaining > 0 ? "Skip" : "Continue")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(GymColors.label)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 8)
                        .background(GymColors.grayMid)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                if remaining > 0 {
                    Button {
                        adjustTime(60)
                        Haptic.directionUp()
                    } label: {
                        Text("+1m")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(GymColors.secondaryLabel)
                            .frame(width: 36, height: 36)
                            .background(GymColors.grayMid)
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }
            }

            // Next exercise
            Text("Next: \(nextLabel)")
                .font(.system(size: 12))
                .foregroundStyle(GymColors.tertiaryLabel)
        }
        .focusable(true)
        .digitalCrownRotation(
            $crownAdjustment,
            from: -90.0,
            through: 210.0,
            by: 15.0,
            sensitivity: .low,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: crownAdjustment) { oldValue, newValue in
            let delta = Int(newValue) - Int(oldValue)
            if delta != 0 {
                adjustTime(delta)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            crownAdjustment = 0
            startTimer()
        }
        .onDisappear {
            timer?.invalidate()
            timer = nil
        }
    }

    private func startTimer() {
        remaining = totalTime
        running = true
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if remaining > 0 {
                remaining -= 1
                if remaining == 0 {
                    running = false
                    Haptic.notification()
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                        continueWorkout()
                    }
                }
            }
        }
    }

    private func skipTimer() {
        timer?.invalidate()
        remaining = 0
        running = false
        Haptic.tap()
        continueWorkout()
    }

    private func continueWorkout() {
        timer?.invalidate()
        manager.restComplete(exerciseIndex: exerciseIndex, setIndex: setIndex)
    }

    private func adjustTime(_ delta: Int) {
        totalTime = max(15, min(300, totalTime + delta))
        remaining = max(0, min(totalTime, remaining + delta))
    }
}
