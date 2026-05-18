import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const QuoteTemplate = () => {
	const [quote, setQuote] = useState(null);
	const [items, setItems] = useState([]);
	const { id } = useParams();

	const fetchQuote = async () => {
		const data = await window.api.getQuoteById(id);
		setQuote(data);
		console.log("quote: ", data);
		console.log("customer: ", data.customer_id);
	};
	const fetchItems = async () => {
		const data = await window.api.getQuoteItems(id);
		setItems(data);
	};

	useEffect(() => {
		fetchQuote(id);
		fetchItems(id);
	}, [id]);

	const total = items.reduce((sum, item) => {
		const lineTotal = item.discount_eligible
			? item.quantity * item.unit_price * (1 - quote.discount_percent / 100)
			: item.quantity * item.unit_price;
		return sum + lineTotal;
	}, 0);

	return (
		<div>
			<h1>Quotation</h1>
			<hr></hr>
			<div>
				<p>Luminite Electronics Ltd.</p>
				<p>2a Bellevue Road, Friern Barnet, London, N11 3ER</p>
				<p>020 8368 7887</p>
				<p>info@luminite.co.uk</p>
			</div>
			<hr></hr>
			{/* CUSTOMER */}
			{quote && (
				<div>
					<p>No: {quote.quote_number}</p>
					<p>Customer: {quote.customer_name}</p>
					<p>Address: {quote.customer_address}</p>
					<p>Email: {quote.customer_email}</p>
					<p>Phone: {quote.customer_phone}</p>
					<p>{quote.customer_primary_contact}</p>
					<p>Date: {new Date(quote.created_at).toLocaleDateString("en-GB")}</p>
				</div>
			)}
			<hr></hr>
			{/* QUOTE ITEMS */}
			{quote && (
				<div>
					<table>
						<thead>
							<tr>
								<th>Part Code</th>
								<th>Description</th>
								<th>Image</th>
								<th>Quantity</th>
								<th>Unit Price</th>
								<th>Discount</th>
								<th>Line Total</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item) => (
								<tr key={item.id}>
									<td>{item.part_code}</td>
									<td>{item.name}</td>
									<td>Image placeholder</td>
									<td>{item.quantity}</td>
									<td>£{item.unit_price.toFixed(2)}</td>
									<td>{quote.discount_percent > 0 && item.discount_eligible ? `${quote.discount_percent}` : "N/A"}</td>
									<td>
										£
										{(item.discount_eligible
											? item.quantity * item.unit_price * (1 - quote.discount_percent / 100)
											: item.quantity * item.unit_price
										).toFixed(2)}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan="5"></td>
								<td>Subtotal:</td>
								<td>£{total.toFixed(2)}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			)}
			<div>
				<hr></hr>
				<p>Remarks:</p>
				<p>Shipping not included in quote</p>
				<p>This quote is valid for 30 days from the date of creation</p>
				<p>Production estimate: 5-7 working days from date of payment</p>
			</div>
		</div>
	);
};
