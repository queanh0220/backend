const express = require("express");
const authRouter = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { getDbInstance } = require("../db");
const ObjectId = require("mongodb").ObjectID;
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require("../middleware/auth");

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "430767610295-car63jkfq7vumfs469a51k7bjmnpcp0j.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    async (token, refreshToken, profile, done) => {
      console.log("hehe", profile);
      const existUser = await (await getDbInstance())
        .collection("users")
        .findOne({ googleId: profile.id });
      if (existUser) {
        console.log("ha");
        done(null, existUser);
      } else {
        const newUser = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.name.familyName + " " + profile.name.givenName,
        };
        console.log("haha");
        const result = await (await getDbInstance())
          .collection("users")
          .insertOne(newUser);
        done(null, result);
      }
    }
  )
);

// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// passport.deserializeUser(async (id, done) => {
//   await (await getDbInstance())
//         .collection("users")
//         .findOne({"_id": new ObjectId(id)});
// });

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  (req, res) => {
    console.log(req);
    const token = generateToken({id:req.user._id});
    
    res.cookie("token", token).redirect("http://localhost:3000/info");
  }
);

authRouter.get("/failure", (req, res) => {
  res.status(401).send("login fail");
});
authRouter.get("/success", verifyToken, async (req, res) => {
    console.log("verify", req.verify)
    const user = await (await getDbInstance()).collection("users").findOne({"_id": new ObjectId(req.verify.id)});
    console.log("user", user);
  res.status(200).send(user);
});

module.exports = authRouter;