const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;
let users = [
  {
    id: "1",
    username: "a",
    password: "a",
  },
];
const { v4: uuidv4 } = require("uuid");
const md5 = require("md5");
const fs = require("fs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // config mail server
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "anhdaonapa123@gmail.com", //Tài khoản gmail vừa tạo
    pass: "queanhqueanh", //Mật khẩu tài khoản gmail vừa tạo
  },

});

app.get("/users", (req, res) => {
  fs.readFile("users.json", "utf8", function (err, data) {
    console.log(data);
    res.status(200).json(JSON.parse(data)).end();
  });
});

app.get("/users/:id", (req, res) => {
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

app.post("/users", (req, res) => {
  if (req.body.password.length < 5) {
    return res.status(400).json({ message: "password invalid" }).end();
  }

  const user = {
    id: uuidv4(),
    username: req.body.username,
    password: md5(req.body.password),
  };
  let users;
  fs.readFile("users.json", "utf8", function (err, data) {
    users = JSON.parse(data);
    users.push(user);
    fs.writeFile("users.json", JSON.stringify(users), "utf8", function (err) {
      if (err) res.status(500).end();
      else {
        res.status(200).json(user).end();
        var mainOptions = {
          // thiết lập đối tượng, nội dung gửi mail
          from: "NQH-Test nodemailer",
          to: req.body.mail,
          subject: "Test Nodemailer",
          text: "Your text is here", //Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
         //Nội dung html mình đã tạo trên kia :))
        };        console.log(mainOptions);


      const xx =  transporter.sendMail(mainOptions, function (err, info) {
            console.log("aaa")
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + info.response);
          }
        });

        console.log('xx',xx)
      }
    });
  });
});

app.put("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(400).json({ message: "user not found!" }).end();
  }
  user.username = req.body.username;
  user.password = md5(req.body.password);

  res.status(200).json({ message: "edit success" }).end();
});

app.delete("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(400).json({ message: "user not found!" }).end();
  }
  users = users.filter((user) => user.id !== req.params.id);
  res.status(200).json({ message: "delete success" }).end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
