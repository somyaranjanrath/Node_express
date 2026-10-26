import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Activity from "../models/activity.js";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header is missing" });
        }
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

export default auth;