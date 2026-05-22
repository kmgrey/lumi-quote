import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductImage } from "./ProductImage";

export const QuoteTemplate = () => {
	const [quote, setQuote] = useState(null);
	const [items, setItems] = useState([]);
	const { id } = useParams();
	const navigate = useNavigate();

	const fetchQuote = async () => {
		const data = await window.api.getQuoteById(id);
		setQuote(data);
		console.log("quote: ", data);
		//console.log("customer: ", data.customer_id);
	};
	const fetchItems = async () => {
		const data = await window.api.getQuoteItems(id);
		setItems(data);
	};

	useEffect(() => {
		fetchQuote(id);
		fetchItems(id);
	}, [id]);

	const VAT_RATE = 0.2;

	const netTotal = items.reduce((sum, item) => {
		const discount = quote?.discount_percent || 0;
		const lineTotal = item.discount_eligible ? item.quantity * item.unit_price * (1 - discount / 100) : item.quantity * item.unit_price;
		return sum + lineTotal;
	}, 0);

	const vatAmount = netTotal * VAT_RATE;
	const grossTotal = netTotal + vatAmount;

	return (
		<div id="quote-template">
			{/* BACK BUTTON
			<button onClick={() => navigate(`/quotes`)}>Back</button>
			*/}

			{/* COMPANY DETAILS */}
			<div id="quote-template-header">
				<div>
					<h3>Luminite Electronics Ltd.</h3>
					<p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							className="bi bi-building-fill"
							viewBox="0 0 16 16"
						>
							<path d="M3 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3v-3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V16h3a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm1 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5M4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
						</svg>{" "}
						2a Bellevue Road, Friern Barnet, London, N11 3ER
					</p>
					<p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							className="bi bi-telephone-fill"
							viewBox="0 0 16 16"
						>
							<path
								fill-rule="evenodd"
								d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
							/>
						</svg>{" "}
						020 8368 7887
					</p>
					<p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							className="bi bi-envelope-at-fill"
							viewBox="0 0 16 16"
						>
							<path d="M2 2A2 2 0 0 0 .05 3.555L8 8.414l7.95-4.859A2 2 0 0 0 14 2zm-2 9.8V4.698l5.803 3.546zm6.761-2.97-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 9.671V4.697l-5.803 3.546.338.208A4.5 4.5 0 0 1 12.5 8c1.414 0 2.675.652 3.5 1.671" />
							<path d="M15.834 12.244c0 1.168-.577 2.025-1.587 2.025-.503 0-1.002-.228-1.12-.648h-.043c-.118.416-.543.643-1.015.643-.77 0-1.259-.542-1.259-1.434v-.529c0-.844.481-1.4 1.26-1.4.585 0 .87.333.953.63h.03v-.568h.905v2.19c0 .272.18.42.411.42.315 0 .639-.415.639-1.39v-.118c0-1.277-.95-2.326-2.484-2.326h-.04c-1.582 0-2.64 1.067-2.64 2.724v.157c0 1.867 1.237 2.654 2.57 2.654h.045c.507 0 .935-.07 1.18-.18v.731c-.219.1-.643.175-1.237.175h-.044C10.438 16 9 14.82 9 12.646v-.214C9 10.36 10.421 9 12.485 9h.035c2.12 0 3.314 1.43 3.314 3.034zm-4.04.21v.227c0 .586.227.8.581.8.31 0 .564-.17.564-.743v-.367c0-.516-.275-.708-.572-.708-.346 0-.573.245-.573.791" />
						</svg>{" "}
						info@luminite.co.uk
					</p>
					<p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							className="bi bi-browser-chrome"
							viewBox="0 0 16 16"
						>
							<path
								fill-rule="evenodd"
								d="M16 8a8 8 0 0 1-7.022 7.94l1.902-7.098a3 3 0 0 0 .05-1.492A3 3 0 0 0 10.237 6h5.511A8 8 0 0 1 16 8M0 8a8 8 0 0 0 7.927 8l1.426-5.321a3 3 0 0 1-.723.255 3 3 0 0 1-1.743-.147 3 3 0 0 1-1.043-.7L.633 4.876A8 8 0 0 0 0 8m5.004-.167L1.108 3.936A8.003 8.003 0 0 1 15.418 5H8.066a3 3 0 0 0-1.252.243 2.99 2.99 0 0 0-1.81 2.59M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
							/>
						</svg>{" "}
						www.luminite.co.uk
					</p>
				</div>
				<div>
					<img src="/src/assets/luminite-logo.png" className="logo" />
					<div>
						<p>
							<strong>WEEE reg.</strong> WEE/BH0005ZR
						</p>
						<p>
							<strong>VAT reg.</strong> 370 7937 27
						</p>
						<p>
							<strong>Company reg.</strong> 01656237
						</p>
					</div>
				</div>
			</div>

			{/* CUSTOMER */}
			{quote && (
				<div id="quote-template-details">
					<h1>Quotation: {quote.quote_number}</h1>
					<table>
						<tr>
							<th>Customer Name</th>
							<td>{quote.customer_name}</td>
							<th>Primary Contact</th>
							<td>{quote.customer_primary_contact}</td>
						</tr>
						<tr>
							<th>Customer Address</th>
							<td>{quote.customer_address}</td>
							<th>Customer Email</th>
							<td>{quote.customer_email}</td>
						</tr>
						<tr>
							<th>Customer Phone</th>
							<td>{quote.customer_phone}</td>
							<th>Quotation Date</th>
							<td>{new Date(quote.created_at).toLocaleDateString("en-GB")}</td>
						</tr>
					</table>
				</div>
			)}

			{/* QUOTE ITEMS */}
			{quote && (
				<div id="quote-template-items">
					<table>
						<colgroup>
							<col />
							<col className="desc" />
							<col />
							<col />
							<col />
							<col />
							<col />
						</colgroup>
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
									<td>
										<ProductImage filename={item.image} />
									</td>
									<td>{item.quantity}</td>
									<td>£{item.unit_price.toFixed(2)}</td>
									<td>{quote.discount_percent > 0 && item.discount_eligible ? `${quote.discount_percent}%` : "-"}</td>
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
								<td colSpan="5" className="td-borderless"></td>
								<th>Total</th>
								<td>£{netTotal.toFixed(2)}</td>
							</tr>
							<tr>
								<td colSpan="5" className="td-borderless"></td>
								<th>VAT</th>
								<td>£{vatAmount.toFixed(2)}</td>
							</tr>
							<tr>
								<td colSpan="5" className="td-borderless"></td>
								<th>Grand Total</th>
								<td>£{grossTotal.toFixed(2)}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			)}

			{/* NOTES && PAYMENT DETAILS */}
			<footer id="quote-template-footer">
				<div>
					<h4>Remarks:</h4>
					<p>Shipping not included in quote</p>
					<p>This quote is valid for 30 days from the date of creation</p>
					<p>Production estimate: 5-7 working days from date of payment</p>
				</div>
				<div>
					<h4>Payment Details:</h4>
					<p>
						<strong>Account Name:</strong> Luminite Electronics Ltd.
					</p>
					<p>
						<strong>Sort Code:</strong> 20-95-61
					</p>
					<p>
						<strong>Account No:</strong> 70736945
					</p>
					<p>
						<strong>Bank:</strong> Barclays Bank Plc.
					</p>
				</div>
			</footer>
		</div>
	);
};
