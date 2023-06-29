const mongoose = require("mongoose");
const env = require("dotenv")
env.config

const connect = () => {
  mongoose
    .connect(process.env.mongoDB) 
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고디비 연결 에러", err);
});


module.exports = connect;