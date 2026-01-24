//Import pool (Database Connection)
const pool = require("../services/db");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const callback = (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
}

bcrypt.hash('1234', saltRounds, (error, hash) => {
  if (error) {
    console.error("Error hashing password:", error);
  } else {
    console.log("Hashed password:", hash);

    const SQLSTATEMENT = `

      DROP TABLE IF EXISTS UserToken;
      DROP TABLE IF EXISTS MatchOutcome;
      DROP TABLE IF EXISTS DailyClaim;
      DROP TABLE IF EXISTS UserInventory;
      DROP TABLE IF EXISTS ShopItem;
      DROP TABLE IF EXISTS UserAchievement;
      DROP TABLE IF EXISTS Achievement;

      DROP TABLE IF EXISTS GroupMatch;
      DROP TABLE IF EXISTS CompetitionSeason;
      DROP TABLE IF EXISTS PlayerProfile;
      DROP TABLE IF EXISTS CommunityGroup;
      DROP TABLE IF EXISTS ProfileLevel;

      DROP TABLE IF EXISTS UserCompletion;
      DROP TABLE IF EXISTS WellnessChallenge;
      DROP TABLE IF EXISTS User;

CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  points INT DEFAULT 0
);

CREATE TABLE WellnessChallenge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL
);

CREATE TABLE UserCompletion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  details TEXT
);

CREATE TABLE ProfileLevel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  required_total_power INT NOT NULL
);

CREATE TABLE CommunityGroup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE PlayerProfile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  group_id INT DEFAULT NULL,
  level_id INT DEFAULT NULL,
  power INT DEFAULT 0
);

CREATE TABLE CompetitionSeason (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE
);

CREATE TABLE GroupMatch (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_a_id INT NOT NULL,
  group_b_id INT NOT NULL,
  season_id INT NOT NULL,
  match_date DATE
);

CREATE TABLE MatchOutcome (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL UNIQUE,
  score_a INT DEFAULT 0,
  score_b INT DEFAULT 0,
  winner_group_id INT NULL
);

CREATE TABLE UserToken(
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  tokens INT DEFAULT 0
);

CREATE TABLE Achievement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE UserAchievement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

CREATE TABLE ShopItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost INT NOT NULL,
  power INT NOT NULL DEFAULT 0
);

CREATE TABLE UserInventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT DEFAULT 1,
  UNIQUE KEY unique_user_item (user_id, item_id)
);

CREATE TABLE DailyClaim (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  last_claimed_at DATETIME DEFAULT NULL
);

INSERT INTO User (username, email, password, points) VALUES
  ('alice', 'alice@example.com', '${hash}', 100),
  ('bob', 'bob@example.com', '${hash}', 150),
  ('charlie', 'charlie@example.com', '${hash}', 200);

INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
  (1, 'Sleep like a boss - Get 7+ hours of sleep', 10),
  (1, 'Stairs over elevator? Respect.- Take the stairs today', 20),
  (2, 'Digital detox (mini edition) - No phone for 1 hour', 10),
  (2, 'Touch grass IRL - Take a 15-minute walk outside', 10),
  (2, 'IRL > DMs - Talk to a friend face-to-face', 20),
  (3, 'Declutter your chaos - Clean your desk or room', 20),
  (3, 'Help a homie - Assist someone without being asked', 20);

INSERT INTO UserCompletion (challenge_id, user_id, details) VALUES
  (1, 1, 'Slept for 8 hours last night!'),
  (2, 1, 'Took the stairs to the 5th floor. Feeling accomplished!'),
  (3, 2, 'Stayed off my phone for an hour while reading a book.');

INSERT INTO ProfileLevel (name, required_total_power) VALUES
  ('Beginner', 0),
  ('Intermediate', 25),
  ('Advanced', 50);

INSERT INTO CommunityGroup (name, description) VALUES
  ('Team Sunrise', 'Early birds who focus on sleep and routines'),
  ('Team Momentum', 'Fitness and productivity crew');

INSERT INTO PlayerProfile (user_id, group_id, level_id) VALUES
  (1, 1, 1),
  (2, 2, 1),
  (3, 1, 2);

INSERT INTO CompetitionSeason (name, start_date, end_date) VALUES
  ('Season 1', '2026-01-01', '2026-01-31');

INSERT INTO GroupMatch (group_a_id, group_b_id, season_id, match_date) VALUES
  (1, 2, 1, '2026-01-05');

INSERT INTO Achievement (name, description) VALUES
  ('First Steps', 'Complete your first wellness challenge'),
  ('Shopper', 'Buy your first shop item'),
  ('Daily Regular', 'Claim daily reward at least once'),
  ('First Match', 'Play 1 match'),
  ('Veteran', 'Play 50 matches'),
  ('Legend', 'Play 100 matches');

INSERT INTO UserAchievement (user_id, achievement_id) VALUES
  (1, 1);

INSERT INTO ShopItem (name, description, cost, power) VALUES
  ('Energy Drink', 'Boost your vibe for the day', 20, 5),
  ('Focus Snack', 'A small snack to stay locked in', 15, 3),
  ('Gym Pass', 'Motivation to get moving', 30, 7);

INSERT INTO UserInventory (user_id, item_id, quantity) VALUES
  (1, 1, 2),
  (2, 2, 1);

INSERT INTO DailyClaim (user_id, last_claimed_at) VALUES
  (1, '2026-01-03 09:00:00'),
  (2, NULL),
  (3, NULL);

INSERT INTO UserToken (user_id, tokens) VALUES
(1, 0),
(2, 0),
(3, 0);
`;

    pool.query(SQLSTATEMENT, callback);
  }
});
