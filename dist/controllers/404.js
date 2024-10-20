"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get500 = exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).render("404", {
        pageTitle: "404,Page Not Found",
        path: "/404",
        isAuthenticated: req.session.isLoggedIn,
    });
};
exports.notFound = notFound;
const get500 = (req, res) => {
    res.status(500).render("500", {
        pageTitle: "500,Page Not Found",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn,
    });
};
exports.get500 = get500;
