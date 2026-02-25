import express from "express";
import { submitFeedback, getFeedbackByBusiness, updateFeedbackSettings } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", submitFeedback);
router.get("/feedback/:businessCode", getFeedbackByBusiness);
router.patch("/feedback-settings", updateFeedbackSettings);

export default router;
