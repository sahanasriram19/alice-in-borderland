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


      DROP TABLE IF EXISTS UserInventory;
      DROP TABLE IF EXISTS ShopItem;
      DROP TABLE IF EXISTS GroupMatch;
      DROP TABLE IF EXISTS UserProfile;
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
        points INT DEFAULT 0,
        current_level_id INT DEFAULT 1
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
        character_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        required_total_points INT NOT NULL
      );

      CREATE TABLE CommunityGroup (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
      );

      CREATE TABLE UserProfile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        group_id INT DEFAULT NULL
      );

      CREATE TABLE GroupMatch (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_a_id INT NOT NULL,
        group_b_id INT NOT NULL,
        season_id INT NOT NULL,
        match_date DATE
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

    INSERT INTO User (username, email, password, points, current_level_id) VALUES
        ('hannah', 'hannah@example.com', '${hash}', 5, 1),  
        ('alice', 'alice@example.com', '${hash}', 50, 8),      
        ('george', 'george@example.com', '${hash}', 15, 3),    
        ('david', 'david@example.com', '${hash}', 20, 4),       
        ('sahana', 'sahana@example.com', '${hash}', 25, 5),    
        ('bob', 'bob@example.com', '${hash}', 30, 6),           
        ('ivan', 'ivan@example.com', '${hash}', 33, 6),         
        ('diana', 'diana@example.com', '${hash}', 35, 6),      
        ('jonathan', 'jonathan@example.com', '${hash}', 40, 7), 
        ('julia', 'julia@example.com', '${hash}', 44, 7),      
        ('fiona', 'fiona@example.com', '${hash}', 45, 7),       
        ('charlie', 'charlie@example.com', '${hash}', 10, 2),   
        ('vecna', 'vecna@example.com', '${hash}', 100, 9);      

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
        (3, 1, 'Stayed off my phone for an hour while reading a book.'),
        (1, 2, 'Slept for 8 hours last night!'),
        (2, 2, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 2, 'Stayed off my phone for an hour while reading a book.'),
        (1, 3, 'Slept for 8 hours last night!'),
        (2, 3, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 3, 'Stayed off my phone for an hour while reading a book.'),
        (1, 4, 'Slept for 8 hours last night!'),
        (2, 4, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 4, 'Stayed off my phone for an hour while reading a book.'),
        (1, 5, 'Slept for 8 hours last night!'),
        (2, 5, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 5, 'Stayed off my phone for an hour while reading a book.'),
        (1, 6, 'Slept for 8 hours last night!'),
        (2, 6, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 6, 'Stayed off my phone for an hour while reading a book.'),
        (1, 7, 'Slept for 8 hours last night!'),
        (2, 7, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 7, 'Stayed off my phone for an hour while reading a book.'),
        (1, 8, 'Slept for 8 hours last night!'),
        (2, 8, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 8, 'Stayed off my phone for an hour while reading a book.'),
        (1, 9, 'Slept for 8 hours last night!'),
        (2, 9, 'Took the stairs to the 5th floor. Feeling accomplished!'),
        (3, 9, 'Stayed off my phone for an hour while reading a book.');

       INSERT INTO ProfileLevel (character_name, description, required_total_points) VALUES
        ('Chota','Chota is the heart of the trio, loyal, 
        supportive, and brave in the face of fear. 
        You unlock him at 0 points as your 
        starting profile — pure determination, 
        even before the game begins.', 0),

        ('Karube','Karube is the fighter of the friend group,
        energetic,athletic, and protective. At 10 points, you’ve proven 
        enough consistency to unlock his bold, action-first mindset.',10),

        ('Aguni','Aguni is a hardened survivor, disciplined, relentless,
        and shaped by brutal choices. At 15 points, you unlock a profile 
        that represents raw resilience and combat readiness.',15),

        ('Ann','Ann is calm, observant, and highly capable under pressure,
        a strategic climber and analyst. At 20 points, you unlock a 
        profile built on intelligence, endurance, and composure.',20),

        ('Kuina','Kuina is fast, fearless, and skilled, a stylish but 
        deadly fighter with strong loyalty. At 25 points, you unlock 
        agility and confidence: the “don’t hesitate” mentality.',25),

        ('Chishiya','Chishiya is the mastermind — quiet, calculating, 
        and always three moves ahead. At 30 points, you unlock pure 
        strategy and manipulation: the profile of a true tactician.',30),

        ('Usagi','Usagi is survival itself: athletic, fearless, and 
        emotionally grounded. At 40 points, you unlock a profile 
        representing peak stamina, courage, and the will to keep going.',40),

        ('Arisu','Arisu is the core player — a problem-solver who grows 
        into leadership through pain and sacrifice. At 50 points, you 
        unlock the profile of someone who survives by thinking, not luck.',50),
        
        ('Mira','Mira is the endgame: charismatic, intelligent, and 
        terrifyingly calm. At 100 points, you unlock the highest tier,
        a profile that symbolizes control, power, and final-boss energy.',100);

      INSERT INTO CommunityGroup (name, description) VALUES
      ('Team Sunrise', 'Early birds who focus on sleep and routines'),
      ('Team Momentum', 'Fitness and productivity crew'),
      ('The Beach Squad', 'Social-driven team: consistency + community challenges'),
      ('Spade Runners', 'Endurance and cardio grinders (walks, runs, stamina)'),
      ('Heart Keepers', 'Mental wellness + social connection (journaling, check-ins)'),
      ('Diamond Minds', 'Focus and discipline (study blocks, digital detox, deep work)'),
      ('Club Crew', 'Balanced players: mix of strength, sleep, and productivity'),
      ('Wolf Pack', 'Hardcore challengers chasing max points daily'),
      ('Silent Steps', 'Low-key team: consistency over intensity'),
      ('Iron Resolve', 'Strength + resilience focused (pushups, gym, training)'),
      ('Zen Circle', 'Mindfulness and recovery: stretch, breathe, meditate'),
      ('Borderland Veterans', 'Experienced players: strategic point farming');

        INSERT INTO UserProfile (user_id, group_id) VALUES
        (1, 1),
        (2, 1),
        (3, 1),
        (4, 1),
        (5, 2),
        (6, 2),
        (7, 2),
        (8, 2),
        (9, 3),
        (10, 3),
        (11, 4),
        (12, 5);

      INSERT INTO GroupMatch (group_a_id, group_b_id, season_id, match_date) VALUES
        (1, 2, 1, '2026-01-05');

      INSERT INTO ShopItem (name, description, cost, power) VALUES
      ('Visa Extension Card', 'Extends your survival time in the Borderland.', 20, 5),
      ('Heart Suit Token', 'A mysterious token tied to emotional trials and trust-based games.', 15, 3),
      ('Arena Access Pass', 'Grants access to high-risk, high-reward group matches in the Borderland.', 30, 7),
      ('Face Card Relic', 'A powerful artifact rumored to be linked to the Face Card rulers.', 45, 12),
      ('Borderland Beacon', 'A glowing beacon that signals allies across the wasteland.', 40, 10);

      INSERT INTO UserInventory (user_id, item_id, quantity) VALUES
        (1, 1, 1),
        (1, 3, 1),
        (2, 2, 1),
        (2, 3, 1),
        (3, 1, 1),
        (3, 3, 1),
        (4, 4, 1),
        (5, 5, 1);

      `;

    pool.query(SQLSTATEMENT, callback);
  }
});
