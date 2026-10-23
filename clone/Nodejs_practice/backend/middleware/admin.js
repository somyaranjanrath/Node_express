const admin = (req, res, next) => {
    if (!req.user || req.user.role?.toLowerCase() !== "admin") {
       return res.status(403).json({ error: "Admin only..." });
    }
    next();
};

export default admin