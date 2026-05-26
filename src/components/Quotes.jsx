import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewDocumentIcon, EditIcon, DeleteIcon, PdfIcon, CancelIcon } from "./Icons";

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
		<div className="page-container quotes">
			<h1 className="page-title">• Quotes •</h1>
			{/* CREATE NEW QUOTE */}
			{!modal && !deletingId && (
				<button className="outer-button" onClick={() => handleNewQuote()}>
					<NewDocumentIcon />
					New Quote
				</button>
			)}

			{/* QUOTES */}
			{!modal && !deletingId && (
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
											<EditIcon />
											Edit
										</button>
										{/* PRINT BUTTON FOR TEST
									<button className="table-button" onClick={() => navigate(`/quote-template/${quote.id}`)}>
										Print
									</button>
									*/}

										<button className="table-button delete" onClick={() => triggerDeleteQuote(quote.id)}>
											<DeleteIcon />
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* DELETE QUOTE MODAL */}
			{deletingId && (
				<div className="modal">
					<h2>Confirm Deletion</h2>
					<p className="err-msg">Are you sure you want to delete this quote?</p>
					<div className="button-container">
						<button className="modal-button save" onClick={() => setDeletingId(null)}>
							<CancelIcon />
							Cancel
						</button>
						<button className="modal-button delete" onClick={confirmDeleteQuote}>
							<DeleteIcon />
							Delete
						</button>
					</div>
				</div>
			)}

			{/* CREATE QUOTE MODAL */}
			{modal && (
				<div className="modal new-quote">
					<h2>New Quote</h2>
					<label htmlFor="customers">
						Select customer to quote:
						<select name="customers" onChange={(event) => setCustomerId(event.target.value)}>
							<option value="">select customer</option>
							{customers.map((customer) => (
								<option key={customer.id} value={customer.id}>
									{customer.name}
								</option>
							))}
						</select>
					</label>

					<div className="button-container">
						<button className="modal-button cancel" onClick={() => setModal(false)}>
							<CancelIcon />
							Cancel
						</button>
						<button className="modal-button save" onClick={() => handleCreateQuote()}>
							<NewDocumentIcon />
							Create
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
