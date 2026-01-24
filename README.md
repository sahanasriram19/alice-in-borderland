# Wellness Challenge Gamification Backend (BED CA1)

## Project Overview:
This project is a backend RESTful API for a Wellness Challenge Gamification System,
developed as part of the Backend Development (BED) Continuous Assessment 1.
The system encourages users to complete real-life wellness challenges to earn points,
which can then be used in a game-like environment to unlock achievements, 
join groups, participate in matches, purchase items from a shop, and claim daily rewards.
The project demonstrates a clear separation between real-world activities (Section D) 
and in-game progression (Gamification), following the CA1 requirements.


## Features:
Section D – Core Functionality
User management
Wellness challenge creation and management
Challenge completion tracking
Point rewards earned through completing wellness challenges
Gamification Features
Player profiles linked to users
Community groups with capacity checks
Matches between groups
Achievement system (create and unlock achievements)
Shop system using points earned from challenges
User inventory tracking purchased items
Daily claim rewards to encourage user engagement
RESTful API design with proper HTTP status codes and error handling

## Tech Stack
- Node.js
- Express.js
- MySQL (mysql2)
- dotenv
- JavaScript

## Project Structure
```
src/
├── configs/        # Database configuration and environment setup
├── controllers/    # Request handling and business logic
├── middleware/     # Shared response formatting middleware
├── models/         # Database queries and data access logic
├── routes/         # API endpoint definitions
├── services/       # Shared services (e.g. database connection)
└── app.js          # Application entry point
```

The project follows a layered MVC-style architecture:
- Routes define API endpoints
- Controllers handle validation and business logic
- Models manage database queries
- Middleware standardizes API responses

## API Endpoints Section D(Summary):

Users
1. POST /users
2. GET /users
3. GET /users/:user_id
4. PUT /users/:user_id

Wellness Challenges
5. POST /challenges
6. GET /challenges
7. DELETE /challenges/:challenge_id
8. PUT /challenges/:challenge_id
9. POST /challenges/:challenge_id (complete challenge)
10. GET /challenges/:challenge_id

Gamification API Endpoints (Summary):

Player Profiles
1. POST /profiles
2. GET /profiles/:user_id

Groups & Matches
3. GET /groups
4. POST /groups/:group_id/join
5. POST /matches

Achievements
6. POST /achievements
7. GET /achievements
8. GET /achievements/:id
9. PUT /achievements/:id
10. POST /achievements/:id/unlock
11. GET /users/:user_id/achievements

Shop & Inventory
12. POST /shop/:id/buy
13. GET /inventory/:user_id
14. DELETE /inventory/item/:id

Daily Claim
15.POST /daily-claim

Gamification Design Explanation

Users first complete wellness challenges to earn points.
These points cannot be earned directly in the gamification system 
and are only obtained through real-life challenge completion.

Points are then used in the gamification layer to:
Purchase items from the shop
Fill up their inventory

Flow:
Wellness Challenges → Earn Points → Spend Points in Game → Progress Further

Achievements are predefined by the system and represent long-term goals,
while user progress is tracked separately to ensure data normalization and scalability.

Database Design:
Relational database with normalized tables
Junction tables used for many-to-many relationships (e.g. user achievements)
Primary keys standardized as id
Foreign keys ensure data integrity


Error Handling
400 Bad Request for missing or invalid inputs
404 Not Found for non-existent resources
409 Conflict for invalid actions (e.g. group capacity reached)
500 Internal Server Error for database or server issues

How to Run the Project

Install dependencies:

npm install express dotenv nodemon mysql2


Configure environment variables:
Create a .env file with your database credentials.

Initialize database tables:
node src/config/initTables.js

Start the server:
npm run dev

Test endpoints using Postman.


