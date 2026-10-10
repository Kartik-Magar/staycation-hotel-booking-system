const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const mongoose = require("mongoose");

const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const errorRouter = require("./routes/errorRouter");
const rootDir = require("./utils/pathUtil");
const { serveImage } = require("./utils/imageStorage");

const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
if (!mongoUri || !sessionSecret) {
  console.error("MONGODB_URI and SESSION_SECRET are required.");
  process.exit(1);
}

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

const sessionStore = new MongoDBStore({ uri: mongoUri, collection: "sessions" });
sessionStore.on("error", (error) => console.error("Session store error:", error));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype));
  },
});

app.get("/health", (_req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).send("OK");
});
app.use(express.urlencoded({ extended: false }));
app.use(upload.single("photo"));
app.use(express.static(path.join(rootDir, "public")));
app.get("/uploads/:id", serveImage);
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
}));

app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.userType !== "host") return res.sendStatus(403);
  next();
});
app.use("/host", hostRouter);
app.use(errorRouter);

const port = Number(process.env.PORT) || 3001;
mongoose.connect(mongoUri)
  .then(() => app.listen(port, "0.0.0.0", () => {
    console.log(`StayCation listening on port ${port}`);
  }))
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
