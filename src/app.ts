import * as path from "path";
import express, {
  ErrorRequestHandler,
  Express,
  NextFunction,
  Request,
  Response,
} from "express";
import "dotenv/config";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";
import { get500, notFound } from "./controllers/404";
import mongoose from "mongoose";
import User from "./models/user";
import session from "express-session";
import "./types/express-session";
import "./types/express";
import ConnectMongoDBSession, { MongoDBStore } from "connect-mongodb-session";
import csrf from "csurf";
import flash from "connect-flash";
import multer, { Field, FileFilterCallback } from "multer";

const app = express();

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: "images/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const mongoDBStore = ConnectMongoDBSession(session);

const store: MongoDBStore = new mongoDBStore({
  collection: "sessions",
  uri: process.env.MONGO_LOCAL!,
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/images", express.static(path.join(__dirname, "..", "images")));

app.use(express.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(
  session({
    secret: "my secret key",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use(async (req: Request, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error: any) {
    throw new Error(error);
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", get500);
app.use(notFound);

app.use(
  (
    error: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.redirect("/500");
  }
);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_LOCAL!);
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
  } catch (error) {
    console.log(error);
  }
};

startServer();
