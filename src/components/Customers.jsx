import { useState, useEffect } from "react";

export const Customers = () => {
	const [customers, setCustomers] = useState([]);

	const fetchCustomers = async () => {
		const data = await window.api.getCustomers();
		setCustomers(data);
		console.log("data: ", data);
	};

	useEffect(() => {
		fetchCustomers();
	}, []);
   
	return (
		<div>
			<h1>Customers</h1>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Address</th>
						<th>Email</th>
						<th>Phone</th>
						<th>Primary Contact</th>
					</tr>
				</thead>
				<tbody>
					{customers.map((customer) => (
						<tr key={customer.id}>
							<td>{customer.name}</td>
							<td>{customer.type}</td>
							<td>{customer.address}</td>
							<td>{customer.email}</td>
							<td>{customer.phone}</td>
							<td>{customer.primary_contact}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
