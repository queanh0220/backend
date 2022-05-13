const express = require("express");
const uploadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require('../db');
const ObjectId = require('mongodb').ObjectID;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("destination")
    cb(null, "uploads");
    
  },
  filename: function (req, file, cb) {
    console.log("filename", file)
    cb(null, file.fieldname + "-" + Date.now());
    
  },
});

var upload = multer({ storage: storage });

uploadRouter.post("/", upload.single('myFile'), async (req, res) => {
    console.log("req file", req.file)
  const file = req.file;
  console.log("req a")
  if (!file) {
    console.log("req b")
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  const result = await (await getDbInstance()).collection('uploads').insertOne(
    file
  );
  res.send({fileId: result.insertedId});
});

uploadRouter.get("/:id", async (req, res) => {
    //step 1: lay param id
    const id = req.params.id;
    //step 2: lay metadata cua file tu database bang id
    let meta = await (await getDbInstance()).collection("uploads").findOne({"_id": new ObjectId(id)});
    //step 3: doc file va gui ve client
    console.log(meta)
    const dir = `./uploads/${meta.filename}`
    console.log(dir)
    res.setHeader('Content-disposition', `attachment; filename=nghia.jpg`);
    res.setHeader('Content-type', meta.mimetype);
    res.download(dir)
//  res.send({fileId: result.insertedId});
});

module.exports = uploadRouter;
