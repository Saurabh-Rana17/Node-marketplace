import { ObjectId, Schema, model, Model } from "mongoose";
import { IProduct } from "./product";

export interface IUser {
  password: string;
  email: string;
  cart: {
    items: {
      productId: ObjectId;
      quantity: number;
    }[];
  };
  resetToken?: string | null;
  resetTokenExpiration?: Date | null;
}

interface IUserMethods {
  addToCart(): any;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

userSchema.method("addToCart", async function (product: IProduct) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id!.toString();
  });
  let newQuantity = 1;
  const updatedCartItem = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItem[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItem.push({ productId: product._id!, quantity: newQuantity });
  }
  const updatedCart = {
    items: updatedCartItem,
  };
  this.cart = updatedCart;
  await this.save();
});

const User = model<IUser, UserModel>("User", userSchema);

export default User;
