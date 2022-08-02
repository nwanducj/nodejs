const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const compression = require("compression");
const morgan = require("morgan");
const connectDb = require("./connection/Database");
const myserver = require("./routes/Server");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const { logger } = require("./helpers/logger");

//admin imports
const admin_auth = require("./routes/admin/auth");
const admin = require("./routes/admin/admin_crud");
//const user = require("./routes/admin/user");


//user routes imports
const user_crud = require("./routes/user/user_crud");
const user_auth = require("./routes/user/auth");

process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  // eslint-disable-next-line no-console
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//Allow all requests from all domains & localhost
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE");
  next();
});

// Routes
app.use("", myserver);

// Admin routes
app.use("/api/v1/admin", admin);
app.use("/api/v1/admin/auth", admin_auth);
//app.use("/api/v1/admin", user)


// User routes
app.use("/api/v1/user", user_crud);
app.use("/api/v1/user", user_auth);

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

const port = process.env.PORT || 3400;

let server;

connectDb()
  .then(() => {
    server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      logger.info(`################################################
      🛡️  Server listening on port: ${port} 🛡️
      ################################################`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed");
  });

process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-console
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  // eslint-disable-next-line no-console
  console.log(err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
