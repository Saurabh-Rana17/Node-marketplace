"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminProducts = exports.postDeleteProduct = exports.postEditProduct = exports.getEditProduct = exports.postAddProduct = exports.getAddproduct = void 0;
const product_1 = __importDefault(require("../models/product"));
const express_validator_1 = require("express-validator");
const filehelper_1 = require("../utils/filehelper");
const getAddproduct = (req, res) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: "",
        validationErrors: [],
    });
};
exports.getAddproduct = getAddproduct;
const postAddProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, price, description } = req.body;
    const image = req.file;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!image) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            errorMessage: "Attach file is not a image",
            product: { title, price, description },
            validationErrors: [],
        });
    }
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: { title, price, description },
            validationErrors: errors.array(),
        });
    }
    const imageUrl = image.path;
    const product = new product_1.default({
        title: title,
        description,
        imageUrl,
        price,
        userid: req.user,
    });
    try {
        yield product.save();
        return res.redirect("/");
    }
    catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
});
exports.postAddProduct = postAddProduct;
const getEditProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    try {
        const product = yield product_1.default.findById(id);
        res.render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: "",
            validationErrors: [],
        });
    }
    catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
});
exports.getEditProduct = getEditProduct;
const postEditProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, title, price, description } = req.body;
    const image = req.file;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/edit-product",
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: { title, price, description, _id: productId },
            validationErrors: errors.array(),
        });
    }
    const product = yield product_1.default.findById(productId);
    if (product) {
        if (product.userid.toString() !== req.user._id.toString()) {
            return res.redirect("/");
        }
        product.title = title;
        if (image) {
            (0, filehelper_1.deleteFile)(product.imageUrl);
            product.imageUrl = image.path;
        }
        product.price = price;
        product.description = description;
        product.save();
    }
    res.redirect("/admin/products");
});
exports.postEditProduct = postEditProduct;
const postDeleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    product_1.default.findById(id)
        .then((product) => {
        if (!product) {
            return next(new Error("product not found"));
        }
        (0, filehelper_1.deleteFile)(product.imageUrl);
        return product_1.default.deleteOne({ _id: id, userid: req.user._id });
    })
        .then(() => {
        console.log("deleted product");
        res.redirect("/admin/products");
    })
        .catch((err) => next(err));
});
exports.postDeleteProduct = postDeleteProduct;
const getAdminProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_1.default.find({ userid: req.user._id });
    res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
    });
});
exports.getAdminProducts = getAdminProducts;
