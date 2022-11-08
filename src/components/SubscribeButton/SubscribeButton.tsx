import styles from "./SubscribeButton.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

const SubscribeButton = ({ priceId}: SubscribeButtonProps) => {
	return (
		<button 
			type="button"
			className={styles.subscribeButton}
		>
      Subscribe Now
		</button>
	);
};

export default SubscribeButton;