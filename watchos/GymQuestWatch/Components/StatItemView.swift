import SwiftUI

struct StatItemView: View {
    let label: String
    let value: String
    var highlight: Bool = false

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(highlight ? GymColors.gold : GymColors.label)
                .lineLimit(1)

            Text(label.uppercased())
                .font(.system(size: 10))
                .tracking(0.5)
                .foregroundStyle(highlight ? GymColors.gold : GymColors.tertiaryLabel)
        }
    }
}
