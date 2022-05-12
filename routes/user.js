const express = require('express')
const userRouter = express.Router()
const md5 = require("md5");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { getDbInstance } = require('../db')

userRouter.get("/", (req, res) => {
  fs.readFile("users.json", "utf8", function (err, data) {
    console.log(data);
    res.status(200).json(JSON.parse(data)).end();
  });
});

userRouter.get("/:id", (req, res) => {
  let users;
  fs.readFile("users.json", "utf8", function (err, data) {
    users = JSON.parse(data);
    const user = users.find((user) => user.id === req.params.id);
    if (!user) {
      return res.status(400).json({ message: "user not found!" }).end();
    }
    res.status(200).json(user).end();
  });
});

userRouter.post("/", async (req, res) => {
  if (req.body.password.length < 5) {
    return res.status(400).json({ message: "password invalid" }).end();
  }
  const user = (await getDbInstance()).collection('users').insertOne( {
    username: req.body.username,
    password: md5(req.body.password),
  });
  console.log(user)
  return res.status(200).end()
});

userRouter.put("/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(400).json({ message: "user not found!" }).end();
  }
  user.username = req.body.username;
  user.password = md5(req.body.password);

  res.status(200).json({ message: "edit success" }).end();
});

userRouter.delete("/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(400).json({ message: "user not found!" }).end();
  }
  users = users.filter((user) => user.id !== req.params.id);
  res.status(200).json({ message: "delete success" }).end();
});

module.exports = userRouter