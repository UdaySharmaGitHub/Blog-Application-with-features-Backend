// require('dotenv').config({path:"./env"})   // its reduce the consistency of code

// import express from 'express'

// importing app.js
import { app } from './app.js';
import connectDB from './db/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config({
    path:'./env'
})

// This Good Approach
// connectDB is async method and technically its return promise
connectDB()
.then(()=>{
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
})
.catch((error)=>{
    console.log("MongoDB is unable to connect",error);
})
