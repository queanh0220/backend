const express = require('express')
const userRouter = express.Router()
const md5 = require("md5");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { getDbInstance } = require('../db');
const ObjectId = require('mongodb').ObjectID;

userRouter.get("/", async (req, res) => {
  // fs.readFile("users.json", "utf8", function (err, data) {
  //   console.log(data);
  //   res.status(200).json(JSON.parse(data)).end();
  // });
  const data = await (await getDbInstance()).collection("users").find({}).toArray();
  res.status(200).json(data).end()
}); 


userRouter.get("/:id", async (req, res) => {
  try {
    (await getDbInstance()).collection("users").findOne({"_id": new ObjectId(req.params.id)}, (err, result) => {
      if(result) {
        res.status(200).json(result).end()
      }
      else {
        res.status(400).json({ message: "user not found!" }).end();
      }
      
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "user not found!" }).end();
  }
  
  
  

  // fs.readFile("users.json", "utf8", function (err, data) {
  //   users = JSON.parse(data);
  //   const user = users.find((user) => user.id === req.params.id);
  //   if (!user) {
  //     return res.status(400).json({ message: "user not found!" }).end();
  //   }
  //   res.status(200).json(user).end();
  // });
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

userRouter.put("/:id", async (req, res) => {
  const newData = { $set: req.body }
  try {
    (await getDbInstance()).collection("users").update({"_id": new ObjectId(req.params.id)},newData, (err, result) => {
      
      if(result.upsertedId) {
        res.status(200).json({ message: "edit success" }).end();
      }
      else {
        res.status(400).json({ message: "user not found!" }).end();
      }
      
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "user not found!" }).end();
  }

  // const user = users.find((user) => user.id === req.params.id);
  // if (!user) {
  //   return res.status(400).json({ message: "user not found!" }).end();
  // }
  // user.username = req.body.username;
  // user.password = md5(req.body.password);

  // res.status(200).json({ message: "edit success" }).end();
});

userRouter.delete("/:id", async (req, res) => {
  try {
    (await getDbInstance()).collection("users").deleteOne({"_id": new ObjectId(req.params.id)}, (err, result) => {
      if(result.deleteCount) {
        res.status(200).json({ message: "edit success" }).end();
      }
      else {
        res.status(400).json({ message: "user not found!" }).end();
      }
      
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "user not found!" }).end();
  }
  // const user = users.find((user) => user.id === req.params.id);
  // if (!user) {
  //   return res.status(400).json({ message: "user not found!" }).end();
  // }
  // users = users.filter((user) => user.id !== req.params.id);
  // res.status(200).json({ message: "delete success" }).end();
});

module.exports = userRouter