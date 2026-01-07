//Import pool (Database Connection)
const pool = require("../services/db");

const SQLSTATEMENT = `

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
  required_total_attributes INT NOT NULL
);

CREATE TABLE CommunityGroup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE PlayerProfile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  strength INT DEFAULT 0,
  stamina INT DEFAULT 0,
  focus INT DEFAULT 0,
  group_id INT DEFAULT NULL,
  level_id INT DEFAULT NULL
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
  cost INT NOT NULL
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

INSERT INTO User (username, points) VALUES
  ('alice', 100),
  ('bob', 150),
  ('charlie', 200);

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

INSERT INTO ProfileLevel (name, required_total_attributes) VALUES
  ('Beginner', 0),
  ('Intermediate', 5),
  ('Advanced', 12);

INSERT INTO CommunityGroup (name, description) VALUES
  ('Team Sunrise', 'Early birds who focus on sleep and routines'),
  ('Team Momentum', 'Fitness and productivity crew');

INSERT INTO PlayerProfile (user_id, strength, stamina, focus, group_id, level_id) VALUES
  (1, 1, 1, 1, 1, 1),
  (2, 2, 1, 0, 2, 1),
  (3, 1, 2, 1, 1, 2);

INSERT INTO CompetitionSeason (name, start_date, end_date) VALUES
  ('Season 1', '2026-01-01', '2026-01-31');

INSERT INTO GroupMatch (group_a_id, group_b_id, season_id, match_date) VALUES
  (1, 2, 1, '2026-01-05');

INSERT INTO Achievement (name, description) VALUES
  ('First Steps', 'Complete your first wellness challenge'),
  ('Shopper', 'Buy your first shop item'),
  ('Daily Regular', 'Claim daily reward at least once');

INSERT INTO UserAchievement (user_id, achievement_id) VALUES
  (1, 1);

INSERT INTO ShopItem (name, description, cost) VALUES
  ('Energy Drink', 'Boost your vibe for the day', 20),
  ('Focus Snack', 'A small snack to stay locked in', 15),
  ('Gym Pass', 'Motivation to get moving', 30);

INSERT INTO UserInventory (user_id, item_id, quantity) VALUES
  (1, 1, 2),
  (2, 2, 1);

INSERT INTO DailyClaim (user_id, last_claimed_at) VALUES
  (1, '2026-01-03 09:00:00'),
  (2, NULL),
  (3, NULL);

`;

const callback = (error, results) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully:", results);
  }
  process.exit();
};

pool.query(SQLSTATEMENT, callback);