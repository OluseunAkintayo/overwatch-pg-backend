const router = require('express').Router();
const { v4 } = require('uuid');
const pg = require('../DB');
const { TransactionSchema } = require('../Schema');
const { checkTokenAdmin } = require('../Middleware/CheckToken');

const validate = schema => async (req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

const now = new Date().toISOString();

// get all items in the store
router.get("/", checkTokenAdmin, async (req, res) => {
	const query = "SELECT stocks.product_id, products.name, department.description AS department, brands.description as brand, products.cost, products.price, shop, store, stock_id  FROM stocks LEFT JOIN products ON products.product_id = stocks.product_id LEFT JOIN department ON department.department_id = products.department_id LEFT JOIN brands ON brands.brand_id = products.brand_id";
	pg.query(query, (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error retrieving stock", data: err })
			: res.status(200).json({ responseCode: 1, message: "Items retrieved successfully", data: result.rows });
	});
});

// supply new items to the store
router.post("/supply", checkTokenAdmin, validate(TransactionSchema), async (req, res) => {
	const { body: supply } = req;

	try {
		supply.products.forEach(async (product) => {
			total += product.quantity * product.cost;
			const { product_id, stock_id, quantity } = product;
			const auditQuery = "INSERT INTO audit VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
			const getProductStock = "SELECT * FROM stocks WHERE product_id = $1";
			const productStock = await pg.query(getProductStock, [product_id]);
			const stock = productStock.rows[0];
			const { shop, store } = stock;
			await pg.query(auditQuery, [v4(), product_id, stock_id, shop, store, 'supply', shop, store + quantity, req.user.user_id, now ]);
			// update stock
			const updateStockQuery = "UPDATE stocks SET store = $1, modified_at = $2 WHERE stock_id = $3";
			await pg.query(updateStockQuery, [quantity, now, stock_id]);
		});

		const { invoice_number, amount, products, transaction_date, transaction_type, vendor } = supply;
		const insertSupplyQuery = "INSERT INTO transactions VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";
		let other_info = { vendor };
		other_info = "'" + JSON.stringify(other_info) + "'";
		res.json({ invoice_number, amount, products, transaction_date, transaction_type, vendor });
		// pg.query(insertSupplyQuery, [v4(), transaction_type, invoice_number, transaction_date, req.user.user_id, products, total, now, other_info], (err, result) => {
		// 	err ? res.status(400).json({ statusCode: 0, message: "Unable to complete supply", data: err }) :
		// 		res.status(201).json({ statusCode: 1, message: "Supply completed", data: result.rows });
		// });
	} catch (error) {
		res.status(500).json({ status: 0, data: error });
	}
});


module.exports = router;
