import { Request, Response } from "express";
export const notFound = (req: Request, res: Response) => {
  res.status(404).render("404", {
    pageTitle: "404,Page Not Found",
    path: "/404",
    isAuthenticated: req.session.isLoggedIn,
  });
};

export const get500 = (req: Request, res: Response) => {
  res.status(500).render("500", {
    pageTitle: "500,Page Not Found",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
