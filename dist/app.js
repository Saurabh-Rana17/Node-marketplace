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
const path = __importStar(require("path"));
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const shop_1 = __importDefault(require("./routes/shop"));
const _404_1 = require("./controllers/404");
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./models/user"));
const express_session_1 = __importDefault(require("express-session"));
require("./types/express-session");
require("./types/express");
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const csurf_1 = __importDefault(require("csurf"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const multer_1 = __importDefault(require("multer"));
const app = (0, express_1.default)();
const csrfProtection = (0, csurf_1.default)();
const fileStorage = multer_1.default.diskStorage({
    destination: "images/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const mongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
const store = new mongoDBStore({
    collection: "sessions",
    uri: process.env.MONGO_LOCAL,
});
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express_1.default.static(path.join(__dirname, "..", "public")));
app.use("/images", express_1.default.static(path.join(__dirname, "..", "images")));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, multer_1.default)({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
app.use((0, express_session_1.default)({
    secret: "my secret key",
    resave: false,
    saveUninitialized: false,
    store: store,
}));
app.use(csrfProtection);
app.use((0, connect_flash_1.default)());
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return next();
    }
    try {
        const user = yield user_1.default.findById(req.session.user._id);
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        throw new Error(error);
    }
}));
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use("/admin", admin_1.default);
app.use(shop_1.default);
app.use(auth_1.default);
app.get("/500", _404_1.get500);
app.use(_404_1.notFound);
app.use((error, req, res, next) => {
    res.redirect("/500");
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_LOCAL);
        console.log("connected to db");
        // const user = await User.findOne();
        // if (!user) {
        //   const newUser = new User({
        //     name: "saurabh",
        //     email: "saurabh@gmail.com",
        //     cart: { items: [] },
        //   });
        //   newUser.save();
        // }
        app.listen(3000, () => {
            console.log("listening on port 3000");
        });
    }
    catch (error) {
        console.log(error);
    }
});
startServer();
