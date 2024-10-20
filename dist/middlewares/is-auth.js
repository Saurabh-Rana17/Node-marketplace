"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAuth(req, res, next) {
    if (!req.session.isLoggedIn) {
        return res.status(401).redirect("/");
    }
    next();
}
exports.default = isAuth;
