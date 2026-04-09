import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";

export const webhookRoutes = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

webhookRoutes.post(
  "/stripe",
  // Raw body needed for signature verification
  Router().use(require("express").raw({ type: "application/json" })),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error("[stripe webhook] signature verification failed", err);
      return res.status(400).send("Webhook signature verification failed");
    }

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;

          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const userId = customer.metadata?.userId;
          if (!userId) break;

          const plan = sub.items.data[0]?.price?.lookup_key?.toUpperCase() ?? "PRO";

          await prisma.subscription.upsert({
            where: { stripeSubId: sub.id },
            update: {
              status: sub.status,
              plan: plan as any,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            create: {
              userId,
              stripeCustomerId: customerId,
              stripeSubId: sub.id,
              plan: plan as any,
              status: sub.status,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { plan: plan as any },
          });
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          await prisma.subscription.updateMany({
            where: { stripeSubId: sub.id },
            data: { status: "canceled", plan: "FREE" },
          });
          break;
        }
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("[stripe webhook] handler error", err);
      return res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);
