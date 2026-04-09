import { Request, Response, NextFunction } from "express";

export function validateApiSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-api-secret"];
  if (!secret || secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
