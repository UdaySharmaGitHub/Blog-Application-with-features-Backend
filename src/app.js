// importing Cookie Parser
import cookieParser from 'cookie-parser';
// importing CORS
import cors from 'cors';
import express from 'express';
const app = express();

//  Always Write these middleware at top
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))
// Setting the JSON Limit
app.use(express.json({
    limit:"50kb"
}))
// URL DATA
app.use(express.urlencoded({
    extended:true,limit:"50kb"}))
// Public Assest in Express
app.use(express.static('public'));
// Cookie Parser
app.use(cookieParser());


//  Routes imports
import userRouter from './routes/user.routes.js';

// Router Declaration
app.use('/api/v1/users',userRouter);  
// https://localhost:8000/api/v1/users its goes to user.routes.js


export {app};