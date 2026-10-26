import express from 'express';
import { delete_user, get_Access, get_Activities, get_ActivityLogs, get_User, login, logout, remove_user, signup } from '../controller/user.js';
import auth, { optionalAuth } from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router()

router.post("/user/signup", signup);
router.post("/user/login", login);
router.post("/user/logout", logout);

// delete_user / remove_user - only for logged-in admin
router.post("/user/remove_user", auth, admin, remove_user);
router.post("/remove_user", auth, admin, remove_user);
router.delete("/user/remove_user", auth, admin, remove_user);
router.delete("/remove_user", auth, admin, remove_user);
router.delete("/user/remove_user/:id", auth, admin, remove_user);
router.delete("/remove_user/:id", auth, admin, remove_user);

router.post("/user/delete_user", auth, admin, delete_user);
router.post("/delete_user", auth, admin, delete_user);
router.delete("/user/delete_user", auth, admin, delete_user);
router.delete("/delete_user", auth, admin, delete_user);
router.delete("/user/delete_user/:id", auth, admin, delete_user);
router.delete("/delete_user/:id", auth, admin, delete_user);

router.get("/user/get_User", optionalAuth, get_User);
router.get("/get_User", optionalAuth, get_User);
router.get("/user/activities", optionalAuth, get_Activities);
router.get("/user/session_logs", optionalAuth, get_Activities);
router.get("/session_logs", optionalAuth, get_Activities);

router.get("/user/access", optionalAuth, get_Access);
router.get("/access", optionalAuth, get_Access);
router.get("/user/roles_based_access", optionalAuth, get_Access);
router.get("/roles_based_access", optionalAuth, get_Access);

router.get("/user/activity_logs", optionalAuth, get_ActivityLogs);
router.get("/activity_logs", optionalAuth, get_ActivityLogs);
router.get("/user/activity_logs/:sessionId", optionalAuth, (req, res, next) => {
    req.query.sessionId = req.params.sessionId;
    next();
}, get_ActivityLogs);

export default router;