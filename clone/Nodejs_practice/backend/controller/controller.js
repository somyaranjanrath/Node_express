import Todo from "../models/todo.js"
import User from "../models/user.js";
import { logUserActivity } from "../models/activityLog.js";

export const fetch = async(req,res)=>{
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });

        // Record read-only activity if user is authenticated or session is active
        if (req.user || req.sessionId) {
            await logUserActivity({
                req,
                action: "FETCH_TODOS",
                details: `Fetched ${todos.length} todo(s)`
            });
        }

        res.status(200).json({ message: "todos....", todos });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const create = async(req,res)=>{
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        const todo = await Todo.create({
            title,
            description,
            createdBy: req.user.username,
            userId: req.user._id || req.user.id
        });

        // Update user todos_performed count
        const targetUserId = req.user._id || req.user.id;
        if (targetUserId) {
            await User.findByIdAndUpdate(targetUserId, { $inc: { todos_performed: 1 } });
        } else if (req.user.username) {
            await User.findOneAndUpdate({ username: req.user.username }, { $inc: { todos_performed: 1 } });
        }

        // Record activity in current session
        await logUserActivity({
            req,
            action: "CREATE_TODO",
            details: `Created todo '${todo.title}'`
        });

        return res.status(201).json({ message: "Todo stored", todo });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}

export const update = async(req,res)=>{
    try {
        const {id}=req.params;
        const {title,description}=req.body

        const todo = await Todo.findByIdAndUpdate(
            id,
            {title,description},
            {new:true}
        );

        if (todo) {
            await logUserActivity({
                req,
                action: "UPDATE_TODO",
                details: `Updated todo '${todo.title}' (ID: ${id})`
            });
        }

        res.status(201).json({message:"Todo Updated", todo});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error.message});
    }
}

export const remove = async(req,res)=>{
    try {
        const {id}=req.params;

        const todo = await Todo.findByIdAndDelete(id);

        if (todo) {
            if (todo.userId) {
                await User.findByIdAndUpdate(todo.userId, { $inc: { todos_performed: -1 } });
            } else if (todo.createdBy) {
                await User.findOneAndUpdate({ username: todo.createdBy }, { $inc: { todos_performed: -1 } });
            }

            await logUserActivity({
                req,
                action: "DELETE_TODO",
                details: `Deleted todo '${todo.title}' (ID: ${id})`
            });
        }

        res.status(200).json({message:"Deleting the todo data......"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error.message});
    }
}