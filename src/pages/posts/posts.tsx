
import Head from "next/head";
import styles from "./styles.module.scss";

const Posts = () => {
	console.log("teste");

	return (
		<>
			<Head>
				<title>Posts | Ignews</title>
			</Head>

			<main className={styles.container}>
				<div className={styles.posts}>
					<a href="#">
						<time>12 de março de 2021</time>

						<strong>teste</strong>

						<p>teste2</p>
					</a>
					<a href="#">
						<time>12 de março de 2021</time>

						<strong>teste</strong>

						<p>teste2</p>
					</a>
					<a href="#">
						<time>12 de março de 2021</time>

						<strong>teste</strong>

						<p>teste2</p>
					</a>
				</div>
			</main>
		</>
	);
};

export default Posts;