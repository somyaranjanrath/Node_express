import Activity from "../models/activity.js";

const admin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role?.toLowerCase() !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only..." });
        }

        // Verify that the admin is currently logged in (active session in progress)
        const activeSession = await Activity.findOne({
            userId: req.user._id,
            logoutTime: "Session in progress"
        });

        if (!activeSession) {
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