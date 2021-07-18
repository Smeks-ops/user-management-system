import cors from "cors";
import { Consola } from "consola";
import express from "express";
import mongoose from "mongoose";
import { json } from "body-parser";

//IMPORT APPLICATION CONSTANTS
import { DB, PORT } from './constants'

//Router exports
import userApis from "./apis/users"

// initialize express application
const app = express();

//Apply application middlewares
app.use(cors())
app.use(json())

//Inject router and apis
app.use('/users', userApis)


const main = async () => {
  try {
    // Connect with the database
    await mongoose.connect(DB, {
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    })
    consola.success("DATABASE CONNECTED...")
    //start app listening for req on server
    app.listen(PORT, () => consola.success(`Server started on port ${PORT}`))
  } catch (error) {
    consola.error(`Unable to start the server \n${error.message}`)
  }
}

main();