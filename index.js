import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/index";

//Create a method
//run a method
//iife = self invoked function
//(async () => {})();

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("DB Connected");

    app.on("error", (err) => {
      console.log("Error", err);
      throw err;
    });

    const onListening = () => {
      console.log(`Listening on ${config.PORT}`);
    };

    app.listen(config.PORT, onListening);
  } catch (err) {
    console.log("Error ", err);
    throw err;
  }
})();
