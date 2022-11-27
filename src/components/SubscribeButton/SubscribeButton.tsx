import { useSession, signIn } from "next-auth/react";

import { api } from "../../services/api";
import { getStripeJS } from "../../services/stripe-js";

import styles from "./SubscribeButton.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

const SubscribeButton = ({ priceId }: SubscribeButtonProps) => {
	const { data: session } = useSession();

	const handleSubscribe = async () => {
		if (!session) {
			signIn("github");
			return;
		}

		try {
			const response = await api.post("/subscribe");

			const { sessionId } = response.data;

			const stripe = await getStripeJS();

			await stripe?.redirectToCheckout({ sessionId } );
		} catch (err: any) {
			alert(err?.message);
		}
	};

	return (
		<button 
			type="button"
			className={styles.subscribeButton}
			onClick={handleSubscribe}
		>
      Subscribe Now
		</button>
	);
};

export default SubscribeButton;