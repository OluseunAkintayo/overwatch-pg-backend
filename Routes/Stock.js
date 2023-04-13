const router = require('express').Router();
const pg = require('../DB');
const { v4 } = require('uuid');
const { checkTokenAdmin, checkToken } = require('../Middleware/CheckToken');
const StockSchema = require('../Schema').StockSchema;

const validate = (schema) => async (req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}


router.post("/product/:id", checkTokenAdmin, validate(StockSchema), (req, res) => {
	const { } = req.body;
	const newStockQuery = "INSERT INTO stocks VALUES ($1, $2, $3)";
	const updateProductQuery = "UPDATE products SET stock_id = $1 WHERE product_id = $2";

	try {
		pg.query(query, [], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error updating user", data: err })
				: res.status(200).json({ responseCode: 1, message: "User updated successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});


module.exports = router;
