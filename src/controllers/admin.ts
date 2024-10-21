import { NextFunction, Request, Response } from "express";
import Product, { IProduct } from "../models/product";
import mongoose, { HydratedDocument } from "mongoose";
import { validationResult } from "express-validator";
import { deleteFile } from "../utils/filehelper";
interface Body {
  title: string;
  imageUrl: string;
  price: number;
  description: string;
}

export const getAddproduct = (req: Request, res: Response) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: "",
    validationErrors: [],
  });
};

export const postAddProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, price, description }: Body = req.body;
  const image = req.file;
  const errors = validationResult(req);

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
  const product: HydratedDocument<IProduct> = new Product({
    title: title,
    description,
    imageUrl,
    price,
    userid: req.user,
  });
  try {
    await product.save();
    return res.redirect("/");
  } catch (err: any) {
    const error: any = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

export const getEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  try {
    const product = await Product.findById(id);
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: "",
      validationErrors: [],
    });
  } catch (err: any) {
    const error: any = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

export const postEditProduct = async (req: Request, res: Response) => {
  const { productId, title, price, description } = req.body;
  const image = req.file;

  const errors = validationResult(req);
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

  const product = await Product.findById(productId);

  if (product) {
    if (product.userid.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = title;
    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.price = price;
    product.description = description;
    product.save();
  }

  res.redirect("/admin/products");
};

export const postDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  Product.findById(id)
    .then((product): any => {
      if (!product) {
        return next(new Error("product not found"));
      }
      deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: id, userid: req.user._id });
    })
    .then(() => {
      console.log("deleted product");
      res.redirect("/admin/products");
    })
    .catch((err) => next(err));
};

export const getAdminProducts = async (req: Request, res: Response) => {
  const products = await Product.find({ userid: req.user._id });
  res.render("admin/products", {
    prods: products,
    pageTitle: "Your Products",
    path: "/admin/products",
  });
};
