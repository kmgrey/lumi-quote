import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
	// PRODUCTS
	getAllRanges: () => ipcRenderer.invoke("get-all-ranges"),
	getProductsByRange: (rangeId) => ipcRenderer.invoke("get-products-by-range", rangeId),
	addProduct: (name, part_code, price, cat_id) => ipcRenderer.invoke("add-product", name, part_code, price, cat_id),
	updateProduct: (id, name, part_code, price) => ipcRenderer.invoke("update-product", id, name, part_code, price),
	deleteProduct: (id) => ipcRenderer.invoke("delete-product", id),
	getProductImage: (filename) => ipcRenderer.invoke("get-product-image", filename),
	// CUSTOMERS
	getCustomers: () => ipcRenderer.invoke("get-customers"),
	addCustomer: (name, type, address, email, phone, primary_contact) =>
		ipcRenderer.invoke("add-customer", name, type, address, email, phone, primary_contact),
	updateCustomer: (id, name, type, address, email, phone, primary_contact) =>
		ipcRenderer.invoke("update-customer", id, name, type, address, email, phone, primary_contact),
	deleteCustomer: (id) => ipcRenderer.invoke("delete-customer", id),
	// QUOTES
	createQuote: (customer_id) => ipcRenderer.invoke("create-quote", customer_id),
	getAllQuotes: () => ipcRenderer.invoke("get-all-quotes"),
	getQuoteById: (id) => ipcRenderer.invoke("get-quote-by-id", id),
	getQuoteItems: (quote_id) => ipcRenderer.invoke("get-quote-items", quote_id),
	addQuoteItem: (quote_id, product_id, quantity, unit_price, discount_eligible) =>
		ipcRenderer.invoke("add-quote-item", quote_id, product_id, quantity, unit_price, discount_eligible),
	updateQuoteItem: (id, quantity, discount_eligible) => ipcRenderer.invoke("update-quote-item", id, quantity, discount_eligible),
	removeQuoteItem: (id) => ipcRenderer.invoke("remove-quote-item", id),
	updateQuoteDiscount: (id, discount_percent) => ipcRenderer.invoke("update-quote-discount", id, discount_percent),
	updateQuoteStatus: (id, status) => ipcRenderer.invoke("update-quote-status", id, status),
	deleteQuote: (id) => ipcRenderer.invoke("delete-quote", id),
	// PDF
	exportPdf: (quoteId) => ipcRenderer.invoke("export-pdf", quoteId),
	// CSV
	importProductsCsv: () => ipcRenderer.invoke("import-products-csv"),
});
