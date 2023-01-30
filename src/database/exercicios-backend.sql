-- Active: 1675099458172@@127.0.0.1@3306

CREATE TABLE
    videos (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        title TEXT NOT NULL,
        duration TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT (DATETIME()) NOT NULL
    );

INSERT INTO
    videos (id, title, duration)
VALUES ("v001", "Video Um", "1h30m");

SELECT * FROM videos;