# Wellness Challenge Gamification Backend And Frontend (BED CA2)

## Project Overview
A full-stack gamification system that transforms real-world wellness challenges 
into an immersive game experience inspired by Alice in Borderland. Users complete 
wellness challenges in real life to earn points, which unlock character progression,
enable group competitions, and allow purchases in an in-game shop. 
The system features a RESTful API backend and an interactive frontend interface.

## Core Game Loop
```
Complete Wellness Challenges 
    ↓
Earn Points
    ↓
Unlock Character Levels (ProfileLevel progression)
    ↓
Spend Points in Shop
    ↓
Gain Inventory Items (with power values)
    ↓
Join Community Groups
    ↓
Compete in Group Matches (based on combined inventory power)
    ↓
Return to Complete More Challenges
```

## Features

### Section D – Real-World Wellness Challenges
- **User Management**: Registration, authentication, profile updates
- **Challenge System**: Create, view, update, and delete wellness challenges
- **Challenge Completion**: Track user progress and award points
- **Point Rewards**: Earn points only through completing real-life challenges

### Gamification Features
- **Character Progression**: 9 unlockable characters based on point thresholds (Chota → Mira)
- **Profile Levels**: Dynamic character upgrades as users accumulate points
- **Community Groups**: 12 themed groups with unique identities
- **Group Matches**: Teams compete based on combined inventory power
- **Shop System**: Purchase items using earned points
- **Inventory Management**: Track items with power ratings
- **Leaderboards**: Rank users by points and achievements

### Frontend Features
- **Interactive Dashboard**: View points, current character, and progress
- **Challenge Interface**: Browse and complete available challenges
- **Shop UI**: Visual item catalog with purchase functionality
- **Inventory Display**: View owned items and total power
- **Group Management**: Join groups and view match schedules
- **Profile Display**: Character progression visualization
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic content updates without page refresh

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (mysql2)
- **Authentication**: bcrypt for password hashing
- **Environment**: dotenv for configuration
- **Language**: JavaScript

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **HTTP Client**: Fetch API
- **UI Components**: Custom components for challenges, shop, profiles

## Project Structure
```
project-root/
├── public/                       # Frontend static files
│   ├── css/
│   │   ├── base.css
│   │   ├── color.css
│   │   ├── form.css
│   │   └── style.css
│   ├── js/
│   │   ├── utils 
│   │   │     ├── AppModals.js     
│   │   ├── challenges.js
│   │   ├── characters.js
│   │   ├── getCurrentURL.js
│   │   ├── leaderboard.js
│   │   ├── loginUser.js
│   │   ├── matchArena.js
│   |   ├── matches.js
│   │   ├── navbar.js
│   │   ├── profile.js
│   │   ├── queryCmds.js
│   │   ├── registerUser.js
│   │   ├── shop.js
│   │   ├── token.js
│   │   ├── userNavbarToggle.js
│   ├── challenges.html
│   ├── characters.html
│   ├── index.html
│   ├── login.html
│   ├── matcheArena.html9
│   ├── matches.html
│   ├── profile.html
│   ├── register.html
│   └── shop.html
│
├── src/                          # Backend source code
│   ├── configs/                  # Database configuration
│   │   ├── createSchema.js       # Database schema initialization
│   │   └── initTables.js         # Table creation and seed data
│   │
│   ├── controllers/              # Request handling and business logic
│   │   ├── challengeController.js
│   │   ├── completionController.js
│   │   ├── groupController.js
│   │   ├── inventoryController.js
│   │   ├── leaderboardController.js
│   │   ├── matchController.js
│   │   ├── profileController.js
│   │   ├── shopController.js
│   │   └── userController.js
│   │
│   ├── middlewares/              # Custom middleware
│   │   ├── bcryptMiddleware.js   # Password hashing
│   │   └── jwtMiddleware.js      # JWT authentication
│   │
│   ├── models/                   # Database queries and data access
│   │   ├── challengeModel.js
│   │   ├── completionModel.js
│   │   ├── completionModel.js
│   │   ├── groupModel.js
│   │   ├── inventoryModel.js
│   │   ├── leaderboardModel.js
│   │   ├── matchModel.js
│   │   ├── profileModel.js
│   │   ├── shopModel.js
│   │   └── userModel.js
│   │
│   ├── routes/                   # API endpoint definitions
│   │   ├── authRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   ├── mainRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── shopRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/                 # Shared services
│   │   └── db.js                 # Database connection pool
│   │
│   └── app.js                    # Application entry point
│
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md
```

