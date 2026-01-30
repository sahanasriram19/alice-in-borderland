//Import Model
const model = require("../models/achievementModel");

// POST /achievements
module.exports.create = (req, res, next) => {
  if (!req.body.name || !req.body.description) {
    return res.status(400).json({ message: "name and description are required" });
  }

  const data = { name: req.body.name, description: req.body.description };

  const callback = (error, results) => {
    if (error) {
      console.error("Error create achievement:", error);
      return res.status(500).json(error);
    }
    res.locals.id = results.insertId;
    next();
  };

  model.createAchievement(data, callback);
};

// GET /achievements
module.exports.readAll = (req, res, next) => {
  const callback = (error, results) => {
if (error) {
  console.error("Error readAll achievements:", error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
    res.locals.result = results;
    next();
  };
  model.selectAll(callback);
};

// GET /achievements/:id
module.exports.readById = (req, res, next) => {
  const data = { id: res.locals.id || req.params.id };

  const callback = (error, results) => {
if (error) {
  console.error("Error read achievement:", error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
    if (results.length === 0) return res.status(404).json({ message: "Achievement not found" });

    res.locals.result = results[0];
    next();
  };

  model.selectById(data, callback);
};

// PUT /achievements/:id
module.exports.updateById = (req, res, next) => {
  if (!req.body.name || !req.body.description) {
    return res.status(400).json({ message: "name and description are required" });
  }

  const data = { id: req.params.id, name: req.body.name, description: req.body.description };

  const callback = (error, results) => {
if (error) {
  console.error("Error readUpdateById:", error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
    if (results.affectedRows === 0) return res.status(404).json({ message: "Achievement not found" });

    res.locals.id = data.id;
    next();
  };

  model.updateById(data, callback);
};


// POST /achievements/:id/unlock
module.exports.prepareUnlock = (req, res, next) => {
  if (!res.locals.userId) return res.status(400).json({ message: "user_id is required" });
  res.locals.unlock = { user_id: res.locals.userId, achievement_id: req.params.id };
  next();
};

module.exports.unlock = (req, res, next) => {
  const data = res.locals.unlock;

  const callback = (error) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Achievement already unlocked" });
      console.error("Error unlock achievement:", error);
    }

    if (error) {
    console.error("Error readUnlock Achievement:", error);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
    res.locals.result = data;
    next();
  };

  model.unlockAchievement(data, callback);
};

// GET /users/:user_id/achievements 
module.exports.readUnlockedRawByUserId = (req, res, next) => {
  const data = { user_id: res.locals.userId };

  const callback = (error, results) => {
if (error) {
  console.error("Error readUnlockedRawByUserId:", error);
  return res.status(500).json({
    message: "Internal server error"
  });
}
    res.locals.result = results;
    next();
  };

  model.selectUnlockedByUserId(data, callback);
};