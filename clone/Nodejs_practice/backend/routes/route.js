import express from 'express'
import {create, fetch, remove, update } from '../controller/controller.js'
import auth, { optionalAuth } from '../middleware/auth.js'
import admin from '../middleware/admin.js'

const router = express.Router()

router.get("/Fetch", optionalAuth, fetch)
router.get("/fetch", optionalAuth, fetch)
router.post("/send", auth, admin, create)
router.post("/create", auth, admin, create)
router.put("/update/:id", auth, admin, update)
router.delete("/remove/:id",auth,admin,remove)


export default router