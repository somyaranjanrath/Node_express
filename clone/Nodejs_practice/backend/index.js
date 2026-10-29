import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from "./routes/route.js";
import user from './routes/user.js';
import { connectdb } from './database/db.js';

const app = express();
dotenv.config();

// Security headers
app.use(helmet());

// Rate limiting to mitigate brute-force password guessing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: "Too many attempts from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false
});

app.use("/api/user/login", authLimiter);
app.use("/api/user/signup", authLimiter);
app.use("/user/login", authLimiter);
app.use("/user/signup", authLimiter);

// Database connection
connectdb();

// Routing
app.use(express.json());
app.use("/api", routes);
app.use("/api", user);
app.use("/", routes);
app.use("/", user);

const port = process.env.PORT
console.log(port);

app.get('/',(req,res)=>{
    res.send("express server.....");
})

app.listen(port,()=>{
    console.log(`server is running on port no. ${port}`)
})