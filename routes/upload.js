const express = require("express");
const uploadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require("../db");
const ObjectId = require("mongodb").ObjectID;
const path = require("path");
const sharp = require("sharp");

const maxSize = 20971520;
//const maxSize = 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("destination");
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log("filename", file);
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, callback) {
    console.log("filter", file);
    if (file.originalname.startsWith("170")) {
      return callback(null, true);
    }
    callback(new Error("File name not start with Napa"));
  },
});

uploadRouter.post("/", (req, res) => {
  const up = upload.single("myFile");
  up(req, res, async (err) => {
    console.log("error upload file", err);
    if (err) {
      res.send(err.message);
      return;
    }
    console.log("req file", req.file);
    const file = req.file;
    if (!file) {
      res.send("Please upload a file");
      return;
    }
    const resize = await sharp(file.path)
      .resize(170, 120)
      .toFile(`./resizes/170x120-${file.filename}`);

    console.log("resize", resize);
    const result = await (await getDbInstance())
      .collection("uploads")
      .insertOne({ ...file, pathResize: `./resizes/170x120-${file.filename}` });
    res.send({ fileId: result.insertedId });
  });
});

uploadRouter.post(
  "/multiple",
  upload.array("myFiles", 12),
  async (req, res) => {
    console.log("req files", req.files);
    const files = req.files;
    if (!files) {
      res.send("Please upload a file");
      return;
    }
    const result = await (await getDbInstance())
      .collection("uploads")
      .insertMany(files);
    res.send(result.insertedIds);
  }
);

uploadRouter.get("/:id", async (req, res) => {
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

module.exports = uploadRouter;
