import express from "express";
import {
  placeOrder,
  getOrdersByBusiness,
  getCustomerCount,
  updateOrderStatus,
  markOrderPaid,
} from "../controllers/orderController.js";
import planCheckMiddleware from "../middleware/planCheck.js";

const orderRoutes = express.Router();
orderRoutes.post("/place", placeOrder);
orderRoutes.get("/:businessCode",  planCheckMiddleware, getOrdersByBusiness);
orderRoutes.get("/customers/:businessCode", getCustomerCount);
orderRoutes.put("/status/:orderId", updateOrderStatus);
orderRoutes.put("/pay/:orderId", markOrderPaid);

export default orderRoutes;