## Database Schema

### Core Tables
- **User**: Stores user credentials, points, and current character level
- **WellnessChallenge**: Defines available wellness challenges
- **UserCompletion**: Tracks which challenges users have completed

### Gamification Tables
- **ProfileLevel**: Character progression tiers (9 levels: Chota to Mira)
- **CommunityGroup**: 12 themed groups users can join
- **UserProfile**: Links users to their groups
- **GroupMatch**: Tracks competitions between groups
- **ShopItem**: Items available for purchase with points
- **UserInventory**: Tracks user-owned items and quantities


### API Endpoints

### Authentication

```

Register User
POST /auth/register

Request Body:
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "1234"
}

Response (201):
{
  "message": "User testuser created successfully.",
  "data": {
    "userId": 14,
    "hash": "$2b$10$..."
  }
}

Error Response (409):
{
  "message": "Username or email already exists"
}
Login User
POST /auth/login

Request Body:
{
  "username": "testuser",
  "password": "1234"
}

Response (200):
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 14
  }
}

Error Response (404):
{
  "message": "User not found"
}
Users
Get All Users
GET /users

Response (200):
{
  "message": "Success",
  "data": {
    "user": [
      {
        "id": 1,
        "username": "hannah",
        "email": "hannah@example.com",
        "points": 5,
        "current_level_id": 1,
        "created_on": "2026-01-01T10:00:00.000Z",
        "updated_on": "2026-01-01T10:00:00.000Z",
        "last_login_on": "2026-02-05T08:30:00.000Z"
      },
      ...
    ]
  }
}
Get User By ID
GET /users/:user_id
(Requires JWT token in Authorization header)

Response (200):
{
  "id": 1,
  "username": "hannah",
  "email": "hannah@example.com",
  "points": 5,
  "current_level_id": 1,
  "created_on": "2026-01-01T10:00:00.000Z",
  "updated_on": "2026-01-01T10:00:00.000Z",
  "last_login_on": "2026-02-05T08:30:00.000Z"
}

Error Response (404):
{
  "message": "User not found"
}
Update User
PUT /users/:user_id
(Requires JWT token in Authorization header)

Request Body:
{
  "username": "hannah_updated",
  "points": 10
}

Response (200):
{
  "message": "Success",
  "data": {
    "user": {
      "fieldCount": 0,
      "affectedRows": 1,
      "insertId": 0,
      "info": "Rows matched: 1  Changed: 1  Warnings: 0",
      "serverStatus": 2,
      "warningStatus": 0,
      "changedRows": 1
    },
    "userId": 1,
    "hash": "$2b$10$..."
  }
}

Error Response (404):
{
  "message": "User not found"
}

Error Response (403):
{
  "message": "Username is already associated with another user"
}
Wellness Challenges
Create Challenge
POST /challenges
(Requires JWT token in Authorization header)

Request Body:
{
  "description": "Drink 8 glasses of water today",
  "points": 15
}

Response (201):
{
  "message": "Success",
  "data": {
    "challenge_id": 8,
    "userId": 1,
    "challenge": {
      "id": 8,
      "creator_id": 1,
      "description": "Drink 8 glasses of water today",
      "points": 15
    }
  }
}

Error Response (400):
{
  "message": "Bad request"
}
Get All Challenges
GET /challenges

Response (200):
{
  "message": "Success",
  "data": {
    "challenge": [
      {
        "id": 1,
        "creator_id": 1,
        "description": "Sleep like a boss - Get 7+ hours of sleep",
        "points": 10
      },
      {
        "id": 2,
        "creator_id": 1,
        "description": "Stairs over elevator? Respect.- Take the stairs today",
        "points": 20
      },
      ...
    ]
  }
}
Get Challenge By ID
GET /challenges/:challenge_id

Response (200):
{
  "message": "Success",
  "data": {
    "challenge": {
      "id": 1,
      "creator_id": 1,
      "description": "Sleep like a boss - Get 7+ hours of sleep",
      "points": 10
    }
  }
}

Error Response (404):
{
  "message": "Challenge not found"
}
Update Challenge
PUT /challenges/:challenge_id
(Requires JWT token in Authorization header - must be challenge creator)

Request Body:
{
  "description": "Sleep 8+ hours for better health",
  "points": 15
}

Response (200):
{
  "message": "Success",
  "data": {
    "userId": 1,
    "challenge": {
      "id": 1,
      "creator_id": 1,
      "description": "Sleep 8+ hours for better health",
      "points": 15
    }
  }
}

Error Response (403):
{
  "message": "Forbidden: you are not the creator of this challenge"
}

Error Response (404):
{
  "message": "Challenge not found"
}
Delete Challenge
DELETE /challenges/:challenge_id
(Requires JWT token in Authorization header)

Response (204):
(No content)

Error Response (404):
{
  "message": "Challenge not found"
}
Complete Challenge
POST /challenges/:challengeId/complete
(Requires JWT token in Authorization header)

Request Body:
{
  "details": "Slept for 8 hours last night!"
}

Response (201):
{
  "id": 15,
  "user_id": 1,
  "challenge_id": 1,
  "details": "Slept for 8 hours last night!"
}

Error Response (404):
{
  "message": "user_id does not exist"
}

Error Response (404):
{
  "message": "challenge_id does not exist"
}
Get Users Who Completed Challenge
GET /challenges/:challenge_id

Response (200):
[
  {
    "completion_id": 1,
    "user_id": 1,
    "username": "hannah",
    "details": "Slept for 8 hours last night!",
    "completed_at": "2026-01-15T10:30:00.000Z"
  },
  {
    "completion_id": 4,
    "user_id": 2,
    "username": "alice",
    "details": "Slept for 8 hours last night!",
    "completed_at": "2026-01-15T11:00:00.000Z"
  },
  ...
]

Error Response (400):
{
  "message": "challenge_id is required"
}

Error Response (404):
{
  "message": "No attempts found for this challenge"
}
Get My Completed Challenges
GET /completions
(Requires JWT token in Authorization header)

Response (200):
{
  "message": "Success",
  "data": {
    "completedChallenges": [
      {
        "completion_id": 1,
        "challenge_id": 1,
        "description": "Sleep like a boss - Get 7+ hours of sleep",
        "points": 10,
        "details": "Slept for 8 hours last night!",
        "completed_at": "2026-01-15T10:30:00.000Z"
      },
      ...
    ]
  }
}
Player Profiles
Create Profile
POST /profiles
(Requires JWT token in Authorization header)

Response (201):
{
  "message": "Success",
  "data": {
    "profile_id": 13,
    "userId": 14
  }
}

Error Response (400):
{
  "message": "user_id is required"
}
Get User Profile
GET /profiles/:user_id
(Requires JWT token in Authorization header)

Response (200):
{
  "message": "Success",
  "data": {
    "profile": {
      "id": 1,
      "user_id": 1,
      "username": "hannah",
      "email": "hannah@example.com",
      "points": 5,
      "current_level_id": 1,
      "character_name": "Chota",
      "character_description": "Chota is the heart of the trio, loyal, supportive, and brave in the face of fear...",
      "required_total_points": 0,
      "group_id": 1,
      "group_name": "Team Sunrise",
      "group_description": "Early birds who focus on sleep and routines"
    }
  }
}

Error Response (404):
{
  "message": "Profile not found"
}
Get All Profile Levels
GET /profiles/levels

Response (200):
{
  "message": "Success",
  "data": {
    "profileLevels": [
      {
        "id": 1,
        "character_name": "Chota",
        "description": "Chota is the heart of the trio, loyal, supportive, and brave in the face of fear...",
        "required_total_points": 0
      },
      {
        "id": 2,
        "character_name": "Karube",
        "description": "Karube is the fighter of the friend group, energetic, athletic, and protective...",
        "required_total_points": 10
      },
      ...
    ]
  }
}
Groups & Matches
Get All Groups
GET /groups

Response (200):
{
  "message": "Success",
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "Team Sunrise",
        "description": "Early birds who focus on sleep and routines"
      },
      {
        "id": 2,
        "name": "Team Momentum",
        "description": "Fitness and productivity crew"
      },
      ...
    ]
  }
}
Join Group
POST /groups/:group_id/join
(Requires JWT token in Authorization header)

Response (200):
{
  "message": "Success",
  "data": {
    "group": {
      "user_id": 14,
      "group_id": 1
    },
    "userId": 14
  }
}

Error Response (400):
{
  "message": "group_id and user_id are required"
}

Error Response (409):
{
  "message": "Group is full"
}
Create Match
POST /matches

Request Body:
{
  "group_a_id": 1,
  "group_b_id": 2,
  "season_id": 1
}

Response (201):
{
  "message": "Success",
  "data": {
    "match_id": 2
  }
}

Error Response (400):
{
  "message": "Missing required fields"
}
Get Match Results
GET /matches/:match_id

Response (200):
{
  "message": "Success",
  "data": {
    "match": {
      "id": 1,
      "group_a_id": 1,
      "group_b_id": 2,
      "season_id": 1,
      "match_date": "2026-01-05"
    },
    "score_a": 35,
    "score_b": 28,
    "resultData": {
      "match_id": 1,
      "group_a_id": 1,
      "group_b_id": 2,
      "score_a": 35,
      "score_b": 28,
      "winner_group_id": 1
    }
  }
}

Error Response (404):
{
  "message": "Match not found"
}
Shop & Inventory
Get All Shop Items
GET /shop

Response (200):
{
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Visa Extension Card",
        "description": "Extends your survival time in the Borderland.",
        "cost": 20,
        "power": 5
      },
      {
        "id": 2,
        "name": "Heart Suit Token",
        "description": "A mysterious token tied to emotional trials and trust-based games.",
        "cost": 15,
        "power": 3
      },
      ...
    ]
  }
}
Purchase Item
POST /shop/:id/buy
(Requires JWT token in Authorization header)

Request Body:
{
  "quantity": 1
}

Response (200):
{
  "message": "Success",
  "data": {
    "buy": {
      "user_id": 1,
      "item_id": 1,
      "quantity": 1
    },
    "totalCost": 20,
    "result": {
      "user_id": 1,
      "item_id": 1,
      "quantity": 1,
      "points_spent": 20,
      "affectedRows": 1
    },
    "userId": 1
  }
}

Error Response (400):
{
  "message": "user_id and quantity are required"
}

Error Response (404):
{
  "message": "Item not found"
}

Error Response (403):
{
  "message": "Not enough points or user not found"
}
Get User Inventory
GET /inventory
(Requires JWT token in Authorization header)

Response (200):
{
  "message": "Success",
  "data": {
    "inventory": [
      {
        "id": 1,
        "user_id": 1,
        "item_id": 1,
        "item_name": "Visa Extension Card",
        "description": "Extends your survival time in the Borderland.",
        "power": 5,
        "cost": 20,
        "quantity": 1
      },
      {
        "id": 2,
        "user_id": 1,
        "item_id": 3,
        "item_name": "Arena Access Pass",
        "description": "Grants access to high-risk, high-reward group matches in the Borderland.",
        "power": 7,
        "cost": 30,
        "quantity": 1
      }
    ],
    "userId": 1
  }
}
Leaderboard
Get Leaderboard
GET /leaderboard

Response (200):
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 13,
      "username": "vecna",
      "points": 100,
      "current_level_id": 9,
      "character_name": "Mira"
    },
    {
      "rank": 2,
      "user_id": 2,
      "username": "alice",
      "points": 50,
      "current_level_id": 8,
      "character_name": "Arisu"
    },
    {
      "rank": 3,
      "user_id": 11,
      "username": "fiona",
      "points": 45,
      "current_level_id": 7,
      "character_name": "Usagi"
    },
    ...
  ]
}

Error Response (404):
{
  "message": "No leaderboard data found"
}
```

