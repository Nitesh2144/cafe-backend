import express from "express";
import { 
  registerBusinessWithUser,
   loginBusinessUser,
    createStaff,
     listStaff,
    resetStaffPassword,
  deleteStaff,
  } from "../controllers/businessController.js";
import { protect, onlyAdmin } from "../middleware/auth.js";

const entryRouter = express.Router();

entryRouter.post("/register", registerBusinessWithUser);
entryRouter.post("/login", loginBusinessUser); 
entryRouter.post(
  "/staff/create",
  protect,
  onlyAdmin,
  createStaff
);

entryRouter.get("/staff/list", protect, listStaff);

entryRouter.put(
  "/staff/reset-password/:staffId",
  protect,
  onlyAdmin,
  resetStaffPassword
);

entryRouter.delete(
  "/staff/:staffId",
  protect,
  onlyAdmin,
  deleteStaff
);




export default entryRouter;
