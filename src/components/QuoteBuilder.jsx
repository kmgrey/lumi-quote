import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const QuoteBuilder = () => {
	const [quote, setQuote] = useState(null);
	const [items, setItems] = useState([]);
	const [products, setProducts] = useState([]);
	const { id } = useParams();

	const fetchProducts = async () => {
		const data = await window.api.getProductsByRange(1); // TODO: get ranges, don't hardcode
		const flatProducts = data.flatMap((category) => category.products);
		setProducts(flatProducts);
		//console.log("products: ", flatProducts);
	};

	const fetchQuote = async () => {
		const data = await window.api.getQuoteById(id);
		setQuote(data);
		//console.log("quote: ", data);
	};

	const fetchItems = async () => {
		const data = await window.api.getQuoteItems(id);
		setItems(data);
		//console.log("items: ", data);
	};

	useEffect(() => {
		fetchProducts();
		fetchQuote(id);
		fetchItems(id);
	}, [id]);

	const total = items.reduce((sum, item) => {
		const lineTotal = item.discount_eligible
			? item.quantity * item.unit_price * (1 - quote.discount_percent / 100)
			: item.quantity * item.unit_price;
		return sum + lineTotal;
	}, 0);

	const handleDiscountChange = async (value) => {
		setQuote({ ...quote, discount_percent: value });
		await window.api.updateQuoteDiscount(id, value);
	};

	const handleAddProduct = async (productId) => {
		if (!productId) return;
		const product = products.find((p) => p.id === Number(productId));
		await window.api.addQuoteItem(id, product.id, 1, product.price, 1);
		fetchItems();
	};

	const handleQuantityChange = async (itemId, quantity, discount_eligible) => {
		if (quantity < 1) return;
		await window.api.updateQuoteItem(itemId, quantity, discount_eligible);
		fetchItems();
	};

	const handleRemoveItem = async (itemId) => {
		await window.api.removeQuoteItem(itemId);
		fetchItems();
	};

	return (
		<div>
			<h1>Quote Builder</h1>
			{/* QUOTE INFO */}
			<table>
				<thead>
					<tr>
						<th>Quote Number</th>
						<th>Customer</th>
						<th>Status</th>
						<th>Discount %</th>
					</tr>
				</thead>
				{quote && (
					<tbody>
						<tr>
							<td>{quote.quote_number}</td>
							<td>{quote.customer_name}</td>
							<td>{quote.status}</td>
							<td>
								<input type="number" value={quote.discount_percent} onChange={(e) => handleDiscountChange(e.target.value)} />
							</td>
						</tr>
					</tbody>
				)}
			</table>
			{/* SEARCH PRODUCTS */}
			<label htmlFor="products">Select product to add to quote:</label>
			<select name="products" onChange={(e) => handleAddProduct(e.target.value)}>
				<option value="">select product</option>
				{products.map((product) => (
					<option key={product.id} value={product.id}>
						{product.part_code} — {product.name}
					</option>
				))}
			</select>
			{/* PRODUCTS IN QUOTE */}
			<table>
				<thead>
					<tr>
						<th>Part Code</th>
						<th>Description</th>
						<th>Quantity</th>
						<th>Unit Price</th>
						<th>Discount Eligible</th>
						<th>Line Total</th>
						<th></th>
					</tr>
				</thead>
				{items && (
					<tbody>
						{items.map((item) => (
							<tr key={item.id}>
								<td>{item.part_code}</td>
								<td>{item.name}</td>
								<td>
									<input
										type="number"
										value={item.quantity}
										onChange={(e) => handleQuantityChange(item.id, Number(e.target.value), item.discount_eligible)}
									/>
								</td>
								<td>{item.unit_price}</td>
								<td>{item.discount_eligible ? "Yes" : "No"}</td>
								<td>
									£
									{(item.discount_eligible
										? item.quantity * item.unit_price * (1 - quote.discount_percent / 100)
										: item.quantity * item.unit_price
									).toFixed(2)}
								</td>
								<td>
									<button onClick={() => handleRemoveItem(item.id)}>Remove</button>
								</td>
							</tr>
						))}
					</tbody>
				)}
				<tfoot>
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td>Subtotal:</td>
						<td>£{total.toFixed(2)}</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>
	);
};