## Character Progression System

Users unlock characters as they accumulate points:

| Level | Character | Points Required | Description |
|-------|-----------|-----------------|-------------|
| 1 | Chota | 0 | Starting character - loyal and determined |
| 2 | Karube | 10 | Energetic fighter - action-first mindset |
| 3 | Aguni | 15 | Hardened survivor - raw resilience |
| 4 | Ann | 20 | Strategic analyst - intelligence under pressure |
| 5 | Kuina | 25 | Fearless fighter - agility and confidence |
| 6 | Chishiya | 30 | Mastermind - pure strategy |
| 7 | Usagi | 40 | Peak survival - stamina and courage |
| 8 | Arisu | 50 | Problem-solver leader |
| 9 | Mira | 100 | Final boss - ultimate power |

## Community Groups

12 themed groups available for users to join:

1. **Team Sunrise** - Early birds who focus on sleep and routines
2. **Team Momentum** - Fitness and productivity crew
3. **The Beach Squad** - Social-driven team: consistency + community challenges
4. **Spade Runners** - Endurance and cardio grinders (walks, runs, stamina)
5. **Heart Keepers** - Mental wellness + social connection (journaling, check-ins)
6. **Diamond Minds** - Focus and discipline (study blocks, digital detox, deep work)
7. **Club Crew** - Balanced players: mix of strength, sleep, and productivity
8. **Wolf Pack** - Hardcore challengers chasing max points daily
9. **Silent Steps** - Low-key team: consistency over intensity
10. **Iron Resolve** - Strength + resilience focused (pushups, gym, training)
11. **Zen Circle** - Mindfulness and recovery: stretch, breathe, meditate
12. **Borderland Veterans** - Experienced players: strategic point farming

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

