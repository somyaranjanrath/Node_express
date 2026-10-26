import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "session_logs"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: ""
    },
    endpoint: {
        type: String,
        default: ""
    },
    method: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "SUCCESS"
    }
}, {
    timestamps: true
});

const ActivityLog = mongoose.model("activity_logs", activityLogSchema, "activity_logs");

export default ActivityLog;

export const logUserActivity = async ({
    sessionId = null,
    userId = null,
    username = null,
    role = null,
    action,
    details = "",
    endpoint = "",
    method = "",
    status = "SUCCESS",
    req = null
}) => {
    try {
        const effectiveUsername = username || req?.user?.username || "anonymous";
        const effectiveRole = role || req?.user?.role || "unknown";
        const effectiveUserId = userId || req?.user?._id || req?.user?.id || null;
        const effectiveSessionId = sessionId || req?.sessionId || null;
        const effectiveEndpoint = endpoint || req?.originalUrl || req?.url || "";
        const effectiveMethod = method || req?.method || "";

        return await ActivityLog.create({
            sessionId: effectiveSessionId,
            userId: effectiveUserId,
            username: effectiveUsername,
            role: effectiveRole,
            action,
            details,
            endpoint: effectiveEndpoint,
            method: effectiveMethod,
            status
        });
    } catch (err) {
        console.error("Failed to log activity:", err.message);
        return null;
    }
};
