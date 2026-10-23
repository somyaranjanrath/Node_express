import express from 'express'
import { get_Activities, get_User, login, logout, signup } from '../controller/user.js'

const router = express.Router()

router.post("/user/signup", signup);
router.post("/user/login", login);
router.post("/user/logout", logout);
router.get("/user/get_User", get_User);
router.get("/user/activities", get_Activities);

export default router;