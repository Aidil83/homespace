import Foundation

struct Exercise: Identifiable {
    let id: Int
    let name: String
    let emoji: String
    let sets: Int
    let reps: String
    let weight: Int
    let prevWeight: Int
    let prevReps: Int
    let accentColor: String // hex color
}

// Mirror the web mockup's 8 exercises
let sampleExercises: [Exercise] = [
    Exercise(id: 0, name: "Squats",          emoji: "🦵", sets: 2, reps: "6-8",  weight: 135, prevWeight: 130, prevReps: 8, accentColor: "#ef4444"),
    Exercise(id: 1, name: "Bench Press",     emoji: "🏋️", sets: 2, reps: "6-8",  weight: 155, prevWeight: 150, prevReps: 8, accentColor: "#f97316"),
    Exercise(id: 2, name: "Barbell Rows",    emoji: "🚣", sets: 2, reps: "6-8",  weight: 115, prevWeight: 110, prevReps: 8, accentColor: "#eab308"),
    Exercise(id: 3, name: "Overhead Press",  emoji: "💪", sets: 2, reps: "6-8",  weight: 85,  prevWeight: 80,  prevReps: 8, accentColor: "#22c55e"),
    Exercise(id: 4, name: "Deadlifts",       emoji: "🏗️", sets: 2, reps: "6-8",  weight: 185, prevWeight: 180, prevReps: 8, accentColor: "#06b6d4"),
    Exercise(id: 5, name: "Lat Pulldowns",   emoji: "🧗", sets: 2, reps: "8-10", weight: 100, prevWeight: 95,  prevReps: 9, accentColor: "#3b82f6"),
    Exercise(id: 6, name: "Leg Curls",       emoji: "🦿", sets: 2, reps: "8-10", weight: 70,  prevWeight: 65,  prevReps: 9, accentColor: "#8b5cf6"),
    Exercise(id: 7, name: "Lateral Raises",  emoji: "🤸", sets: 2, reps: "10-12",weight: 20,  prevWeight: 20,  prevReps: 11,accentColor: "#ec4899"),
]
