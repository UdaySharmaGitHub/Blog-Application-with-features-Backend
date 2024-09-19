import cookieParser from 'cookie-parser';
import express from 'express';
const app = express();

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
export {app};