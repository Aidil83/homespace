import SwiftUI

struct StepperControl: View {
    @Binding var value: Int
    let label: String
    var step: Int = 1
    var minimum: Int = 0
    var fontSize: CGFloat = 32
    var isCrownActive: Bool = false
    var onTap: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: 12) {
            Button {
                value = max(minimum, value - step)
                Haptic.directionDown()
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
                    .foregroundStyle(isCrownActive ? GymColors.green : GymColors.label)

                Text(label)
                    .font(.system(size: 11))
                    .foregroundStyle(isCrownActive ? GymColors.green : GymColors.tertiaryLabel)
            }
            .frame(minWidth: 70)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 10)
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
