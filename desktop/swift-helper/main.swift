import Foundation
import SQLite3

// Simple Swift helper to access Messages database and output JSON
// This bypasses sandboxing issues by running as a separate privileged process

func getNewMessages(sinceId: Int64) -> [[String: Any]] {
    let messagesDb = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/Messages/chat.db")

    guard FileManager.default.fileExists(atPath: messagesDb.path) else {
        return []
    }

    var db: OpaquePointer?
    guard sqlite3_open(messagesDb.path, &db) == SQLITE_OK else {
        return []
    }

    defer { sqlite3_close(db) }

    var results: [[String: Any]] = []

    // Query for new messages
    let query = """
        SELECT m.ROWID as id, m.text, h.id as sender, m.date, m.is_from_me
        FROM message m
        LEFT JOIN handle h ON m.handle_id = h.ROWID
        WHERE m.ROWID > \(sinceId)
        AND m.text IS NOT NULL
        AND m.text != ''
        AND m.is_from_me = 0
        ORDER BY m.ROWID ASC
        LIMIT 50
    """

    var stmt: OpaquePointer?
    guard sqlite3_prepare_v2(db, query, -1, &stmt, nil) == SQLITE_OK else {
        return []
    }

    defer { sqlite3_finalize(stmt) }

    while sqlite3_step(stmt) == SQLITE_ROW {
        let id = sqlite3_column_int64(stmt, 0)
        let text = String(cString: sqlite3_column_text(stmt, 1))
        let sender = String(cString: sqlite3_column_text(stmt, 2))
        let timestamp = sqlite3_column_int64(stmt, 3)

        results.append([
            "id": id,
            "text": text,
            "sender": sender,
            "timestamp": timestamp,
            "iDate": Date(timeIntervalSince1970: TimeInterval(timestamp))
        ])
    }

    return results
}

// Main entry point
let arguments = CommandLine.arguments

if arguments.count > 1 && arguments[1] == "--check" {
    let sinceId = arguments.count > 2 ? Int64(arguments[2]) ?? 0 : 0

    let messages = getNewMessages(sinceId: sinceId)

    if let jsonData = try? JSONSerialization.data(withJSONObject: messages),
       let jsonString = String(data: jsonData, encoding: .utf8) {
        print(jsonString)
    } else {
        print("[]")
    }
} else {
    print("Usage: swift-helper --check [sinceId]")
}
