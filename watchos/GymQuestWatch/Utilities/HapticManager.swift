import WatchKit

enum Haptic {
    static func tap() { WKInterfaceDevice.current().play(.click) }
    static func success() { WKInterfaceDevice.current().play(.success) }
    static func notification() { WKInterfaceDevice.current().play(.notification) }
    static func start() { WKInterfaceDevice.current().play(.start) }
    static func stop() { WKInterfaceDevice.current().play(.stop) }
    static func directionUp() { WKInterfaceDevice.current().play(.directionUp) }
    static func directionDown() { WKInterfaceDevice.current().play(.directionDown) }
}
