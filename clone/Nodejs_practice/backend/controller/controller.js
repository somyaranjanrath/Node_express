import Todo from "../models/todo.js"

export const fetch = async(req,res)=>{
    //console.log("Welcome.....")
    // res.status(200).json({message:"Welcome to node.js course ..... fetch the data"})

    try {
        const todos = await Todo.find().populate("createdBy","username")
        res.status(200).json({message:"todos....",todos}) 
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
}

export const create = async(req,res)=>{
    // const id = req.body.id;   //old technique/approch
    // const name = req.body.name;
    // const address = req.body.address;

    // const {id,name,address} = req.body
    // console.log(id,name,address);

    // res.status(200).json({message:"Posting the data......",id,name,address})

    //error handling
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        const todo = await Todo.create({ title, description, createdBy: req.user.id });
        return res.status(201).json({ message: "Todo stored", todo });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}

export const update = async(req,res)=>{
    //console.log("Welcome.....")
    // res.status(200).json({message:"Updating the data......"})
    try {
        const {id}=req.params;
        const {title,description}=req.body

        const todo = await Todo.findByIdAndUpdate(
            id,
            {title,description},
            {new:true}
        )
        res.status(201).json({message:"Todo Updated", todo})

    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})

    }
}

export const remove = async(req,res)=>{
    //console.log("Welcome.....")
    try {
        const {id}=req.params;

        const todo = await Todo.findByIdAndDelete(
            id
        )
        res.status(200).json({message:"Deleting the todo data......"})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
}