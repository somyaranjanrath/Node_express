//const express = require('express');
import express from 'express'
const app = express();
const port = 4001;

app.get('/',(req,res)=>{
    res.send("express server.....");
})
app.listen(port,()=>{
    console.log(`app is listening on port no. ${port}`)
})