**Start the backend server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:3000`

### Frontend Setup

**Frontend files are served automatically**

The Express server is configured to serve static files from the `public/` directory.

**Access the application**

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be redirected to the login page. Register a new account or use existing credentials.

## Game Logic Flow

### 1. New User Journey
```
Register → Auto-assigned Chota (Level 1, current_level_id = 1) → 
View Available Challenges → Dashboard displays 0 points
```

### 2. Earning Points & Character Progression
```
Browse Challenges → Complete Challenge → Earn Points (e.g., +10) → 
Backend updates User.points → 
Backend checks if points >= next ProfileLevel.required_total_points →
If yes, update User.current_level_id to new level →
Frontend displays new character
```

**Example:**
- User has 8 points (Chota, level 1)
- Completes challenge worth 5 points → now has 13 points
- System checks: 13 >= 10 (Karube's threshold) → Updates current_level_id to 2
- User now sees Karube character and description

### 3. Shop Interaction
```
View Shop Items → Select Item (e.g., "Visa Extension Card", cost: 20 points) → 
Click "Buy" → Backend checks if User.points >= 20 →
If yes: Deduct 20 points, Add to UserInventory →
Frontend updates points display and inventory
```

### 4. Group Competition Flow
```
User joins CommunityGroup (via UserProfile.group_id) →
Admin creates GroupMatch between two groups →
System calculates each group's total power:
  - For each member in group_a, SUM(UserInventory.power * quantity)
  - Same for group_b →
