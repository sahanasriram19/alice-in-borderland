// Import Model
const model = require("../models/groupModel.js");

// GET /groups
module.exports.readAllGroups = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllGroups:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        else {
            res.locals.groups = results;
            next();
        }
    };

    model.selectAll(callback);
};

module.exports.checkGroupCapacity = (req, res, next) => {
  const data = { group_id: req.params.group_id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error checkGroupCapacity:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const count = results[0].member_count;

    if (count >= 5) {
      return res.status(409).json({ message: "Group is full" });
    }

    next();
  };

  model.countMembersByGroupId(data, callback);
};

// POST /groups/:group_id/join
module.exports.joinGroup = (req, res, next) => {
    if (!req.params.group_id || !req.body.user_id) {
     return res.status(400).json({ message: "group_id and user_id are required" });
    }
    
    const data = {
        group_id: req.params.group_id,
        user_id: req.body.user_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error joinGroup:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        else {
            res.locals.group = {
                user_id: data.user_id,
                group_id: data.group_id
            };
            next();
        }
    };

    model.joinGroup(data, callback);
};