import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Activity from "../models/activity.js";
import { logUserActivity } from "../models/activityLog.js";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        let token = authHeader ? (authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader) : null;
        if (!token) {
            token = req.headers['x-access-token'] || req.headers['x-auth-token'] || req.headers['token'] || req.query?.token;
        }

        if (!token) {
            // Check if an active session is in progress for the user
            const activeSession = await Activity.findOne({
                logoutTime: "Session in progress"
            }).sort({ loginTime: -1 });

            if (activeSession) {
                const user = await User.findById(activeSession.userId);
                if (user) {
                    req.sessionId = activeSession._id;
                    req.user = user;
                    return next();
                }
            }

            // Log unauthorized attempt if targeting an admin endpoint
            const path = req.originalUrl || req.url || "";
            if (path.includes("/create") || path.includes("/send") || path.includes("/update") || path.includes("/remove") || path.includes("delete_user")) {
                let action = "ADMIN_OPERATION";
                if (path.includes("delete_user") || path.includes("remove_user")) action = "DELETE_USER";
                else if (path.includes("/update")) action = "UPDATE_TODO";
                else if (path.includes("/remove")) action = "DELETE_TODO";
                else if (path.includes("/create") || path.includes("/send")) action = "CREATE_TODO";

                await logUserActivity({
                    req,
                    username: "Guest",
                    role: "user",
                    action,
                    details: `Unauthorized attempt: Anonymous guest attempted admin action '${action}' without authentication`,
                    endpoint: path,
                    method: (req.method || "").toUpperCase(),
                    status: "FAILED"
                });
            }

            return res.status(401).json({ error: "Authorization header is missing" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

        // Verify that the user still exists in the database so createdBy never references a non-existent ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "User belonging to this token no longer exists. Please login again." });
        }

        // Attach active session if available
        const activeSession = await Activity.findOne({
            userId: user._id,
            logoutTime: "Session in progress"
        }).sort({ loginTime: -1 });

        if (activeSession) {
            req.sessionId = activeSession._id;
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "invalid token" });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        let token = authHeader ? (authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader) : null;
        if (!token) {
            token = req.headers['x-access-token'] || req.headers['x-auth-token'] || req.headers['token'] || req.query?.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
                const user = await User.findById(decoded.id);
                if (user) {
                    const activeSession = await Activity.findOne({
                        userId: user._id,
                        logoutTime: "Session in progress"
                    }).sort({ loginTime: -1 });

                    if (activeSession) {
                        req.sessionId = activeSession._id;
                    }
                    req.user = user;
                    return next();
                }
            } catch (err) {
                // Token invalid or expired, continue to session fallback
            }
        }

        // If no token was provided, check if an active session is currently in progress
        const activeSession = await Activity.findOne({
            logoutTime: "Session in progress"
        }).sort({ loginTime: -1 });

        if (activeSession) {
            const user = await User.findById(activeSession.userId);
            if (user) {
                req.sessionId = activeSession._id;
                req.user = user;
            }
        }

        next();
    } catch (error) {
        next();
    }
};

export default auth;