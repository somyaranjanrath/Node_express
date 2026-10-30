import Activity from "../models/activity.js";
import { logUserActivity } from "../models/activityLog.js";

export const getAdminAction = (req) => {
    const path = req.originalUrl || req.url || "";
    const method = (req.method || "").toUpperCase();

    if (path.includes("delete_user") || path.includes("remove_user")) {
        return "DELETE_USER";
    }
    if (path.includes("/update")) {
        return "UPDATE_TODO";
    }
    if (path.includes("/remove")) {
        return "DELETE_TODO";
    }
    if (path.includes("/create") || path.includes("/send")) {
        return "CREATE_TODO";
    }
    return `ADMIN_${method}_ACTION`;
};

const admin = async (req, res, next) => {
    try {
        const action = getAdminAction(req);
        const endpoint = req.originalUrl || req.url || "";
        const method = (req.method || "GET").toUpperCase();

        if (!req.user || req.user.role?.toLowerCase() !== "admin") {
            const attemptedUsername = req.user?.username || "Guest";
            const attemptedRole = req.user?.role || "user";

            await logUserActivity({
                req,
                sessionId: req.sessionId,
                userId: req.user?._id || req.user?.id || null,
                username: attemptedUsername,
                role: attemptedRole,
                action,
                details: `Access denied: User '${attemptedUsername}' (${attemptedRole}) attempted admin-only action '${action}' without privileges`,
                endpoint,
                method,
                status: "FAILED"
            });

            return res.status(403).json({ error: "Access denied. Admin only..." });
        }

        // Verify that the admin is currently logged in (active session in progress)
        const activeSession = await Activity.findOne({
            userId: req.user._id,
            logoutTime: "Session in progress"
        });

        if (!activeSession) {
            await logUserActivity({
                req,
                userId: req.user._id,
                username: req.user.username,
                role: req.user.role || "admin",
                action,
                details: `Admin '${req.user.username}' attempted '${action}' without an active login session`,
                endpoint,
                method,
                status: "FAILED"
            });

            return res.status(401).json({
                error: `Admin '${req.user.username}' is not currently logged in. Please login first.`
            });
        }

        req.sessionId = activeSession._id;
        next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default admin;