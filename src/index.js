// require('dotenv').config({path:"./env"})   // its reduce the consistency of code

// import express from 'express'
import connectDB from './db/db.js';
import dotenv from 'dotenv';

dotenv.config({
    path:'./env'
})

// This Good Approach
connectDB();
//  const app = express();
