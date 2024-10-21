import { NextFunction, Request, Response } from "express";
import Product, { IProduct } from "../models/product";
import Order, { IOrder } from "../models/order";
import { HydratedDocument } from "mongoose";
import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";

const ITEM_PER_PAGE = 6;

export const getProducts = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const totalItems = await Product.find().countDocuments();
  const products = await Product.find()
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
};

export const getIndex = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const totalItems = await Product.find().countDocuments();
  const products = await Product.find()
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
};

export const getCart = async (req: Request, res: Response) => {
  const cart = await req.user.populate("cart.items.productId");
  const cartProduct: any[] = [];
  cart.cart.items.forEach((i: any) => {
    if (i.productId) {
      cartProduct.push(i);
    }
  });
  res.render("shop/cart", {
    pageTitle: "Cart",
    path: "/cart",
    products: cartProduct,
  });
};

export const postCart = async (req: Request, res: Response) => {
  const id: string = req.body.productId;
  const product = await Product.findById(id);
  const user = req.user;
  const ans = await user.addToCart(product);
  res.redirect("/cart");
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ "user.userId": req.session.user._id });
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
};

export const getProduct = async (req: Request, res: Response) => {
  const prodId = req.params.prodId;
  const product = await Product.findById(prodId);

  res.render("shop/product-detail", {
    pageTitle: product?.title,
    path: "/products",
    product: product,
  });
};

export const postCartDeleteProduct = async (req: Request, res: Response) => {
  const id: string = req.body.productId;
  const updatedCartItem = req.user.cart.items.filter(
    (i: any) => i.productId.toString() !== id.toString()
  );
  req.user.cart.items = updatedCartItem;
  await req.user.save();

  res.redirect("/cart");
};

export const postOrder = async (req: Request, res: Response) => {
  const order: HydratedDocument<IOrder> = new Order();
  const ans = await req.user.populate("cart.items.productId");
  const userProducts: { productId: IProduct; quantity: number }[] =
    ans.cart.items;
  let orderProduct: { product: IProduct; quantity: number }[] = [];
  userProducts.forEach((p) => {
    orderProduct.push({
      product: {
        ...p.productId?.toJSON(),
      },
      quantity: p.quantity,
    });
  });
  order.products = orderProduct;
  order.user.userId = req.user._id;
  order.user.email = req.user.email;
  await order.save();
  req.user.cart.items = [];
  await req.user.save();

  res.redirect("/orders");
};

export const getInvoices = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
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

      const pdfDoc = new PDFDocument();
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
          .text(
            `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
          );
      });
      pdfDoc.text("--------------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end();
    })
    .catch((err) => {
      next(err); // Handle any errors that occur during the Order.findById call
    });
};
