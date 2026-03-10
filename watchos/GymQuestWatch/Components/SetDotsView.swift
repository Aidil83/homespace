import SwiftUI

struct SetDotsView: View {
    let current: Int
    let total: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<total, id: \.self) { i in
                Circle()
                    .fill(i <= current ? GymColors.green : GymColors.grayMid)
                    .frame(width: 8, height: 8)
            }
        }
    }
}
