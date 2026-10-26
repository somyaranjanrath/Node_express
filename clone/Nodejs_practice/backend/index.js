import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

import express from 'express';
import dotenv from 'dotenv';
import routes from "./routes/route.js";
import user from './routes/user.js';
import { connectdb } from './database/db.js';

const app = express();
dotenv.config();

//database
connectdb();

//routing
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