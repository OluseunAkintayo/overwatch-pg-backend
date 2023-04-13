const router = require('express').Router();
const pg = require('../DB');
const { v4 } = require('uuid');
const { checkTokenAdmin } = require('../Middleware/CheckToken');

router.get("/", checkTokenAdmin, (req, res) => {
	const getAllTransactions = "SELECt * FROM transactions";
	try {
		pg.query(getAllTransactions, (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving transactions", error: err }) :
			res.status(200).json({ responseCode: 1, message: "Transactions retrieved", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ statusCode: 500, message: "Fatal error", error })
	}
});

module.exports = router;
