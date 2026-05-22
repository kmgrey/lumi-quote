import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProductImage } from "./ProductImage";

export const QuoteBuilder = () => {
	const [quote, setQuote] = useState(null);
	const [items, setItems] = useState([]);
	const [products, setProducts] = useState([]);
	const { id } = useParams();

	const fetchProducts = async () => {
		const ranges = await window.api.getAllRanges();
		const results = await Promise.all(ranges.map((range) => window.api.getProductsByRange(range.id)));
		const flatProducts = results.flat().flatMap((category) => category.products);
		setProducts(flatProducts);
	};

	const fetchQuote = async () => {
		const data = await window.api.getQuoteById(id);
		setQuote(data);
	};

	const fetchItems = async () => {
		const data = await window.api.getQuoteItems(id);
		setItems(data);
	};

	useEffect(() => {
		fetchProducts();
		fetchQuote(id);
		fetchItems(id);
	}, [id]);

	const handleDiscountChange = async (value) => {
		setQuote({ ...quote, discount_percent: value });
		await window.api.updateQuoteDiscount(id, value);
	};

	const handleQuoteStatus = async (quoteId, status) => {
		await window.api.updateQuoteStatus(quoteId, status);
		fetchQuote(id);
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

	const handleDiscountEligibility = async (itemId, quantity, discount_eligible) => {
		await window.api.updateQuoteItem(itemId, quantity, discount_eligible);
		fetchItems();
	};

	const handleRemoveItem = async (itemId) => {
		await window.api.removeQuoteItem(itemId);
		fetchItems();
	};

	const VAT_RATE = 0.2;

	const netTotal = items.reduce((sum, item) => {
		const discount = quote?.discount_percent || 0;
		const lineTotal = item.discount_eligible ? item.quantity * item.unit_price * (1 - discount / 100) : item.quantity * item.unit_price;
		return sum + lineTotal;
	}, 0);

	const vatAmount = netTotal * VAT_RATE;
	const grossTotal = netTotal + vatAmount;

	return (
		<div className="page-container">
			<h1 className="page-title">• Quote Builder •</h1>
			{/* EXPORT TO PDF */}
			<button className="outer-button" onClick={() => window.api.exportPdf(id)}>
				Export PDF
			</button>
			{/* QUOTE INFO */}
			<table className="quote-info-table">
				<colgroup>
					<col />
					<col />
					<col className="med-col" />
					<col className="med-col" />
				</colgroup>
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
							<td>
								<select value={quote.status} onChange={(e) => handleQuoteStatus(quote.id, e.target.value)}>
									<option value="draft">DRAFT</option>
									<option value="sent">SENT</option>
								</select>
							</td>
							<td>
								<div className="number-control">
									<input
										type="number"
										className="num-input"
										min="0"
										max="30"
										value={quote.discount_percent}
										onChange={(e) => handleDiscountChange(e.target.value)}
										onKeyDown={(e) => {
											if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
												e.preventDefault();
											}
										}}
									/>
									{/*
									<button className="num-btn" onClick={() => handleDiscountChange(Math.max(0, Number(quote.discount_percent) - 1))}>-</button>
									<button className="num-btn" onClick={() => handleDiscountChange(Math.min(30, Number(quote.discount_percent) + 1))}>+</button>
									*/}
								</div>
							</td>
						</tr>
					</tbody>
				)}
			</table>
			{/* SEARCH PRODUCTS */}
			<div className="product-select">
				<label htmlFor="products">Select product to add to quote:</label>
				<select name="products" onChange={(e) => handleAddProduct(e.target.value)}>
					<option value="">select product</option>
					{products.map((product) => (
						<option key={product.id} value={product.id}>
							{product.part_code} — {product.name}
						</option>
					))}
				</select>
			</div>

			{/* PRODUCTS IN QUOTE */}
			<table className="quote-items-table">
				<colgroup>
					<col className="med-col" />
					<col />
					<col className="med-col" />
					<col className="small-col" />
					<col className="med-col" />
					<col className="small-col" />
					<col className="med-col" />
					<col className="table-button-column" />
				</colgroup>
				<thead className="quote-items-table-header">
					<tr>
						<th>Part Code</th>
						<th>Description</th>
						<th>Image</th>
						<th>Quantity</th>
						<th>Unit Price</th>
						<th>Discount Eligible</th>
						<th>Line Total</th>
						<th className="td-borderless"></th>
					</tr>
				</thead>
				{items && (
					<tbody>
						{items.map((item) => (
							<tr key={item.id}>
								<td>{item.part_code}</td>
								<td>{item.name}</td>
								<td>
									<ProductImage filename={item.image} />
								</td>
								<td>
									<div className="number-control">
										<input
											type="number"
											className="num-input"
											value={item.quantity}
											min="1"
											onChange={(e) => handleQuantityChange(item.id, Number(e.target.value), item.discount_eligible)}
										/>
										{/*
										<button
											className="num-btn"
											onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1), item.discount_eligible)}
										>
											-
										</button>
										<button className="num-btn" onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.discount_eligible)}>
											+
										</button>
										*/}
									</div>
								</td>
								<td>£{item.unit_price.toFixed(2)}</td>
								<td>
									<input
										type="checkbox"
										checked={item.discount_eligible}
										onChange={(e) => handleDiscountEligibility(item.id, item.quantity, item.discount_eligible ? 0 : 1)}
									/>
									{/*item.discount_eligible ? "Yes" : "No"*/}
								</td>
								<td>
									£
									{(item.discount_eligible
										? item.quantity * item.unit_price * (1 - quote.discount_percent / 100)
										: item.quantity * item.unit_price
									).toFixed(2)}
								</td>
								<td className="td-borderless">
									<div className="table-button-container">
										<button className="table-button delete" onClick={() => handleRemoveItem(item.id)}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												fill="currentColor"
												class="bi bi-trash3-fill"
												viewBox="0 0 16 16"
											>
												<path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
											</svg>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				)}
				<tfoot className="quote-items-table-footer">
					<tr>
						<td className="td-borderless" colSpan="5"></td>
						<th>Total</th>
						<td>£{netTotal.toFixed(2)}</td>
					</tr>
					<tr>
						<td className="td-borderless" colSpan="5"></td>
						<th>VAT</th>
						<td>£{netTotal.toFixed(2)}</td>
					</tr>
					<tr>
						<td className="td-borderless" colSpan="5"></td>
						<th>Grand Total</th>
						<td>£{netTotal.toFixed(2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>
	);
};
