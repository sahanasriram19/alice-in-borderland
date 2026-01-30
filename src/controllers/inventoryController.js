// Import Model
const model = require("../models/inventoryModel");

// GET /inventory
module.exports.readInventoryByUserId = (req, res, next) => {
  const data = { user_id: res.locals.userId };

  const callback = (error, results) => {
    if (error) {
      console.error("Error readInventoryByUserId:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.locals.inventory = results;
    next();
  };

  model.selectByUserId(data, callback);
};

// DELETE /inventory/item/:id  
module.exports.deleteInventoryRow = (req, res) => {
  const data = { id: req.params.id };

  const callback = (error, results) => {
    if (error) {
      console.error("Error deleteInventoryRow:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Inventory row not found" });
    }
    res.status(204).end();
  };

  model.deleteById(data, callback);
};

