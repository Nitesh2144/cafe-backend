import express from "express";
import { generateUnitQR } from "../controllers/qrController.js";

const qrRoutes = express.Router();

// Generate QR for a unit
qrRoutes.get("/unit", generateUnitQR);

export default qrRoutes;
