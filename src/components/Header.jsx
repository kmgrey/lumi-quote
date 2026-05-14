import { Link } from "react-router-dom";

export const Header = () => {
	return (
		<header>
			<h1>LumiQuote v1</h1>
			<nav>
				<ul>
					<li>
						<Link to="/products">Products</Link>
					</li>
					<li>
						<Link to="/customers">Customer</Link>
					</li>
					<li>
						<Link to="/quotes">Quotes</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
};
