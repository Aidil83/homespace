import SwiftUI

struct ExerciseListView: View {
    @Environment(WorkoutManager.self) private var manager

    private var doneCount: Int {
        sampleExercises.indices.filter { manager.completedExercises.contains($0) }.count
    }

    private var nextIndex: Int? {
        sampleExercises.indices.first { !manager.completedExercises.contains($0) }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("FULL BODY")
                        .font(.system(size: 11, weight: .bold))
                        .tracking(1)
                        .foregroundStyle(GymColors.secondaryLabel)
                    Spacer()
                    Text("\(doneCount)/8")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(GymColors.green)
                }
                .padding(.horizontal, 4)
                .padding(.bottom, 8)

                // Exercise rows
                ForEach(Array(sampleExercises.enumerated()), id: \.element.id) { index, exercise in
                    let isDone = manager.completedExercises.contains(index)
                    let isNext = index == nextIndex

                    Button {
                        manager.navigateToExercise(index: index)
                    } label: {
                        ExerciseRowView(
                            exercise: exercise,
                            index: index,
                            isDone: isDone,
                            isNext: isNext
                        )
                    }
                    .buttonStyle(.plain)

                    if index < sampleExercises.count - 1 {
                        Divider()
                            .background(GymColors.grayMid)
                    }
                }

                // End Workout
                Button {
                    Haptic.stop()
                    manager.endWorkout()
                } label: {
                    Text("End Workout")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(GymColors.red)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(GymColors.red.opacity(0.15))
                        .overlay(
                            RoundedRectangle(cornerRadius: 18)
                                .stroke(GymColors.red.opacity(0.3), lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 18))
                }
                .buttonStyle(.plain)
                .padding(.top, 12)
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Exercises")
        .navigationBarTitleDisplayMode(.inline)
    }
}
