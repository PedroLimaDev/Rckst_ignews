import { isNil } from "ramda";
import { GetStaticProps } from "next";
import Head from "next/head";
import SubscribeButton from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
	return (
		<>
			<Head>
				<title>Início | ig.news</title>
			</Head>

			<main className={styles.contentContainer}>
				<section className={styles.hero}>
					<span>👏 Hey, welcome</span>
					<h1>News about the <span>React</span> world.</h1>
					<p>
            Get access to all the publications <br />
						<span>for {product.amount}/month</span>
					</p>
					<SubscribeButton priceId={product.priceId}/>
				</section>


				<img src="/images/avatar.svg" alt="Girl Coding" />

			</main>
		</>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const price = await stripe.prices.retrieve("price_1M20f4FUGLEhO7sBPev5Kw9q", {
		expand: ["product"]
	});

	const product = {
		priceId: price.id,
		amount: !isNil(price?.unit_amount) 
			? new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(price?.unit_amount / 100)
			: 0,
	};

	return {
		props: {
			product,
		},
		revalidate: 60 * 60 * 24,
	};
};