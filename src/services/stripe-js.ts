import { loadStripe } from "@stripe/stripe-js";

export const getStripeJS = async () => {
	const stripeJS = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? "");
	return stripeJS;
};