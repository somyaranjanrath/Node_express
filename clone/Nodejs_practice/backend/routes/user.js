import express from 'express';
import { delete_user, get_Access, get_Activities, get_ActivityLogs, get_User, login, logout, remove_user, signup } from '../controller/user.js';
import auth from '../middleware/auth.js';
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

router.get("/user/get_User", get_User);
router.get("/user/activities", get_Activities);
router.get("/user/session_logs", get_Activities);
router.get("/session_logs", get_Activities);

router.get("/user/access", get_Access);
router.get("/access", get_Access);
router.get("/user/roles_based_access", get_Access);
router.get("/roles_based_access", get_Access);

router.get("/user/activity_logs", get_ActivityLogs);
router.get("/activity_logs", get_ActivityLogs);
router.get("/user/activity_logs/:sessionId", (req, res, next) => {
    req.query.sessionId = req.params.sessionId;
    next();
}, get_ActivityLogs);

export default router;