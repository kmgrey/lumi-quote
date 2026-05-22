import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Quotes = () => {
	const [quotes, setQuotes] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [customerId, setCustomerId] = useState("");
	const [modal, setModal] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
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

	// CREATE QUOTE
	const handleNewQuote = async () => {
		fetchCustomers();
		setModal(true);
	};

	const handleCreateQuote = async () => {
		if (!customerId) return;
		const { id } = await window.api.createQuote(Number(customerId));
		navigate(`/quotes/${id}`);
		setCustomerId("");
		setModal(false);
	};

	// DELETE QUOTE
	const triggerDeleteQuote = (id) => {
		setDeletingId(id);
	};

	const confirmDeleteQuote = async () => {
		await window.api.deleteQuote(deletingId);
		setDeletingId(null);
		fetchQuotes();
	};

	return (
		<div className="page-container">
			<h1 className="page-title">• Quotes •</h1>
			{/* CREATE NEW QUOTE */}
			<button className="outer-button" onClick={() => handleNewQuote()}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					className="bi bi-file-earmark-pdf-fill"
					viewBox="0 0 16 16"
				>
					<path d="M5.523 12.424q.21-.124.459-.238a8 8 0 0 1-.45.606c-.28.337-.498.516-.635.572l-.035.012a.3.3 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548m2.455-1.647q-.178.037-.356.078a21 21 0 0 0 .5-1.05 12 12 0 0 0 .51.858q-.326.048-.654.114m2.525.939a4 4 0 0 1-.435-.41q.344.007.612.054c.317.057.466.147.518.209a.1.1 0 0 1 .026.064.44.44 0 0 1-.06.2.3.3 0 0 1-.094.124.1.1 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256M8.278 6.97c-.04.244-.108.524-.2.829a5 5 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.5.5 0 0 1 .145-.04c.013.03.028.092.032.198q.008.183-.038.465z" />
					<path
						fill-rule="evenodd"
						d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.7 11.7 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.86.86 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.84.84 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.8 5.8 0 0 0-1.335-.05 11 11 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.24 1.24 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a20 20 0 0 1-1.062 2.227 7.7 7.7 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103"
					/>
				</svg>
				New Quote
			</button>

			{/* QUOTES */}
			<table className="quotes-table">
				<colgroup>
					<col />
					<col />
					<col />
					<col />
					<col />
					<col />
					<col className="table-button-column" />
				</colgroup>
				<thead className="quotes-table-header">
					<tr>
						<th>Quote Number</th>
						<th>Customer</th>
						<th>Status</th>
						<th>Discount</th>
						<th>Net Total</th>
						<th>Created</th>
						<th className="td-borderless"></th>
					</tr>
				</thead>
				<tbody>
					{quotes.map((quote) => (
						<tr key={quote.id}>
							<td>{quote.quote_number}</td>
							<td>{quote.customer_name}</td>
							<td>{quote.status.toUpperCase()}</td>
							<td>{quote.discount_percent}%</td>
							<td>£{Number(quote.net_total).toFixed(2)}</td>
							<td>{new Date(quote.created_at).toLocaleDateString("en-GB")}</td>
							<td className="td-borderless">
								<div className="table-button-container">
									<button className="table-button edit" onClick={() => navigate(`/quotes/${quote.id}`)}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											className="bi bi-pencil-fill"
											viewBox="0 0 16 16"
										>
											<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
										</svg>
										Edit
									</button>
									{/* PRINT BUTTON FOR TEST
									<button className="table-button" onClick={() => navigate(`/quote-template/${quote.id}`)}>
										Print
									</button>
									*/}

									<button className="table-button delete" onClick={() => triggerDeleteQuote(quote.id)}>
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
			</table>

			{/* DELETE QUOTE MODAL */}
			{deletingId && (
				<div>
					<h2>Confirm Deletion</h2>
					<p>Are you sure you want to delete this quote?</p>
					<button onClick={() => setDeletingId(null)}>Cancel</button>
					<button onClick={confirmDeleteQuote}>Yes, Delete</button>
				</div>
			)}

			{/* CREATE QUOTE MODAL */}
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
