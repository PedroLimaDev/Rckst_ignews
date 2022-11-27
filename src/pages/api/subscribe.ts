import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { query as q } from "faunadb";
import { isNil } from "ramda";

import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

import { authOptions } from "./auth/[...nextauth]";

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		const session = await unstable_getServerSession(
			req,
			res,
			authOptions
		);

		const sessionUserEmail = session?.user?.email;

		if (isNil(sessionUserEmail)) return res.status(400).json(null);

		const user = await fauna.query<User>(
			q.Get(
				q.Match(
					q.Index("user_by_email"),
					q.Casefold(sessionUserEmail)
				)
			)
		);

		let customerId = user.data.stripe_customer_id;

		if (!customerId) {
			const stripeCustomer = await stripe.customers.create({
				email: sessionUserEmail,
			});
  
			await fauna.query(
				q.Update(
					q.Ref(q.Collection("users"), user.ref.id),
					{
						data: {
							stripe_customer_id: stripeCustomer.id,
						}
					}
				)
			);
      
			customerId = stripeCustomer.id;
		}

		const stripeCheckoutSession = await stripe.checkout.sessions.create({
			customer: customerId,
			payment_method_types: ["card"],
			billing_address_collection: "required",
			line_items: [
				{ price: "price_1M20f4FUGLEhO7sBPev5Kw9q", quantity: 1 }
			],
			mode: "subscription",
			allow_promotion_codes: true,
			success_url: process.env.STRIPE_SUCCESS_URL ?? "",
			cancel_url: process.env.STRIPE_CANCEL_URL ?? "",
		});

		return res.status(200).json({ sessionId: stripeCheckoutSession.id });
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method not allowed");
	}
};