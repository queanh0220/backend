const express = require("express");
require("dotenv").config();
const { getDbInstance } = require('./db');
const { transporter } = require('./transporter')
const userRouter = require('./routes/user');
const port = process.env.PORT;

const main = async () => {
  await getDbInstance();
  const app = express();
  app.use(express.json());
  app.use('/users', userRouter)
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();




