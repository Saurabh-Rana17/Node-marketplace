"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getInvoices = exports.postOrder = exports.postCartDeleteProduct = exports.getProduct = exports.getOrders = exports.postCart = exports.getCart = exports.getIndex = exports.getProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const order_1 = __importDefault(require("../models/order"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const ITEM_PER_PAGE = 6;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const totalItems = yield product_1.default.find().countDocuments();
    const products = yield product_1.default.find()
        .skip((Number(page) - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    res.render("shop/index", {
        prods: products,
        pageTitle: "Home",
        path: "/products",
        csrfToken: req.csrfToken(),
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
    });
});
exports.getProducts = getProducts;
const getIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const totalItems = yield product_1.default.find().countDocuments();
    const products = yield product_1.default.find()
        .skip((Number(page) - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    res.render("shop/index", {
        prods: products,
        pageTitle: "Home",
        path: "/",
        csrfToken: req.csrfToken(),
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
    });
});
exports.getIndex = getIndex;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield req.user.populate("cart.items.productId");
    const cartProduct = [];
    cart.cart.items.forEach((i) => {
        if (i.productId) {
            cartProduct.push(i);
        }
    });
    res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products: cartProduct,
    });
});
exports.getCart = getCart;
const postCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.productId;
    const product = yield product_1.default.findById(id);
    const user = req.user;
    const ans = yield user.addToCart(product);
    res.redirect("/cart");
});
exports.postCart = postCart;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_1.default.find({ "user.userId": req.session.user._id });
    const correctOrders = orders.map((el) => {
        const newEl = el;
        const correctProductList = el.products.filter((p) => p.product);
        newEl.products = correctProductList;
        return newEl;
    });
    res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: correctOrders,
    });
});
exports.getOrders = getOrders;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prodId = req.params.prodId;
    const product = yield product_1.default.findById(prodId);
    res.render("shop/product-detail", {
        pageTitle: product === null || product === void 0 ? void 0 : product.title,
        path: "/products",
        product: product,
    });
});
exports.getProduct = getProduct;
const postCartDeleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.productId;
    const updatedCartItem = req.user.cart.items.filter((i) => i.productId.toString() !== id.toString());
    req.user.cart.items = updatedCartItem;
    yield req.user.save();
    res.redirect("/cart");
});
exports.postCartDeleteProduct = postCartDeleteProduct;
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = new order_1.default();
    const ans = yield req.user.populate("cart.items.productId");
    const userProducts = ans.cart.items;
    let orderProduct = [];
    userProducts.forEach((p) => {
        var _a;
        orderProduct.push({
            product: Object.assign({}, (_a = p.productId) === null || _a === void 0 ? void 0 : _a.toJSON()),
            quantity: p.quantity,
        });
    });
    order.products = orderProduct;
    order.user.userId = req.user._id;
    order.user.email = req.user.email;
    yield order.save();
    req.user.cart.items = [];
    yield req.user.save();
    res.redirect("/orders");
});
exports.postOrder = postOrder;
const getInvoices = (req, res, next) => {
    const orderId = req.params.orderId;
    order_1.default.findById(orderId)
        .then((order) => {
        if (!order) {
            return next(new Error("No order found"));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error("Unauthorized"));
        }
        const invoiceName = "invoice-" + orderId + ".pdf";
        const invoicePath = path.join("data", "invoices", invoiceName);
        // Ensure the directory exists
        const dir = path.dirname(invoicePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
        }
        const pdfDoc = new pdfkit_1.default();
        res.setHeader("Content-Type", "application/pdf");
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text("Invoice", { underline: true });
        pdfDoc.text("-------------------------------------");
        let totalPrice = 0;
        order.products.forEach((prod) => {
            totalPrice += prod.quantity * Number(prod.product.price);
            pdfDoc
                .fontSize(14)
                .text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
        });
        pdfDoc.text("--------------");
        pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
        pdfDoc.end();
    })
        .catch((err) => {
        next(err); // Handle any errors that occur during the Order.findById call
    });
};
exports.getInvoices = getInvoices;
