import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Products } from "./components/Products";
import { Customers } from "./components/Customers";
import { Quotes } from "./components/Quotes";
import { QuoteBuilder } from "./components/QuoteBuilder";

function App() {
	return (
		<BrowserRouter>
			<Header />
			<Routes>
				<Route path="/products" element={<Products />} />
				<Route path="/customers" element={<Customers />} />
				<Route path="/quotes" element={<Quotes />} />
				<Route path="/quotes/:id" element={<QuoteBuilder />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
