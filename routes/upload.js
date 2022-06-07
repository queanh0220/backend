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
    if (file.originalname.startsWith("")) {
      return callback(null, true);
    }
    callback(new Error("File name not start with Napa"));
  },
});

uploadRouter.post("/", (req, res) => {
  const up = upload.single("file");
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
    const img = fs.readFileSync(req.file.path);
    const encode = img.toString('base64');
    file.imgBuffer = new Buffer(encode, 'base64');
    const result = await (await getDbInstance())
      .collection("uploads")
      .insertOne(file);
    const value = result.insertedId;
    res.send({
      link: `http://localhost:3000/upload/${value}`,
      "resize-link": `http://localhost:3000/download/resize/${value}`,
    });
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
    const value = Object.values(result.insertedIds).map((item) => {
      return {
        link: `http://localhost:3000/${item}`,
        "resize-link": `http://localhost:3000/download/resize/${item}`,
      };
    })
    res.send(
      value
    );
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
  // const dir = `./uploads/${meta.filename}`;
  // console.log(dir);
  res.contentType(meta.mimetype)
  res.send(meta.imgBuffer.buffer);
  //  res.send({fileId: result.insertedId});
});

module.exports = uploadRouter;
