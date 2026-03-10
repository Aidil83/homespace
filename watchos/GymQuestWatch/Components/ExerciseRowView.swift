import SwiftUI

struct ExerciseRowView: View {
    let exercise: Exercise
    let index: Int
    let isDone: Bool
    let isNext: Bool

    var body: some View {
        HStack(spacing: 10) {
            // Accent color stripe
            RoundedRectangle(cornerRadius: 2)
                .fill(GymColors.accent(for: index))
                .frame(width: 4, height: 32)

            // Exercise info
            VStack(alignment: .leading, spacing: 1) {
                Text(exercise.name)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(GymColors.label)
                    .lineLimit(1)

                Text("\(exercise.sets)×\(exercise.reps)")
                    .font(.system(size: 12))
                    .foregroundStyle(GymColors.tertiaryLabel)
            }

            Spacer()

            // NEXT badge or checkmark
            if isNext {
                Text("NEXT")
                    .font(.system(size: 8, weight: .bold))
                    .tracking(0.5)
                    .foregroundStyle(GymColors.accent(for: index))
            }

            // Completion indicator
            ZStack {
                Circle()
                    .stroke(isDone ? Color.clear : GymColors.gray, lineWidth: 2)
                    .frame(width: 22, height: 22)

                if isDone {
                    Circle()
                        .fill(GymColors.green)
                        .frame(width: 22, height: 22)

                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(.black)
                }
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 8)
        .background(
            isNext
                ? GymColors.accent(for: index).opacity(0.08)
                : Color.clear
        )
        .clipShape(RoundedRectangle(cornerRadius: isNext ? 10 : 0))
    }
}
