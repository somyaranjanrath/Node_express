import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    logoutTime: {
        type: mongoose.Schema.Types.Mixed,
        default: "Session in progress"
    },
    sessionDuration: {
        type: String,
        default: "Session in progress"
    }
}, {
    timestamps: true
});

const Activity = mongoose.model("session_logs", activitySchema, "session_logs");

export default Activity;
