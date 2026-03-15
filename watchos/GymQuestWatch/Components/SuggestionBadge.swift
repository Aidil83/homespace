import SwiftUI

struct SuggestionBadge: View {
    let suggestion: OverloadSuggestion

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 9))
            Text(suggestion.label)
                .font(.system(size: 10, weight: .semibold))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(color.opacity(0.12))
        .clipShape(Capsule())
    }

    private var icon: String {
        switch suggestion.type {
        case .levelUp:   return "arrow.up.circle.fill"
        case .maintain:  return "arrow.right.circle.fill"
        case .deload:    return "arrow.down.circle.fill"
        case .firstTime: return "star.fill"
        }
    }

    private var color: Color {
        switch suggestion.type {
        case .levelUp:   return GymColors.green
        case .maintain:  return GymColors.orange
        case .deload:    return GymColors.red
        case .firstTime: return GymColors.blue
        }
    }
}
