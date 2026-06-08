import express from "express";
import {
  placeOrder,
  getOrdersByBusiness,
  getCustomerCount,
  updateOrderStatus,
  markOrderPaid,
  applyDiscount,
  generateBillNumber
} from "../controllers/orderController.js";
import planCheckMiddleware from "../middleware/planCheck.js";

const orderRoutes = express.Router();
orderRoutes.post("/place", placeOrder);
orderRoutes.get("/customers/:businessCode", getCustomerCount);
orderRoutes.get("/:businessCode",  planCheckMiddleware, getOrdersByBusiness);
orderRoutes.put("/status/:orderId", updateOrderStatus);
orderRoutes.put("/pay/:orderId", markOrderPaid);
orderRoutes.put(
  "/discount/:orderId",
  applyDiscount
);
orderRoutes.put(
  "/generate-bill/:orderId",
  generateBillNumber
);
export default orderRoutes;
