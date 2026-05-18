import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";
import {
	getAllRanges,
	getProductsByRange,
	addProduct,
	updateProduct,
	deleteProduct,
	imagesPath,
	getCustomers,
	addCustomer,
	updateCustomer,
	deleteCustomer,
	createQuote,
	getAllQuotes,
	getQuoteById,
	getQuoteItems,
	addQuoteItem,
	updateQuoteItem,
	removeQuoteItem,
	updateQuoteDiscount,
	updateQuoteStatus,
	deleteQuote,
} from "./db/db.js";

if (started) {
	app.quit();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
	}

	mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// PRODUCTS
ipcMain.handle("get-all-ranges", () => {
	return getAllRanges();
});

ipcMain.handle("get-products-by-range", (event, rangeId) => {
	return getProductsByRange(rangeId);
});

ipcMain.handle("add-product", (event, name, part_code, price, category_id) => {
	return addProduct(name, part_code, price, category_id);
});

ipcMain.handle("update-product", (event, id, name, part_code, price) => {
	return updateProduct(id, name, part_code, price);
});

ipcMain.handle("delete-product", (event, id) => {
	return deleteProduct(id);
});

ipcMain.handle("get-product-image", (event, filename) => {
	const filePath = path.join(imagesPath, filename);
	if (!fs.existsSync(filePath)) return null;
	const imageData = fs.readFileSync(filePath);
	return `data:image/png;base64,${imageData.toString("base64")}`;
});

// CUSTOMERS
ipcMain.handle("get-customers", () => {
	return getCustomers();
});

ipcMain.handle("add-customer", (event, name, type, address, email, phone, primary_contact) => {
	return addCustomer(name, type, address, email, phone, primary_contact);
});

ipcMain.handle("update-customer", (event, id, name, type, address, email, phone, primary_contact) => {
	return updateCustomer(id, name, type, address, email, phone, primary_contact);
});

ipcMain.handle("delete-customer", (event, id) => {
	return deleteCustomer(id);
});

// QUOTES
ipcMain.handle("create-quote", (event, customer_id) => {
	return createQuote(customer_id);
});

ipcMain.handle("get-all-quotes", () => {
	return getAllQuotes();
});

ipcMain.handle("get-quote-by-id", (event, id) => {
	return getQuoteById(id);
});

ipcMain.handle("get-quote-items", (event, quote_id) => {
	return getQuoteItems(quote_id);
});

ipcMain.handle("add-quote-item", (event, quote_id, product_id, quantity, unit_price, discount_eligible) => {
	return addQuoteItem(quote_id, product_id, quantity, unit_price, discount_eligible);
});

ipcMain.handle("update-quote-item", (event, id, quantity, discount_eligible) => {
	return updateQuoteItem(id, quantity, discount_eligible);
});

ipcMain.handle("remove-quote-item", (event, id) => {
	return removeQuoteItem(id);
});

ipcMain.handle("update-quote-discount", (event, id, discount_percent) => {
	return updateQuoteDiscount(id, discount_percent);
});

ipcMain.handle("update-quote-status", (event, id, status) => {
	return updateQuoteStatus(id, status);
});

ipcMain.handle("delete-quote", (event, id) => {
	return deleteQuote(id);
});

// PDF
ipcMain.handle("export-pdf", async (event, quoteId) => {
	const printWindow = new BrowserWindow({
		show: false,
		webPreferences: { preload: path.join(__dirname, "preload.js") },
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		await printWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/quote-template/${quoteId}`);
	} else {
		await printWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), { hash: `/quote-template/${quoteId}` });
	}

	await new Promise((resolve) => setTimeout(resolve, 1500));

	const pdfData = await printWindow.webContents.printToPDF({
		printBackground: true,
		pageSize: "A4",
	});

	printWindow.close();

	const { filePath, canceled } = await dialog.showSaveDialog({
		title: "Save Quote PDF",
		defaultPath: `quote-${quoteId}.pdf`,
		filters: [{ name: "PDF", extensions: ["pdf"] }],
	});

	if (canceled || !filePath) return { success: false };

	fs.writeFileSync(filePath, pdfData);

	return { success: true, filePath };
});
