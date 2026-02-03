// Import models
const model = require("../models/shopModel");
const userModel = require("../models/userModel");

// GET /shop
module.exports.readAllShopItems = (req, res, next) => {
  const callback = (error, results) => {
    if (error) {
      console.error("Error readAllShopItems:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // response.sendResponse will send { message, data: { ... } }
    res.locals.items = results;
    next();
  };

  model.selectAll(callback);
};

// Middleware 1: load item and compute total cost 
module.exports.loadBuyInfo = (req, res, next) => {
  if (!res.locals.userId || !req.body.quantity) {
    return res.status(400).json({ message: "user_id and quantity are required" });
  }

  const buy = {
    user_id: res.locals.userId,
    item_id: req.params.id,
    quantity: req.body.quantity
  };

  

  const callback = (error, results) => {
    if (error) {
      console.error("Error selectItemById:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) return res.status(404).json({ message: "Item not found" });

    res.locals.buy = buy;
    res.locals.totalCost = results[0].cost * buy.quantity;
    next();
  };

  model.selectItemById({ id: buy.item_id }, callback);
};

// Middleware 2: deduct points
module.exports.deductPointsForBuy = (req, res, next) => {
  const buy = res.locals.buy;
  const totalCost = res.locals.totalCost;

  const data = { user_id: buy.user_id, points: totalCost };

  const callback = (error, results) => {
    if (error) {
      console.error("Error deductPointsForBuy:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(403).json({ message: "Not enough points or user not found" });
    }

    next();
  };

  userModel.deductPoints(data, callback);
};

// Middleware 3: add to inventory 
module.exports.addInventoryForBuy = (req, res, next) => {
  const buy = res.locals.buy;

  const callback = (error, results) => {
    if (error) {
      console.error("Error upsertInventory:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.locals.result = {
      user_id: buy.user_id,
      item_id: buy.item_id,
      quantity: buy.quantity,
      points_spent: res.locals.totalCost,
      affectedRows: results.affectedRows
    };
    next();
  };

  model.upsertInventory(buy, callback);
};