import { Link } from "react-router-dom";

export const Header = () => {
	return (
		<header>
			<h1>LumiQuote</h1>
			<nav>
				<Link to="/products" className="nav-link">
					Products
				</Link>
				<Link to="/customers" className="nav-link">
					Customers
				</Link>
				<Link to="/quotes" className="nav-link">
					Quotes
				</Link>
			</nav>
			
		</header>
	);
};
