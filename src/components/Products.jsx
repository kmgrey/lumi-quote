import { useState, useEffect } from "react";
import { ProductImage } from "./ProductImage";
import {CancelIcon, CreateIcon, SaveIcon, EditIcon, DeleteIcon, NewDocumentIcon, ImportIcon} from "./Icons"

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
		fetchAllData();
	};

	const handleImportCsv = async () => {
		const result = await window.api.importProductsCsv();
		if (!result.success) return;
		alert(`Imported: ${result.imported} products. Skipped: ${result.skipped}`);
	fetchAllData();
	};

	return (
		<div className="page-container">
			<h1 className="page-title">• Products •</h1>
			{/* IMPORT PRODUCTS CSV */}
			<button className="outer-button" onClick={handleImportCsv}>
				<ImportIcon/>
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
												<td>{product.part_code}</td>
												<td>{product.name}</td>
												<td>
													<ProductImage filename={product.image} />
												</td>
												<td>£{product.price.toFixed(2)}</td>
												<td className="td-borderless">
													<div className="table-button-container">
														<button className="table-button edit" onClick={() => handleEdit(product)}>
															<EditIcon />
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
