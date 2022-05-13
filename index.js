const express = require("express");
require("dotenv").config();
const { getDbInstance } = require('./db');
const { transporter } = require('./transporter')
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');
const port = process.env.PORT;

const cron = require('node-cron');

cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
});

const main = async () => {
  await getDbInstance();
  const app = express();
  app.use(express.json());
  app.use('/users', userRouter)
  app.use('/upload', uploadRouter)
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();




