// const fs = require ('fs')

// fs.writeFileSync("test.txt","Learning maen stack architecture")

// const r = fs.readFileSync("test.txt","utf8")

// console.log(r);



// const path = require('path')
// const result = path.join("folder","text_doc","test.txt")
// console.log(result)



const event = require ('events')
const e = new event()
e.on("hello",()=>{
    console.log("Learn coading....")
}) 
e.emit("hello")