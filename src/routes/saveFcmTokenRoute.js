import express from "express";
import { saveFcmToken, removeFcmToken } from "../controllers/saveFcmToken.js";

const saveFcmRoutes = express.Router();

saveFcmRoutes.post("/save-fcm-token", saveFcmToken);
saveFcmRoutes.post("/remove-fcm-token", removeFcmToken);
export default saveFcmRoutes;