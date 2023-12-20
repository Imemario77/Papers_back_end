import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  restockProduct,
} from "../controllers/productController.js";

const route = Router();

route.post("/create", createProduct);
route.get("/get", getAllProduct);
route.delete("/delete/:productId", deleteProduct);
route.post("/restock", restockProduct);

export default route;
