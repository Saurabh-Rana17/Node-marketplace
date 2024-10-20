"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postNewPassword = exports.getNewPassword = exports.postReset = exports.getReset = exports.postSignup = exports.getSignup = exports.postLogout = exports.postLogin = exports.getLogin = void 0;
const crypto = __importStar(require("crypto"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_validator_1 = require("express-validator");
const transport = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SENDER_MAIL,
        pass: process.env.APP_PASS,
    },
});
const getLogin = (req, res) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = "";
    }
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldInp: {
            email: "",
            password: "",
        },
        validationErrors: [],
    });
};
exports.getLogin = getLogin;
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldInp: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
        });
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "error invalid email or password",
            oldInp: {
                email: email,
                password: password,
            },
            validationErrors: [],
        });
    }
    try {
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (match) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save(() => {
                res.redirect("/");
            });
        }
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "error invalid email or password",
            oldInp: {
                email: email,
                password: password,
            },
            validationErrors: [],
        });
    }
    catch (error) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "error invalid email or password",
            oldInp: {
                email: email,
                password: password,
            },
            validationErrors: [],
        });
    }
});
exports.postLogin = postLogin;
const postLogout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
};
exports.postLogout = postLogout;
const getSignup = (req, res) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = "";
    }
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: message,
        oldInp: { email: "", password: "", confirmPassword: "" },
        validationErrors: [],
    });
};
exports.getSignup = getSignup;
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup",
            errorMessage: errors.array()[0].msg,
            oldInp: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 12);
    const user = new user_1.default({
        cart: { items: [] },
        email: email,
        password: hashedPassword,
    });
    yield user.save();
    const mailOptions = {
        from: {
            name: "Saurabh Rana",
            address: process.env.SENDER_MAIL,
        },
        to: email,
        subject: "sending mail using node mailer",
        text: "this is a text",
        html: "<b>Your new  Account Created</b>",
    };
    res.redirect("/login");
    try {
        const resp = yield transport.sendMail(mailOptions);
    }
    catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
});
exports.postSignup = postSignup;
const getReset = (req, res) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = "";
    }
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Signup",
        errorMessage: message,
    });
};
exports.getReset = getReset;
const postReset = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    crypto.randomBytes(32, (error, buffer) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.log(error);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        const user = yield user_1.default.findOne({ email: email });
        if (!user) {
            req.flash("error", "No Account with that email found");
            return res.redirect("/reset");
        }
        const now = new Date();
        user.resetToken = token;
        user.resetTokenExpiration = new Date(now.getTime() + 1000 * 60 * 60);
        yield user.save();
        res.redirect("/");
        try {
            transport.sendMail({
                from: {
                    name: "Shop Node",
                    address: process.env.SENDER_MAIL,
                },
                to: email,
                subject: "Password reset",
                text: "this is a text",
                html: `
        <p> You Requested a Password Reset </p>
        <p> Click this  <a href="http://localhost:3000/reset/${token}"> link </a>  to set a new password </p>
        `,
            });
        }
        catch (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        }
    }));
});
exports.postReset = postReset;
const getNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = "";
    }
    const token = req.params.token;
    const user = yield user_1.default.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    });
    res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user === null || user === void 0 ? void 0 : user._id.toString(),
        passwordToken: token,
    });
});
exports.getNewPassword = getNewPassword;
const postNewPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, password: newPassword, passwordToken } = req.body;
    try {
        const user = yield user_1.default.findOne({
            resetToken: passwordToken,
            _id: userId,
            resetTokenExpiration: {
                $gt: Date.now(),
            },
        });
        const hashPass = yield bcrypt_1.default.hash(newPassword, 12);
        if (user) {
            user.password = hashPass;
            user.resetToken = null;
            user.resetTokenExpiration = null;
            yield user.save();
            return res.redirect("/login");
        }
    }
    catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
});
exports.postNewPassword = postNewPassword;
