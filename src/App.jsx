import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Products } from "./components/Products";
import { Customers } from "./components/Customers";
import { Quotes } from "./components/Quotes";
import { QuoteBuilder } from "./components/QuoteBuilder";
import { QuoteTemplate } from "./components/QuoteTemplate";
// STYLES
import "./index.css";
import "./styles/Header.css";
import "./styles/Products.css";
import "./styles/Customers.css";
import "./styles/Quotes.css";
import "./styles/QuoteBuilder.css";
import "./styles/QuoteTemplate.css";

function App() {
	// prettier-ignore
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to ="/quotes" replace />} />
				<Route path="/products" element={<><Header /> <Products /></>} />
				<Route path="/customers" element={<><Header /> <Customers /></>} />
				<Route path="/quotes" element={<><Header /> <Quotes /></>} />
				<Route path="/quotes/:id" element={<><Header /> <QuoteBuilder /></>} />
				<Route path="/quote-template/:id" element={<QuoteTemplate />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
