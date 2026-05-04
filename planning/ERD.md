# PawWatch Clarksville — Entity Relationship Diagram

```mermaid
erDiagram
    User {
        int id PK
        string email
        string password_hash
        string display_name
        string avatar_url
        enum role "member | shelter | admin"
        datetime created_at
    }

    Status {
        int id PK
        string name "active | sighting_reported | reunited | closed"
    }

    Post {
        int id PK
        int owner_id FK
        int status_id FK
        enum type "lost | found"
        string pet_name
        string species
        string breed
        string color
        text description
        date incident_date
        float location_lat
        float location_lng
        string location_label
        datetime created_at
        datetime updated_at
    }

    Comment {
        int id PK
        int post_id FK
        int author_id FK
        text body
        float sighting_lat
        float sighting_lng
        bool is_confirmed_sighting
        datetime created_at
    }

    Photo {
        int id PK
        string file_path
        int order
        datetime uploaded_at
    }

    PostPhoto {
        int post_id FK
        int photo_id FK
    }

    CommentPhoto {
        int comment_id FK
        int photo_id FK
    }

    Label {
        int id PK
        string name
        datetime created_at
    }

    PostLabel {
        int post_id FK
        int label_id FK
    }

    Status ||--o{ Post : "applied to"
    User ||--o{ Post : "owns"
    User ||--o{ Comment : "authors"
    Post ||--o{ Comment : "has"
    Post ||--o{ PostPhoto : ""
    Photo ||--o{ PostPhoto : ""
    Comment ||--o{ CommentPhoto : ""
    Photo ||--o{ CommentPhoto : ""
    Post ||--o{ PostLabel : ""
    Label ||--o{ PostLabel : ""
```

## Notes

- **Status** is a lookup table seeded with four rows: `active`, `sighting_reported`, `reunited`, `closed`. Post references it via `status_id`.
- **PostPhoto** and **CommentPhoto** are join tables connecting Photo to Post and Comment respectively. A photo belongs to either a post or a comment, never both.
- **role** on User is reserved for the shelter/rescue stretch goal. MVP only uses `member` and `admin`.
- `location_label` on Post is a human-readable address string (e.g. "Rossview Rd & Tiny Town Rd") stored alongside the coordinates for display.
- `sighting_lat` / `sighting_lng` on Comment are nullable — not every comment is a location-based sighting.
- `order` on Photo controls display order within a post or comment.
- **Label** is a predefined lookup table managed by admins. Seeded with: `Friendly`, `Shy / Timid`, `May Bite or Scratch`, `Good with Kids`, `Good with Other Pets`, `Needs Medication`, `Injured`, `Senior Pet`, `Deaf`, `Blind`, `Microchipped`, `Wearing Collar & Tags`, `Distinctive Markings`, `Neutered / Spayed`, `Reward Offered`, `Urgent`, `Near Busy Road`.
- **PostLabel** is a join table — a post can have many labels, a label can appear on many posts.
