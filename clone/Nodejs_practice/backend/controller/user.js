import User from "../models/user.js";
import Activity from "../models/activity.js";
import Access, { getRoleActivities } from "../models/access.js";
import ActivityLog, { logUserActivity } from "../models/activityLog.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        // Check if username or email is already registered so ID remains unique and constant
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            const conflictField = existingUser.email === email ? "Email" : "Username";
            return res.status(400).json({ error: `${conflictField} is already registered` });
        }

        const hashpassword = await bcrypt.hash(password, 6);
        const userRole = role ? role.toLowerCase() : "user";
        const user = await User.create({
            username,
            email,
            password: hashpassword,
            role: userRole
        });

        // Automatically store permissions in the access collection
        await Access.findOneAndUpdate(
            { username: user.username },
            {
                userId: user._id,
                username: user.username,
                role: user.role,
                activities: getRoleActivities(user.role)
            },
            { upsert: true, returnDocument: 'after' }
        );

        return res.status(201).json({ message: "signup successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const get_User = async (req, res) => {
    try {
        const users = await User.find().select("username email password role");

        // Record read-only activity
        await logUserActivity({
            req,
            action: "VIEW_USERS",
            details: `Viewed user list (${users.length} users)`
        });

        return res.status(200).json({ message: "users fetched successfully", users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const get_Activities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ loginTime: -1 });

        // Record read-only activity
        await logUserActivity({
            req,
            action: "VIEW_SESSION_LOGS",
            details: `Viewed session logs (${activities.length} sessions)`
        });

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

        // Log LOGIN activity for this session
        await logUserActivity({
            sessionId: activity._id,
            userId: user._id,
            username: user.username,
            role: user.role,
            action: "LOGIN",
            details: `User '${user.username}' logged in successfully`,
            endpoint: req.originalUrl || "/api/user/login",
            method: "POST"
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

        // Log LOGOUT activity for this session
        await logUserActivity({
            sessionId: activeSession._id,
            userId: user._id,
            username: user.username,
            role: user.role,
            action: "LOGOUT",
            details: `User '${user.username}' logged out (Session duration: ${activeSession.sessionDuration})`,
            endpoint: req.originalUrl || "/api/user/logout",
            method: "POST"
        });

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

export const remove_user = async (req, res) => {
    try {
        const { username, email, id, userId } = req.body || {};
        const paramId = req.params?.id;
        const targetId = paramId || id || userId;

        const cleanUsername = typeof username === "string" ? username.trim() : null;
        const cleanEmail = typeof email === "string" ? email.trim() : null;

        if (!cleanUsername && !cleanEmail && !targetId) {
            return res.status(400).json({ error: "Please provide username, email, or user id to remove user" });
        }

        let userToFind = null;
        if (targetId) {
            userToFind = await User.findById(targetId);
        } else if (cleanUsername && cleanEmail) {
            userToFind = await User.findOne({
                $or: [
                    { username: { $regex: new RegExp(`^${cleanUsername}$`, "i") } },
                    { email: { $regex: new RegExp(`^${cleanEmail}$`, "i") } }
                ]
            });
        } else if (cleanUsername) {
            userToFind = await User.findOne({
                username: { $regex: new RegExp(`^${cleanUsername}$`, "i") }
            });
        } else if (cleanEmail) {
            userToFind = await User.findOne({
                email: { $regex: new RegExp(`^${cleanEmail}$`, "i") }
            });
        }

        if (!userToFind) {
            const searchedFor = cleanUsername ? `username '${cleanUsername}'` : cleanEmail ? `email '${cleanEmail}'` : `id '${targetId}'`;
            return res.status(404).json({ error: `User with ${searchedFor} not found` });
        }

        if (req.user && userToFind._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: "Admin cannot delete their own active account." });
        }

        const user = await User.findByIdAndDelete(userToFind._id);

        // Remove access permissions for this user
        await Access.deleteOne({ username: user.username });

        // Log DELETE_USER activity
        await logUserActivity({
            req,
            action: "DELETE_USER",
            details: `Admin '${req.user?.username}' deleted user '${user.username}' (${user.email})`
        });

        return res.status(200).json({
            message: "User removed successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const delete_user = remove_user;

export const get_Access = async (req, res) => {
    try {
        const { username } = req.query;
        let query = {};
        if (username) {
            query.username = { $regex: new RegExp(`^${username.trim()}$`, "i") };
        }
        const accessList = await Access.find(query).sort({ role: 1, username: 1 });

        // Record read-only activity
        await logUserActivity({
            req,
            action: "VIEW_ACCESS_LIST",
            details: `Viewed role-based access list (${accessList.length} records)`
        });

        return res.status(200).json({ message: "access list fetched successfully", access: accessList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

export const get_ActivityLogs = async (req, res) => {
    try {
        const { sessionId, username, action } = req.query;
        let query = {};
        if (sessionId) {
            query.sessionId = sessionId;
        }
        if (username) {
            query.username = { $regex: new RegExp(`^${username.trim()}$`, "i") };
        }
        if (action) {
            query.action = { $regex: new RegExp(`^${action.trim()}$`, "i") };
        }
        const logs = await ActivityLog.find(query).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "activity logs fetched successfully",
            count: logs.length,
            logs
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};