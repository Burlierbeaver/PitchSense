import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const userRoutes = Router();

userRoutes.get("/:id", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { subscriptions: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

userRoutes.post("/sync", async (req: Request, res: Response) => {
  const { id, email, name } = req.body;
  if (!id || !email) return res.status(400).json({ error: "id and email required" });

  const user = await prisma.user.upsert({
    where: { id },
    update: { email, name },
    create: { id, email, name },
  });
  return res.json(user);
});
