import SignInButton from "../SignInButton";
import styles from "./Header.module.scss";

const Header = () => {
	console.log("teste");

	return (
		<header className={styles.headerContainer}>
			<div className={styles.headerContent}>
				<img src="/images/logo.svg" alt="ig.news" />

				<nav>
					<a className={styles.active}>Home</a>
					<a>Posts</a>
				</nav>

				<SignInButton />
			</div>
		</header>
	);
};

export default Header;