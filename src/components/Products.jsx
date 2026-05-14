import { useState, useEffect } from "react";

export const Products = () => {
	const [categories, setCategories] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({ name: "", part_code: "", price: "" });

	const fetchProducts = async () => {
		const data = await window.api.getProductsByRange(1); // TODO: get ranges, don't hardcode
		setCategories(data);
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleEdit = (product) => {
		setEditingId(product.id);
		setEditForm({ name: product.name, part_code: product.part_code, price: product.price });
	};

	const handleChange = (field, value) => {
		setEditForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async (id) => {
		await window.api.updateProduct(id, editForm.name, editForm.part_code, editForm.price);
		setEditingId(null);
		setEditForm({ name: "", part_code: "", price: "" });
		fetchProducts();
	};

	return (
		<div>
			<h1>Products</h1>
			<div>
				<h2>Alertex</h2> {/* TODO: set by range */}
				{categories.map((category) => (
					<table key={category.id}>
						<thead>
							<tr>
								<th colSpan="4">{category.name}</th>
							</tr>
							<tr>
								<th>Part Code</th>
								<th>Description</th>
								<th>Price</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{category.products.map((product) => (
								<tr key={product.id}>
									{editingId === product.id ? (
										<>
											<td>
												<input
													type="text"
													value={editForm.part_code}
													onChange={(e) => handleChange("part_code", e.target.value)}
												/>
											</td>
											<td>
												<input
													type="text"
													value={editForm.name}
													onChange={(e) => handleChange("name", e.target.value)}
												/>
											</td>
											<td>
												<input
													type="text"
													value={editForm.price}
													onChange={(e) => handleChange("price", e.target.value)}
												/>
											</td>
											<td>
												<button onClick={() => handleSave(product.id)}>Save</button>
												<button onClick={() => setEditingId(null)}>Cancel</button>
											</td>
										</>
									) : (
										<>
											<td>{product.part_code}</td>
											<td>{product.name}</td>
											<td>{product.price}</td>
											<td>
												<button onClick={() => handleEdit(product)}>Edit</button>
											</td>
										</>
									)}
								</tr>
							))}
						</tbody>
					</table>
				))}
			</div>
		</div>
	);
};
