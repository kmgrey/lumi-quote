import productData from "./productsData.json";
import customerData from "./customersData.json";

export function seedDatabase(db) {
	// PRODUCTS
	const { count: productCount } = db.prepare("SELECT COUNT(*) as count FROM ranges").get();
	if (productCount === 0) {
		const insertRange = db.prepare("INSERT INTO ranges (name) VALUES (?)");
		const insertCategory = db.prepare("INSERT INTO categories (name, range_id) VALUES (?, ?)");
		const insertProduct = db.prepare("INSERT INTO products (part_code, name, price, category_id) VALUES (?, ?, ?, ?)");

		for (const range of productData.ranges) {
			const { lastInsertRowid: rangeId } = insertRange.run(range.name);

			for (const category of range.categories) {
				const { lastInsertRowid: categoryId } = insertCategory.run(category.name, rangeId);

				for (const product of category.products) {
					insertProduct.run(product.part_code, product.name, product.price, categoryId);
				}
			}
		}

		console.log("Products seeded successfully");
	}

	// CUSTOMERS
	const { count: customerCount } = db.prepare("SELECT COUNT(*) as count FROM customers").get();
	if (customerCount === 0) {
		const insertCustomer = db.prepare("INSERT INTO customers (name, type, address, email, phone, primary_contact) VALUES (?, ?, ?, ?, ?, ?)");
		for (const customer of customerData.customers) {
			insertCustomer.run(customer.name, customer.type, customer.address, customer.email, customer.phone, customer.primary_contact);
		}
		console.log("Customers seeded successfully");
	}

	// QUOTES
	const { count: quoteCount } = db.prepare("SELECT COUNT(*) as count FROM quotes").get();
	if (quoteCount === 0) {
		const customer = db.prepare("SELECT id FROM customers WHERE name =?").get("Test Customer");
		if (customer) {
			const result = db.prepare("INSERT INTO quotes (customer_id) VALUES (?)").run(customer.id);
			const id = result.lastInsertRowid;
			const quote_number = `QUOTE-${String(id).padStart(4, "0")}`;
			db.prepare("UPDATE quotes SET quote_number = ? WHERE id = ?").run(quote_number, id);
			console.log("Test quote seeded successfully");
		}
	}
}
