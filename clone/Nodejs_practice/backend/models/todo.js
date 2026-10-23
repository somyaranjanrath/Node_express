import mongoose from "mongoose";

const todo_schema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true

    }
},{
    timestamps:true
})

const Todo=mongoose.model("todo",todo_schema)

export default Todo;