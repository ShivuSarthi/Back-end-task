const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //   useCreateIndex: true,
    })
    .then((data) => {
      console.log(`Mongodb connected...!`);
    });
};

module.exports = connectDatabase;
