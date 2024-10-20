import { NextFunction, Request, Response } from "express";

export default function isAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.isLoggedIn) {
    return res.status(401).redirect("/");
  }
  next();
}
