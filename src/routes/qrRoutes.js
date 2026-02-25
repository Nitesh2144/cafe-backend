import express from "express";
import { generateUnitQR, generateAllQR } from "../controllers/qrController.js";

const qrRoutes = express.Router();

// Generate QR for a unit
qrRoutes.get("/unit", generateUnitQR);
qrRoutes.get("/all", generateAllQR); 
export default qrRoutes;
