import { useState, useEffect } from "react";
import { NewCustomerIcon, EditIcon, DeleteIcon, SaveIcon, CancelIcon } from "./Icons";

export const Customers = () => {
	const [customers, setCustomers] = useState([]);
	const [quotes, setQuotes] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({ name: "", type: "", address: "", email: "", phone: "", primary_contact: "" });
	const [newCustomer, setNewCustomer] = useState({ name: "", type: "", address: "", email: "", phone: "", primary_contact: "" });
	const [modal, setModal] = useState(false);
	const [error, setError] = useState("");
	const [deletingId, setDeletingId] = useState(null);

	const fetchCustomers = async () => {
		const data = await window.api.getCustomers();
		setCustomers(data);
	};

	const fetchQuotes = async () => {
		const data = await window.api.getAllQuotes();
		setQuotes(data);
	};

	useEffect(() => {
		fetchCustomers();
		fetchQuotes();
	}, []);

	// EDIT CURRENT CUSTOMERS
	const handleEdit = (customer) => {
		setEditingId(customer.id);
		setEditForm({
			name: customer.name,
			type: customer.type,
			address: customer.address,
			email: customer.email,
			phone: customer.phone,
			primary_contact: customer.primary_contact,
		});
	};

	const handleChange = (field, value) => {
		setEditForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async (id) => {
		await window.api.updateCustomer(id, editForm.name, editForm.type, editForm.address, editForm.email, editForm.phone, editForm.primary_contact);
		setEditingId(null);
		setEditForm({ name: "", type: "", address: "", email: "", phone: "", primary_contact: "" });
		fetchCustomers();
	};

	// CREATE NEW CUSTOMER
	const handleNewCustomerChange = (field, value) => {
		setNewCustomer((prev) => ({ ...prev, [field]: value }));
	};

	const handleCreateCustomer = async () => {
		if (
			!newCustomer.name ||
			!newCustomer.type ||
			!newCustomer.address ||
			!newCustomer.email ||
			!newCustomer.phone ||
			!newCustomer.primary_contact
		) {
			setError("All fields required to create new customer!");
			return;
		}
		setError("");

		await window.api.addCustomer(
			newCustomer.name,
			newCustomer.type,
			newCustomer.address,
			newCustomer.email,
			newCustomer.phone,
			newCustomer.primary_contact,
		);
		setNewCustomer({ name: "", type: "", address: "", email: "", phone: "", primary_contact: "" });
		setModal(false);
		fetchCustomers();
	};

	// DELETE CUSTOMER
	const triggerDeleteCustomer = (id) => {
		setDeletingId(id);
	};

	const confirmDeleteCustomer = async () => {
		await window.api.deleteCustomer(deletingId);
		setDeletingId(null);
		fetchCustomers();
	};

	return (
		<div className="page-container customers">
			<h1 className="page-title">• Customers •</h1>
			{/* CREATE NEW CUSTOMER */}
			{!modal && !deletingId && (
				<button className="outer-button" onClick={() => setModal(true)}>
					<NewCustomerIcon />
					New Customer
				</button>
			)}

			{/* CUSTOMERS && EDIT CUSTOMERS */}
			{!modal && !deletingId && (
				<table className="customer-table">
					<colgroup>
						<col className="name" />
						<col className="type" />
						<col className="address" />
						<col className="email" />
						<col className="phone" />
						<col className="primary-contact" />
						<col className="table-button-column" />
					</colgroup>
					<thead className="customer-table-header">
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Address</th>
							<th>Email</th>
							<th>Phone</th>
							<th>Primary Contact</th>
							<th className="td-borderless"></th>
						</tr>
					</thead>
					<tbody>
						{customers.map((customer) => (
							<tr key={customer.id}>
								{editingId === customer.id ? (
									<>
										<td>
											<input type="text" value={editForm.name} onChange={(e) => handleChange("name", e.target.value)} />
										</td>
										<td>
											<select value={editForm.type} onChange={(e) => handleChange("type", e.target.value)}>
												<option value="installer">INSTALLER</option>
												<option value="school">SCHOOL</option>
											</select>
										</td>
										<td>
											<input type="text" value={editForm.address} onChange={(e) => handleChange("address", e.target.value)} />
										</td>
										<td>
											<input type="text" value={editForm.email} onChange={(e) => handleChange("email", e.target.value)} />
										</td>
										<td>
											<input type="text" value={editForm.phone} onChange={(e) => handleChange("phone", e.target.value)} />
										</td>
										<td>
											<input
												type="text"
												value={editForm.primary_contact}
												onChange={(e) => handleChange("primary_contact", e.target.value)}
											/>
										</td>
										<td className="table-button-column td-borderless">
											<div className="table-button-container">
												<button className="table-button save" onClick={() => handleSave(customer.id)}>
													<SaveIcon />
													Save
												</button>
												<button className="table-button cancel" onClick={() => setEditingId(null)}>
													<CancelIcon />
													Cancel
												</button>
											</div>
										</td>
									</>
								) : (
									<>
										<td>{customer.name}</td>
										<td>{customer.type}</td>
										<td>{customer.address}</td>
										<td>{customer.email}</td>
										<td>{customer.phone}</td>
										<td>{customer.primary_contact}</td>
										<td className="table-button-column td-borderless">
											<div className="table-button-container">
												<button className="table-button edit" onClick={() => handleEdit(customer)}>
													<EditIcon />
													Edit
												</button>
												<button className="table-button delete" onClick={() => triggerDeleteCustomer(customer.id)}>
													<DeleteIcon />
													Delete
												</button>
											</div>
										</td>
									</>
								)}
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* DELETE CUSTOMER MODAL */}
			{deletingId && (
				<div className="modal">
					<h2>Confirm Deletion</h2>
					{quotes.some((quote) => quote.customer_id === deletingId) ? (
						<>
							<p className="err-msg">Cannot delete customer - please delete their associated quotes first.</p>
							<button className="modal-button cancel" onClick={() => setDeletingId(null)}>
								<CancelIcon />
								Cancel
							</button>
						</>
					) : (
						<>
							<p className="err-msg">Are you sure you want to delete this customer?</p>
							<div className="button-container modal">
								<button className="modal-button save" onClick={() => setDeletingId(null)}>
									<CancelIcon />
									Cancel
								</button>
								<button className="modal-button delete" onClick={confirmDeleteCustomer}>
									<DeleteIcon />
									Delete
								</button>
							</div>
						</>
					)}
				</div>
			)}

			{/* NEW CUSTOMER MODAL */}
			{modal && (
				<div className="modal">
					<h2>New Customer</h2>
					{error && <p className="err-msg">{error}</p>}
					<form>
						<label>
							Name:
							<input type="text" value={newCustomer.name} onChange={(e) => handleNewCustomerChange("name", e.target.value)}></input>
						</label>
						<label>
							Type:
							<select value={newCustomer.type} onChange={(e) => handleNewCustomerChange("type", e.target.value)}>
								<option value="" disabled>Select type...</option>
								<option value="installer">Installer</option>
								<option value="school">School</option>
							</select>
						</label>
						<label>
							Address:
							<input type="text" value={newCustomer.address} onChange={(e) => handleNewCustomerChange("address", e.target.value)}></input>
						</label>
						<label>
							Email:
							<input type="text" value={newCustomer.email} onChange={(e) => handleNewCustomerChange("email", e.target.value)}></input>
						</label>
						<label>
							Phone:
							<input type="text" value={newCustomer.phone} onChange={(e) => handleNewCustomerChange("phone", e.target.value)}></input>
						</label>
						<label>
							Primary Contact:
							<input
								type="text"
								value={newCustomer.primary_contact}
								onChange={(e) => handleNewCustomerChange("primary_contact", e.target.value)}
							></input>
						</label>
					</form>
					<div className="button-container">
						<button
							className="modal-button cancel"
							onClick={() => {
								(setModal(false), setError(""));
							}}
						>
							<CancelIcon />
							Cancel
						</button>
						<button className="modal-button save" onClick={() => handleCreateCustomer()}>
							<NewCustomerIcon />
							Create
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
