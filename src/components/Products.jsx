import { useState, useEffect } from "react";
import { ProductImage } from "./ProductImage";

export const Products = () => {
	const [rangesData, setRangesData] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({ name: "", part_code: "", price: "" });

	const fetchAllData = async () => {
		const ranges = await window.api.getAllRanges();

		const combinedData = await Promise.all(
			ranges.map(async (range) => {
				const categories = await window.api.getProductsByRange(range.id);
				return { ...range, categories };
			}),
		);

		setRangesData(combinedData);
	};

	useEffect(() => {
		fetchAllData();
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

	const handleImportCsv = async () => {
		const result = await window.api.importProductsCsv();
		if (!result.success) return;
		alert(`Imported: ${result.imported} products. Skipped: ${result.skipped}`);
		fetchProducts();
	};

	return (
		<div className="page-container">
			<h1 className="page-title">• Products •</h1>
			{/* IMPORT PRODUCTS CSV */}
			<button className="outer-button" onClick={handleImportCsv}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					className="bi bi-file-earmark-arrow-up-fill"
					viewBox="0 0 16 16"
				>
					<path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707z" />
				</svg>
				Import Products
			</button>
			{/* CREATE TABLE PER PRODUCT RANGE */}
			{rangesData.map((range) => (
				<div key={range.id}>
					<table className="product-table">
						{/* COLGROUP */}
						<colgroup>
							<col className="part-code" />
							<col className="desc" />
							<col className="image" /> 
							<col className="price" /> 
							<col className="table-button-column" /> 
						</colgroup>
						<thead>
							<tr className="product-table-range">
								<th colSpan="4">{range.name}</th>
							</tr>
						</thead>
						{/* CATEGORIES LOOP */}
						{range.categories.map((category) => (
							<tbody key={category.id}>
								{/* CATEGORY */}
								<tr className="product-table-category">
									<th colSpan="4">{category.name}</th>
								</tr>
								{/* HEADINGS */}
								<tr className="product-table-header">
									<th>Part Code</th>
									<th>Description</th>
									<th>Image</th>
									<th>Price</th>
									<th className="td-borderless"></th>
								</tr>
								{/* PRODUCTS */}
								{category.products.map((product) => (
									<tr key={product.id}>
										{editingId === product.id ? (
											<>
												<td>
													<input type="text" value={editForm.part_code} onChange={(e) => handleChange("part_code", e.target.value)} />
												</td>
												<td>
													<input type="text" value={editForm.name} onChange={(e) => handleChange("name", e.target.value)} />
												</td>
												<td>
													<ProductImage filename={product.image} />
												</td>
												<td>
													<input type="text" value={editForm.price} onChange={(e) => handleChange("price", e.target.value)} />
												</td>
												<td className="table-button-column td-borderless">
													<div className="table-button-container">
														<button className="table-button save" onClick={() => handleSave(product.id)}>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																fill="currentColor"
																className="bi bi-floppy2-fill"
																viewBox="0 0 16 16"
															>
																<path d="M12 2h-2v3h2z" />
																<path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1" />
															</svg>
															Save
														</button>
														<button className="table-button cancel" onClick={() => setEditingId(null)}>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																fill="currentColor"
																className="bi bi-x-square-fill"
																viewBox="0 0 16 16"
															>
																<path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
															</svg>
															Cancel
														</button>
													</div>
												</td>
											</>
										) : (
											<>
												<td>{product.part_code}</td>
												<td>{product.name}</td>
												<td>
													<ProductImage filename={product.image} />
												</td>
												<td>£{product.price.toFixed(2)}</td>
												<td className="td-borderless">
													<div className="table-button-container">
														<button className="table-button edit" onClick={() => handleEdit(product)}>
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
													</div>
												</td>
											</>
										)}
									</tr>
								))}
							</tbody>
						))}
					</table>
				</div>
			))}
		</div>
	);
};
