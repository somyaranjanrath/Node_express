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
        let effectiveUsername = username || req?.user?.username;
        let effectiveRole = role || req?.user?.role;
        let effectiveUserId = userId || req?.user?._id || req?.user?.id || null;
        let effectiveSessionId = sessionId || req?.sessionId || null;
        const effectiveEndpoint = endpoint || req?.originalUrl || req?.url || "";
        const effectiveMethod = method || req?.method || "";

        // If user is not yet identified, check if there is an active session running in the database
        if (!effectiveUsername || effectiveUsername === "anonymous") {
            try {
                const Activity = mongoose.models.session_logs || mongoose.model("session_logs");
                if (Activity) {
                    const activeSession = await Activity.findOne({
                        logoutTime: "Session in progress"
                    }).sort({ loginTime: -1 });

                    if (activeSession) {
                        effectiveUsername = activeSession.username;
                        effectiveRole = activeSession.role;
                        effectiveUserId = activeSession.userId;
                        effectiveSessionId = activeSession._id;
                    }
                }
            } catch (lookupErr) {
                // Ignore lookup error if model is not registered
            }
        }

        // Final graceful fallbacks if no session is active
        if (!effectiveUsername || effectiveUsername === "anonymous") {
            effectiveUsername = req?.query?.username || req?.body?.username || "Guest";
        }
        if (!effectiveRole || effectiveRole === "unknown") {
            effectiveRole = "user";
        }

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
