const express = require("express");
const downloadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require("../db");
const ObjectId = require("mongodb").ObjectID;
const path = require("path");
const sharp = require("sharp");

downloadRouter.get("/:id", async (req, res) => {
  //step 1: lay param id
  const id = req.params.id;
  //step 2: lay metadata cua file tu database bang id
  let meta = await (await getDbInstance())
    .collection("uploads")
    .findOne({ _id: new ObjectId(id) });
  //step 3: doc file va gui ve client
  console.log(meta);
  const dir = `./uploads/${meta.filename}`;
  console.log(dir);
  res.download(dir, meta.originalname);
  //  res.send({fileId: result.insertedId});
});

downloadRouter.get("/resize/:id", async (req, res) => {
  //step 1: lay param id
  const id = req.params.id;
  //step 2: lay metadata cua file tu database bang id
  let meta = await (await getDbInstance())
    .collection("uploads")
    .findOne({ _id: new ObjectId(id) });
  //step 3: doc file va gui ve client
  console.log(meta);
  const dir = `./uploads/${meta.filename}`;
  res.setHeader("Content-type", meta.mimetype);
  res.header('Content-Disposition', 'attachment; filename="150x150-' + meta.originalname + '"');
  const a = sharp(dir).resize(150, 150).pipe(res);
  console.log("resize", a)
  //res.download(meta.pathResize, meta.originalname);
  //  res.send({fileId: result.insertedId});
});

module.exports = downloadRouter;
