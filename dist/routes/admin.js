"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controllers/admin");
const is_auth_1 = __importDefault(require("../middlewares/is-auth"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.get("/add-product", is_auth_1.default, admin_1.getAddproduct);
router.post("/add-product", is_auth_1.default, [
    (0, express_validator_1.body)("title")
        .notEmpty()
        .withMessage("Please fill all fields")
        .isString()
        .withMessage("Please enter valid string value")
        .isLength({ min: 3 })
        .trim(),
    (0, express_validator_1.body)("price").notEmpty().withMessage("Please fill all fields").isFloat(),
    (0, express_validator_1.body)("description")
        .notEmpty()
        .withMessage("Please fill all fields")
        .isLength({ min: 8, max: 400 })
        .trim(),
], admin_1.postAddProduct);
router.get("/edit-product/:id", is_auth_1.default, admin_1.getEditProduct);
router.post("/edit-product", is_auth_1.default, [
    (0, express_validator_1.body)("title")
        .notEmpty()
        .withMessage("Please fill all fields")
        .isString()
        .withMessage("Please enter valid value")
        .isLength({ min: 3 })
        .trim(),
    (0, express_validator_1.body)("price").notEmpty().withMessage("Please fill all fields").isFloat(),
    (0, express_validator_1.body)("description")
        .notEmpty()
        .withMessage("Please fill all fields")
        .isLength({ min: 8, max: 400 })
        .trim(),
], admin_1.postEditProduct);
router.post("/delete-product/:id", is_auth_1.default, admin_1.postDeleteProduct);
router.get("/products", is_auth_1.default, admin_1.getAdminProducts);
exports.default = router;