Compare totals → Group with higher power wins →
Display results on matches page
```

**Example Match Calculation:**
```
Group A (Team Sunrise):
  - User 1: 2 items (power 5 + power 3) = 8
  - User 2: 1 item (power 7) = 7
  - User 3: 3 items (power 5 + 5 + 10) = 20
  Total: 35

Group B (Team Momentum):
  - User 4: 1 item (power 12) = 12
  - User 5: 2 items (power 7 + 10) = 17
  - User 6: 1 item (power 5) = 5
  Total: 34

Winner: Group A (35 > 34)
```

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Missing or invalid input
- `401 Unauthorized` - Invalid or missing authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Business logic violation (e.g., group full, insufficient points)
- `500 Internal Server Error` - Database or server error

## Testing

### Using Postman/Thunder Client

1. **Import the API collection** (if provided)
2. **Set environment variables**:
   - `base_url`: http://localhost:3000
   - `token`: (obtained from login)
   - `user_id`: (obtained from login)

3. **Test endpoints in order**:

**Step 1: Register & Login**
```
POST /auth/register
Body: { "username": "testuser", "email": "test@example.com", "password": "1234" }

POST /auth/login
Body: { "email": "test@example.com", "password": "1234" }
Response: Save the token and user_id
```

**Step 2: Complete Challenges**
```
GET /challenges
(View available challenges)

POST /challenges/1/complete
Body: { "user_id": 1, "details": "Completed the challenge!" }
(Earn points)
```

**Step 3: Check Profile & Level**
```
GET /profiles/1
(See current character based on points)
```

**Step 4: Shop & Inventory**
```
GET /shop
(View available items)

POST /shop/1/buy
Body: { "user_id": 1, "quantity": 1 }
(Purchase item if enough points)

GET /inventory/1
(View owned items and total power)
```

**Step 5: Groups & Matches**
```
GET /groups
(View available groups)

