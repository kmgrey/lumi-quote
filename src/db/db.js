import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";
import fs from "node:fs";
// import { seedDatabase } from "./seed.js";

const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "lumi-quote.db");

console.log("👉 DB PATH:", dbPath);

const imagesPath = path.join(userDataPath, "images");
if (!fs.existsSync(imagesPath)) {
	fs.mkdirSync(imagesPath);
}

const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS ranges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
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

// seedDatabase(db);

// PRODUCTS
export function getAllRanges() {
	return db.prepare("SELECT * FROM ranges").all();
}

export function getProductsByRange(rangeId) {
	const categories = db.prepare("SELECT * FROM categories WHERE range_id = ?").all(rangeId);
	return categories.map((category) => ({
		...category,
		products: db.prepare("SELECT * FROM products WHERE category_id = ?").all(category.id),
	}));
}

export function addProduct(name, part_code, price, category_id) {
	return db.prepare("INSERT INTO products (name, part_code, price, category_id) VALUES (?, ?, ?, ?)").run(name, part_code, price, category_id);
}

export function updateProduct(id, name, part_code, price) {
	return db.prepare("UPDATE products SET name = ?, part_code = ?, price = ? WHERE id = ?").run(name, part_code, price, id);
}

export function deleteProduct(id) {
	return db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

export { imagesPath };

// CUSTOMERS
export function getCustomers() {
	return db.prepare("SELECT * FROM customers").all();
}

export function addCustomer(name, type, address, email, phone, primary_contact) {
	return db
		.prepare("INSERT INTO customers (name, type, address, email, phone, primary_contact) VALUES (?, ?, ?, ?, ?, ?)")
		.run(name, type, address, email, phone, primary_contact);
}

export function updateCustomer(id, name, type, address, email, phone, primary_contact) {
	return db
		.prepare("UPDATE customers SET name=?, type=?, address=?, email=?, phone=?, primary_contact=? WHERE id=?")
		.run(name, type, address, email, phone, primary_contact, id);
}

export function deleteCustomer(id) {
	return db.prepare("DELETE FROM customers WHERE id = ?").run(id);
}

// QUOTES
export function createQuote(customer_id) {
	const result = db.prepare("INSERT INTO quotes (customer_id) VALUES (?)").run(customer_id);
	const id = result.lastInsertRowid;
	const quote_number = `LQ-${String(id).padStart(4, "0")}`;
	db.prepare("UPDATE quotes SET quote_number = ? WHERE id = ?").run(quote_number, id);
	return { id, quote_number };
}

export function getAllQuotes() {
	// prettier-ignore
	return db.prepare(`
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
    `).all();
}

export function getQuoteById(id) {
	// prettier-ignore
	return db.prepare(`
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
    `).get(id);
}

export function getQuoteItems(quote_id) {
	// prettier-ignore
	return db.prepare(`
        SELECT quote_items.*, products.name, products.part_code, products.image 
        FROM quote_items 
        JOIN products ON quote_items.product_id = products.id 
        WHERE quote_items.quote_id = ?
    `).all(quote_id);
}

export function addQuoteItem(quote_id, product_id, quantity, unit_price, discount_eligible = 1) {
	return db
		.prepare("INSERT INTO quote_items (quote_id, product_id, quantity, unit_price, discount_eligible) VALUES (?, ?, ?, ?, ?)")
		.run(quote_id, product_id, quantity, unit_price, discount_eligible);
}

export function updateQuoteItem(id, quantity, discount_eligible) {
	return db.prepare("UPDATE quote_items SET quantity = ?, discount_eligible = ? WHERE id = ?").run(quantity, discount_eligible, id);
}

export function removeQuoteItem(id) {
	return db.prepare("DELETE FROM quote_items WHERE id = ?").run(id);
}

export function updateQuoteDiscount(id, discount_percent) {
	return db.prepare("UPDATE quotes SET discount_percent = ? WHERE id = ?").run(discount_percent, id);
}

export function updateQuoteStatus(id, status) {
	return db.prepare("UPDATE quotes SET status = ? WHERE id = ?").run(status, id);
}

export function deleteQuote(id) {
	db.prepare("DELETE FROM quote_items WHERE quote_id = ?").run(id);
	db.prepare("DELETE FROM quotes WHERE id = ?").run(id);
}

// CSV IMPORT
export function findOrCreateRange(name) {
	let range = db.prepare("SELECT * FROM ranges WHERE name = ?").get(name);

	if (!range) {
		const result = db.prepare("INSERT INTO ranges (name) VALUES (?)").run(name);
		range = { id: result.lastInsertRowid };
	}
	return range;
}

export function findOrCreateCategory(name, rangeId) {
	let category = db.prepare("SELECT * FROM categories WHERE name = ?").get(name);

	if (!category) {
		const result = db.prepare("INSERT INTO categories (name, range_id) VALUES (?, ?)").run(name, rangeId);
		category = { id: result.lastInsertRowid };
	}
	return category;
}

export function addProductFromImport(part_code, name, price, image, categoryId) {
	return db
		.prepare("INSERT INTO products (part_code, name, price, image, category_id) VALUES (?, ?, ?, ?, ?)")
		.run(part_code, name, price, image, categoryId);
}
