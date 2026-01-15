import express from "express";
import {
  addUnit,
  editUnit,
  deleteUnit,
  getUnits,
} from "../controllers/unitController.js";

const unitRoutes = express.Router();

unitRoutes.post("/add", addUnit);
unitRoutes.put("/edit", editUnit);
unitRoutes.delete("/delete", deleteUnit);
unitRoutes.get("/", getUnits);

export default unitRoutes;
