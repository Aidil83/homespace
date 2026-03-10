import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >> 8) & 0xFF) / 255,
            blue: Double(rgb & 0xFF) / 255
        )
    }
}

enum GymColors {
    static let green = Color(hex: "#30d158")
    static let red = Color(hex: "#ff453a")
    static let orange = Color(hex: "#ff9f0a")
    static let blue = Color(hex: "#0a84ff")
    static let gold = Color(hex: "#eab308")
    static let purple = Color(hex: "#bf5af2")

    static let label = Color.white
    static let secondaryLabel = Color(hex: "#ebebf5").opacity(0.6)
    static let tertiaryLabel = Color(hex: "#ebebf5").opacity(0.3)
    static let grayMid = Color(hex: "#2c2c2e")
    static let grayDark = Color(hex: "#1c1c1e")
    static let gray = Color(hex: "#48484a")

    static func accent(for index: Int) -> Color {
        let colors: [Color] = [
            Color(hex: "#ef4444"), Color(hex: "#f97316"), Color(hex: "#eab308"), Color(hex: "#22c55e"),
            Color(hex: "#06b6d4"), Color(hex: "#3b82f6"), Color(hex: "#8b5cf6"), Color(hex: "#ec4899"),
        ]
        return colors[index % colors.count]
    }
}
