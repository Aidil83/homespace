import SwiftUI

struct ProgressRingView: View {
    let progress: Double
    let color: Color
    var lineWidth: CGFloat = 8
    var size: CGFloat = 120

    var body: some View {
        ZStack {
            // Track
            Circle()
                .stroke(GymColors.grayMid, lineWidth: lineWidth)

            // Progress
            Circle()
                .trim(from: 0, to: CGFloat(max(0, min(1, progress))))
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 1), value: progress)
        }
        .frame(width: size, height: size)
    }
}
