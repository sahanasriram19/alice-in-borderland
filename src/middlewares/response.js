module.exports.withMessage = function(message, status) {
    return function(req, res, next) {
        res.locals.message = message;
        if (status) res.locals.status = status;
        next();
    };
}

module.exports.sendResponse = function(req, res, next) {
    const status = res.locals.status || 200;
    const message = res.locals.message || "Success";

    const data = {...res.locals };
    delete data.message;
    delete data.status;

    res.status(status).json({ message, data});
    };