POST /groups/1/join
Body: { "user_id": 1 }
(Join a group)

POST /matches
Body: { "group_a_id": 1, "group_b_id": 2, "season_id": 1, "match_date": "2026-02-10" }
(Create a match - admin only)
```

### Frontend Testing

1. **Open browser DevTools (F12)**
2. **Navigate through the UI:**
   - Register new account
   - Login
   - Complete challenges
   - Check profile (character should update as points increase)
   - Visit shop and purchase items
   - View inventory
   - Join a group
   - Check leaderboard

3. **Verify in Console:**
   - No JavaScript errors
   - API calls successful (Network tab)
   - LocalStorage contains token and userId

4. **Test responsive design:**
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)

### Manual Test Cases

**Test Case 1: Character Progression**
```
1. New user starts with 0 points → Should show Chota
2. Complete challenge worth 15 points → Should show Aguni
3. Complete another challenge worth 20 points (total 35) → Should show Chishiya
4. Verify profile displays correct character name and description
```

**Test Case 2: Shop Purchase Flow**
```
1. User has 50 points
2. Attempt to buy item costing 60 points → Should fail with error message
3. Attempt to buy item costing 20 points → Should succeed
4. Check remaining points → Should be 30
5. Check inventory → Should show purchased item
```

**Test Case 3: Group Match Power Calculation**
```
1. Create Group A with 3 users
2. Users purchase items with different power values
3. Create Group B with 3 users with lower total power
4. Create match between groups
5. Verify Group A wins based on higher total inventory power
```

## Database Design Principles

- **Normalization**: Separate tables for each entity, junction tables for many-to-many relationships
- **Referential Integrity**: All foreign keys properly defined (though not enforced in your schema)
- **Indexed Columns**: Primary keys automatically indexed, unique constraints on critical columns
- **Default Values**: Sensible defaults (points = 0, current_level_id = 1, timestamps)
- **Data Types**: Appropriate types for each field (INT for IDs and points, TEXT for descriptions, TIMESTAMP for dates)
- **Unique Constraints**: Prevent duplicate entries (e.g., user_id-item_id in UserInventory)

## Security Considerations

- **Password Hashing**: bcrypt with 10 salt rounds - passwords never stored in plain text
- **JWT Authentication**: Secure token-based authentication with expiration
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries using mysql2 prepared statements
- **CORS Configuration**: Configured to allow frontend access (restrict origins in production)
- **Environment Variables**: All sensitive data (DB credentials, JWT secret) in `.env` file
- **.gitignore**: Ensures `.env` is never committed to version control
- **Authorization Checks**: Middleware verifies user permissions before sensitive operations

## Architecture & Design Patterns

### MVC-Style Layered Architecture
```
Routes (API Endpoints)
    ↓
Controllers (Business Logic & Validation)
    ↓
Models (Database Queries)
    ↓
Database (MySQL)
```

### Separation of Concerns
- **Routes**: Define URL structure and HTTP methods
- **Controllers**: Handle request/response, validate input, orchestrate business logic
- **Models**: Encapsulate all database operations
- **Middleware**: Shared functionality (authentication, response formatting)
- **Services**: Shared utilities (database connection pool)

### Benefits
- **Maintainability**: Each layer has a single responsibility
- **Testability**: Components can be tested in isolation
- **Scalability**: Easy to add new features or modify existing ones
- **Reusability**: Models and middleware can be used across multiple routes

## Quick Reference

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=wellness_gamification
DB_PORT=3306
PORT=3000
JWT_SECRET=your_secret_key_here
```

### Common Commands
```bash
# Install dependencies
npm install

# Initialize database
node src/configs/initTables.js

# Start development server
npm run dev

# Start production server
npm start

# Run database migration
node src/configs/createSchema.js
```

### Default Users (for testing)
```
Email: hannah@example.com | Password: 1234 | Points: 5 | Character: Chota
Email: alice@example.com | Password: 1234 | Points: 50 | Character: Arisu
Email: vecna@example.com | Password: 1234 | Points: 100 | Character: Mira
```

---

**Note**: This system maintains a clear separation between real-world wellness activities (Section D requirements) and gamification mechanics. Points can ONLY be earned through completing real-life challenges, ensuring the wellness aspect remains authentic while providing an engaging game-like progression system.

**Last Updated**: February 2026
**Version**: 1.0.0