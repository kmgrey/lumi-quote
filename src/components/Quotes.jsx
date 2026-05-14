import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Quotes = () => {
	const [quotes, setQuotes] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [customerId, setCustomerId] = useState("");
	const [modal, setModal] = useState(false);
	const navigate = useNavigate();

	const fetchQuotes = async () => {
		const data = await window.api.getAllQuotes();
		setQuotes(data);
	};

	const fetchCustomers = async () => {
		const data = await window.api.getCustomers();
		setCustomers(data);
	};

	useEffect(() => {
		fetchQuotes();
	}, []);

	const handleNewQuote = async () => {
		fetchCustomers();
		setModal(true);
	};

	const handleCreateQuote = async () => {
		if (!customerId) return
		const { id } = await window.api.createQuote(Number(customerId));
		navigate(`/quotes/${id}`);
		setCustomerId("");
		setModal(false);
	};

	return (
		<div>
			<h1>Quotes</h1>
			<button onClick={() => handleNewQuote()}>New Quote</button>
			<table>
				<thead>
					<tr>
						<th>Quote Number</th>
						<th>Customer</th>
						<th>Status</th>
						<th>Discount</th>
						<th>Quote Total</th>
						<th>Created</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{quotes.map((quote) => (
						<tr key={quote.id}>
							<td>{quote.quote_number}</td>
							<td>{quote.customer_name}</td>
							<td>{quote.status}</td>
							<td>{quote.discount_percent}%</td>
							<td>£{Number(quote.total).toFixed(2)}</td>
							<td>{new Date(quote.created_at).toLocaleDateString("en-GB")}</td>
							<td>
								<button onClick={() => navigate(`/quotes/${quote.id}`)}>Open</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* MODAL */}
			{modal && (
				<div>
					<h2>New Quote</h2>
					<label htmlFor="customers">Select customer to quote:</label>
					<select name="customers" onChange={(event) => setCustomerId(event.target.value)}>
						<option value="">select customer</option>
						{customers.map((customer) => (
							<option key={customer.id} value={customer.id}>
								{customer.name}
							</option>
						))}
					</select>
					<button onClick={() => setModal(false)}>Cancel</button>
					<button onClick={() => handleCreateQuote()}>Create Quote</button>
				</div>
			)}
		</div>
	);
};
