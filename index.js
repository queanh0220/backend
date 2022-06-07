const express = require("express");
require("dotenv").config();
const { getDbInstance } = require("./db");
const { transporter } = require("./transporter");
const port = process.env.PORT;
const cors = require("cors");
const cron = require("node-cron");
// const passport = require("passport");

const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();

// const store = session.MemoryStore();
// app.use(
//   session({
//     saveUninitialized: true,
//     secret: 'keyboard cat',
//     cookie: { maxAge: 60000 },
//     store,
//     resave:false
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());



cron.schedule("* * * * *", () => {
  console.log("running a task every minute");
});

const main = async () => {
  await getDbInstance();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());


  require("./routes")(app);
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();
