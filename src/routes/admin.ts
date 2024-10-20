import express from "express";
import {
  getAddproduct,
  getAdminProducts,
  getEditProduct,
  postAddProduct,
  postDeleteProduct,
  postEditProduct,
} from "../controllers/admin";
import isAuth from "../middlewares/is-auth";
import { body } from "express-validator";

const router = express.Router();

router.get("/add-product", isAuth, getAddproduct);
router.post(
  "/add-product",
  isAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Please fill all fields")
      .isString()
      .withMessage("Please enter valid string value")
      .isLength({ min: 3 })
      .trim(),
    body("price").notEmpty().withMessage("Please fill all fields").isFloat(),
    body("description")
      .notEmpty()
      .withMessage("Please fill all fields")
      .isLength({ min: 8, max: 400 })
      .trim(),
  ],
  postAddProduct
);
router.get("/edit-product/:id", isAuth, getEditProduct);
router.post(
  "/edit-product",
  isAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Please fill all fields")
      .isString()
      .withMessage("Please enter valid value")
      .isLength({ min: 3 })
      .trim(),
    body("price").notEmpty().withMessage("Please fill all fields").isFloat(),
    body("description")
      .notEmpty()
      .withMessage("Please fill all fields")
      .isLength({ min: 8, max: 400 })
      .trim(),
  ],
  postEditProduct
);
router.post("/delete-product/:id", isAuth, postDeleteProduct);
router.get("/products", isAuth, getAdminProducts);

export default router;
