import express from "express";
import { saveFcmToken } from "../controllers/saveFcmToken.js";

const saveFcmRoutes = express.Router();

saveFcmRoutes.post("/save-fcm-token", saveFcmToken);

export default saveFcmRoutes;