import express from "express";

import {
  saveLocation,
  getLocation,
  verifyLocation,
} from "../controllers/locationController.js";

const locationRoutes = express.Router();

locationRoutes.post("/save", saveLocation);

locationRoutes.get("/:businessCode", getLocation);

locationRoutes.post("/verify", verifyLocation);

export default locationRoutes;