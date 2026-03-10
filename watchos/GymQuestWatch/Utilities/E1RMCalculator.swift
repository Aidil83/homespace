import Foundation

enum E1RMCalculator {
    /// Epley formula: weight × (1 + reps/30)
    static func estimate(weight: Int, reps: Int) -> Int {
        guard weight > 0, reps > 0 else { return 0 }
        if reps == 1 { return weight }
        return Int(round(Double(weight) * (1.0 + Double(reps) / 30.0)))
    }
}
