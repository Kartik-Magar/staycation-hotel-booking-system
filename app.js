// Core modules
const path = require("path");
//External module
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const DB_PATH =
  "mongodb+srv://root:root@completecoding.kqe40.mongodb.net/StayCation?retryWrites=true&w=majority&appName=CompleteCoding";
const { default: mongoose, connection } = require("mongoose");

// Local module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const errorRouter = require("./routes/errorRouter");
const rootDir = require("./utils/pathUtil");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

app.use("/", (req, res, next) => {
  console.log(req.url, req.method); // due to this middleware we dont have to log req.url,method in every middleware
  next();
});

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
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
const multerOptions = {
  storage: storage,
  fileFilter: fileFilter,
};

app.use(express.urlencoded()); // It will cheak in every time if any date is ther it will store in req.body
app.use(multer(multerOptions).single("photo"));
app.use(express.static(path.join(rootDir, "public")));

app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));

app.use(
  session({
    secret: "We the people of India",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

app.use((req, res, next) => {
  // console.log("Cookie cheak middleware:",req.get('Cookie'));
  // req.session.isLoggedIn = req.get('Cookie')?.split('=')[1] === true? false : true;
  req.session.isLoggedIn = req.session.isLoggedIn;
  console.log(req.session.isLoggedIn);
  next();
});

app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use("/host", hostRouter);

app.use(errorRouter);

const PORT = 3001;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Database connected successefully ");
    app.listen(PORT, () => {
      console.log(`The server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to Databast", err);
  });
