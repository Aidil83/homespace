import SwiftUI

struct StepperControl: View {
    @Binding var value: Int
    let label: String
    var step: Int = 1
    var minimum: Int = 0
    var fontSize: CGFloat = 32

    var body: some View {
        HStack(spacing: 12) {
            Button {
                value = max(minimum, value - step)
            } label: {
                Text("−")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(GymColors.label)
                    .frame(width: 40, height: 40)
                    .background(GymColors.grayMid)
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)

            VStack(spacing: 2) {
                Text("\(value)")
                    .font(.system(size: fontSize, weight: .bold).monospacedDigit())
                    .foregroundStyle(GymColors.label)

                Text(label)
                    .font(.system(size: 11))
                    .foregroundStyle(GymColors.tertiaryLabel)
            }
            .frame(minWidth: 70)

            Button {
                value += step
            } label: {
                Text("+")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(GymColors.label)
                    .frame(width: 40, height: 40)
                    .background(GymColors.grayMid)
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)
        }
    }
}
