import path from "node:path";
import { app } from "electron";
import fs from "node:fs";
import initSqlJs from "sql.js";

let db;
let dbPath;
export let imagesPath;

// ---------------------------------------------------------------------------
// SAVE HELPER
// ---------------------------------------------------------------------------
function save() {
	const data = db.export();
	fs.writeFileSync(dbPath, Buffer.from(data));
}

// ---------------------------------------------------------------------------
// QUERY HELPERS
// ---------------------------------------------------------------------------
function all(sql, params = []) {
	const stmt = db.prepare(sql);
	stmt.bind(params);
	const rows = [];
	while (stmt.step()) {
		rows.push(stmt.getAsObject());
	}
	stmt.free(); 
	return rows;
}

function get(sql, params = []) {
	const stmt = db.prepare(sql);
	stmt.bind(params);
	let row = null;
	if (stmt.step()) {
		row = stmt.getAsObject();
	}
	stmt.free();
	return row;
}

function run(sql, params = []) {
	db.run(sql, params);
	save();
}

function lastInsertId() {
	return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------
export async function initDatabase() {
	const SQL = await initSqlJs({
		locateFile: (file) => path.join(app.getAppPath(), "node_modules", "sql.js", "dist", file),
	});

	const userDataPath = app.getPath("userData");
	dbPath = path.join(userDataPath, "lumi-quote.db");
	imagesPath = path.join(userDataPath, "images");

	console.log("👉 DB PATH:", dbPath);

	if (!fs.existsSync(imagesPath)) {
		fs.mkdirSync(imagesPath);
	}

	const fileBuffer = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
	db = new SQL.Database(fileBuffer);

	db.exec(`
		CREATE TABLE IF NOT EXISTS ranges (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			range_id INTEGER NOT NULL,
			FOREIGN KEY (range_id) REFERENCES ranges(id)
		);

		CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			part_code TEXT NOT NULL,
			price REAL NOT NULL,
			image TEXT,
			category_id INTEGER NOT NULL,
			FOREIGN KEY (category_id) REFERENCES categories(id)
		);

		CREATE TABLE IF NOT EXISTS customers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT,
			address TEXT,
			email TEXT,
			phone TEXT,
			primary_contact TEXT
		);

		CREATE TABLE IF NOT EXISTS quotes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			quote_number TEXT NOT NULL DEFAULT '',
			customer_id INTEGER NOT NULL,
			status TEXT NOT NULL DEFAULT 'draft',
			discount_percent REAL NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (customer_id) REFERENCES customers(id)
		);

		CREATE TABLE IF NOT EXISTS quote_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			quote_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			quantity INTEGER NOT NULL DEFAULT 1,
			unit_price REAL NOT NULL,
			discount_eligible INTEGER NOT NULL DEFAULT 1,
			FOREIGN KEY (quote_id) REFERENCES quotes(id),
			FOREIGN KEY (product_id) REFERENCES products(id)
		);
	`);

	save();
}

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------

export function getAllRanges() {
	return all("SELECT * FROM ranges");
}

export function getProductsByRange(rangeId) {
	const categories = all("SELECT * FROM categories WHERE range_id = ?", [rangeId]);
	return categories.map((category) => ({
		...category,
		products: all("SELECT * FROM products WHERE category_id = ?", [category.id]),
	}));
}

export function addProduct(name, part_code, price, category_id) {
	run("INSERT INTO products (name, part_code, price, category_id) VALUES (?, ?, ?, ?)", [name, part_code, price, category_id]);
}

export function updateProduct(id, name, part_code, price) {
	run("UPDATE products SET name = ?, part_code = ?, price = ? WHERE id = ?", [name, part_code, price, id]);
}

export function deleteProduct(id) {
	run("DELETE FROM products WHERE id = ?", [id]);
}

// ---------------------------------------------------------------------------
// CUSTOMERS
// ---------------------------------------------------------------------------

export function getCustomers() {
	return all("SELECT * FROM customers");
}

export function addCustomer(name, type, address, email, phone, primary_contact) {
	run("INSERT INTO customers (name, type, address, email, phone, primary_contact) VALUES (?, ?, ?, ?, ?, ?)", [
		name, type, address, email, phone, primary_contact,
	]);
}

export function updateCustomer(id, name, type, address, email, phone, primary_contact) {
	run("UPDATE customers SET name=?, type=?, address=?, email=?, phone=?, primary_contact=? WHERE id=?", [
		name, type, address, email, phone, primary_contact, id,
	]);
}

export function deleteCustomer(id) {
	run("DELETE FROM customers WHERE id = ?", [id]);
}

// ---------------------------------------------------------------------------
// QUOTES
// ---------------------------------------------------------------------------

export function createQuote(customer_id) {
	run("INSERT INTO quotes (customer_id) VALUES (?)", [customer_id]);
	const id = lastInsertId();
	const quote_number = `LQ-${String(id).padStart(4, "0")}`;
	run("UPDATE quotes SET quote_number = ? WHERE id = ?", [quote_number, id]);
	return { id, quote_number };
}

export function getAllQuotes() {
	return all(`
		SELECT
			quotes.*,
			customers.name as customer_name,
			customers.address as customer_address,
			customers.email as customer_email,
			customers.phone as customer_phone,
			customers.primary_contact as customer_primary_contact,

			COALESCE(SUM(
				quote_items.quantity * quote_items.unit_price
				* CASE WHEN quote_items.discount_eligible = 1
					THEN (1.0 - quotes.discount_percent / 100.0)
					ELSE 1.0
				END
			), 0) as net_total,

			COALESCE(SUM(
				quote_items.quantity * quote_items.unit_price
				* CASE WHEN quote_items.discount_eligible = 1
					THEN (1.0 - quotes.discount_percent / 100.0)
					ELSE 1.0
				END
			), 0) * 0.20 as vat_amount,

			COALESCE(SUM(
				quote_items.quantity * quote_items.unit_price
				* CASE WHEN quote_items.discount_eligible = 1
					THEN (1.0 - quotes.discount_percent / 100.0)
					ELSE 1.0
				END
			), 0) * 1.20 as gross_total

		FROM quotes
		JOIN customers ON quotes.customer_id = customers.id
		LEFT JOIN quote_items ON quote_items.quote_id = quotes.id
		GROUP BY quotes.id
		ORDER BY quotes.created_at DESC
	`);
}

export function getQuoteById(id) {
	return get(`
		SELECT
			quotes.*,
			customers.name as customer_name,
			customers.address as customer_address,
			customers.email as customer_email,
			customers.phone as customer_phone,
			customers.primary_contact as customer_primary_contact
		FROM quotes
		JOIN customers ON quotes.customer_id = customers.id
		WHERE quotes.id = ?
	`, [id]);
}

export function getQuoteItems(quote_id) {
	return all(`
		SELECT quote_items.*, products.name, products.part_code, products.image
		FROM quote_items
		JOIN products ON quote_items.product_id = products.id
		WHERE quote_items.quote_id = ?
	`, [quote_id]);
}

export function addQuoteItem(quote_id, product_id, quantity, unit_price, discount_eligible = 1) {
	run("INSERT INTO quote_items (quote_id, product_id, quantity, unit_price, discount_eligible) VALUES (?, ?, ?, ?, ?)", [
		quote_id, product_id, quantity, unit_price, discount_eligible,
	]);
}

export function updateQuoteItem(id, quantity, discount_eligible) {
	run("UPDATE quote_items SET quantity = ?, discount_eligible = ? WHERE id = ?", [quantity, discount_eligible, id]);
}

export function removeQuoteItem(id) {
	run("DELETE FROM quote_items WHERE id = ?", [id]);
}

export function updateQuoteDiscount(id, discount_percent) {
	run("UPDATE quotes SET discount_percent = ? WHERE id = ?", [discount_percent, id]);
}

export function updateQuoteStatus(id, status) {
	run("UPDATE quotes SET status = ? WHERE id = ?", [status, id]);
}

export function deleteQuote(id) {
	run("DELETE FROM quote_items WHERE quote_id = ?", [id]);
	run("DELETE FROM quotes WHERE id = ?", [id]);
}

// ---------------------------------------------------------------------------
// CSV IMPORT
// ---------------------------------------------------------------------------

export function findOrCreateRange(name) {
	let range = get("SELECT * FROM ranges WHERE name = ?", [name]);
	if (!range) {
		run("INSERT INTO ranges (name) VALUES (?)", [name]);
		range = { id: lastInsertId() };
	}
	return range;
}

export function findOrCreateCategory(name, rangeId) {
	let category = get("SELECT * FROM categories WHERE name = ?", [name]);
	if (!category) {
		run("INSERT INTO categories (name, range_id) VALUES (?, ?)", [name, rangeId]);
		category = { id: lastInsertId() };
	}
	return category;
}

export function addProductFromImport(part_code, name, price, image, categoryId) {
	run("INSERT INTO products (part_code, name, price, image, category_id) VALUES (?, ?, ?, ?, ?)", [
		part_code, name, price, image, categoryId,
	]);
}