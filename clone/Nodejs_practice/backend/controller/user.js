import User from "../models/user.js";
import Activity from "../models/activity.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashpassword = await bcrypt.hash(password, 6);
        const user = await User.create({
            username,
            email,
            password: hashpassword,
            role: role ? role.toLowerCase() : "user"
        });
        return res.status(201).json({ message: "signup successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const get_User = async (req, res) => {
    try {
        const users = await User.find().select("username email password role");
        return res.status(200).json({ message: "users fetched successfully", users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const get_Activities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ loginTime: -1 });
        return res.status(200).json({ message: "activities fetched successfully", activities });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

const formatDuration = (start, end) => {
    if (!start || !end) return "0 seconds";
    const diffMs = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
    return parts.join(" ");
};

export const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const identifier = username || email;

        if (!identifier || !password) {
            return res.status(400).json({ error: "Username/email and password are required" });
        }

        // Allow logging in with either username or email
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "invalid credentials" });
        }

        // Check if user is already logged in (active session with logoutTime === "Session in progress")
        const activeSession = await Activity.findOne({
            userId: user._id,
            logoutTime: "Session in progress"
        });

        if (activeSession) {
            return res.status(400).json({
                error: `User '${user.username}' is already logged in. Please logout before logging in again.`,
                activeSession: {
                    username: activeSession.username,
                    role: activeSession.role,
                    loginTime: activeSession.loginTime,
                    logoutTime: activeSession.logoutTime,
                    sessionDuration: activeSession.sessionDuration
                }
            });
        }

        const loginTime = new Date();

        // Create activity record for this login session
        const activity = await Activity.create({
            userId: user._id,
            username: user.username,
            role: user.role,
            loginTime,
            logoutTime: "Session in progress",
            sessionDuration: "Session in progress"
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            message: "login successfully",
            token,
            activity
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        let user = null;

        // 1. If auth middleware set req.user
        if (req.user && req.user.id) {
            user = await User.findById(req.user.id);
        }

        // 2. Extract from Authorization header if present
        if (!user && req.headers && req.headers.authorization) {
            try {
                const authHeader = req.headers.authorization;
                const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && decoded.id) {
                    user = await User.findById(decoded.id);
                }
            } catch (err) {
                // If token invalid, fallback to request body
            }
        }

        // 3. Extract from request body (identifier: username / email / userId / id)
        if (!user && req.body) {
            const { username, email, userId, id } = req.body;
            const targetId = userId || id;
            const identifier = username || email;

            if (targetId) {
                user = await User.findById(targetId);
            } else if (identifier) {
                user = await User.findOne({
                    $or: [{ email: identifier }, { username: identifier }]
                });
            }
        }

        if (!user) {
            return res.status(404).json({ error: "User not found or credentials/token missing" });
        }

        // Find active session in activity collection
        const activeSession = await Activity.findOne({
            userId: user._id,
            logoutTime: "Session in progress"
        }).sort({ loginTime: -1 });

        if (!activeSession) {
            return res.status(400).json({
                error: `User '${user.username}' is not currently logged in or has already logged out.`
            });
        }

        const logoutTime = new Date();
        activeSession.logoutTime = logoutTime;
        activeSession.sessionDuration = formatDuration(activeSession.loginTime, logoutTime);
        await activeSession.save();

        return res.status(200).json({
            message: "logout successfully",
            activity: {
                username: activeSession.username,
                role: activeSession.role,
                loginTime: activeSession.loginTime,
                logoutTime: activeSession.logoutTime,
                sessionDuration: activeSession.sessionDuration
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};