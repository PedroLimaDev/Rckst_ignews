/* eslint-disable no-case-declarations */
import { NextApiRequest, NextApiResponse } from "next";
import { isNil } from "ramda";
import { Readable } from "stream";
import Stripe from "stripe";

import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
	const chunks = [];

	for await (const chunk of readable) {
		chunks.push(
			typeof chunk === "string" ? Buffer.from(chunk) : chunk
		);
	}

	return Buffer.concat(chunks);
}

export const config = {
	api: {
		bodyParser: false
	}
};

const relevantEvents = new Set([
	"checkout.session.completed",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		const buf = await buffer(req);
		const secret = req.headers["stripe-signature"];

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(buf, secret || "", process.env.STRIPE_WEBHOOK_SECRET || "");
		} catch (err: any) {
			return res.status(400).end(`Webhook error: ${err.message}`);
		}

		const { type } = event;

		if (relevantEvents.has(type)) {
			try {
				switch (type) {
				// case "customer.subscription.created":
				case "customer.subscription.updated":
				case "customer.subscription.deleted":
					const subscriptionSession = event.data.object as Stripe.Subscription;

					await saveSubscription(
						subscriptionSession.id,
						subscriptionSession.customer.toString(),
						false,
						// type === "customer.subscription.created",
					);

					break;
            
				case "checkout.session.completed":
					const checkoutSession = event.data.object as Stripe.Checkout.Session;
          
					const subscriptionData = checkoutSession.subscription?.toString();
					const customer = checkoutSession.customer?.toString();
          
					if (isNil(subscriptionData) || isNil(customer)) {
						throw new Error("Unhandled Subscription or User");
					}

					await saveSubscription(
						subscriptionData,
						customer,
						true
					);

					break;

				default:
					throw new Error("Unhandled event");
				}
			} catch (err: any) {
				return res.json({ error: "Webhook handler failed" });
			}
		}

		res.status(200).json({received: true});
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method not allowed");
	}
};