const router = require('express').Router();
const pg = require("../DB");
const { v4 } = require('uuid');
const { checkTokenAdmin } = require('./CheckToken');

const now = new Date().toISOString();

// new product
router.post("/", checkTokenAdmin, async (req, res) => {
	const { name, cost, price, department_id, brand_id, is_active, in_stock } = req.body;
	const query = "INSERT INTO products VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *";
	try {
		pg.query(query, [v4(), name, cost, price, department_id, brand_id, is_active, in_stock, now, now, req.user.user_id], (err, result) => {
			if(err) {
				res.status(400).json({ responseCode: 0, message: "Error creating product", data: err })
			} else if (result) {
				let productId = result.rows[0]?.product_id;
				const createStockQuery = "INSERT into stocks VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
				pg.query(createStockQuery, [v4(), 0, 0, productId, now, now, req.user.user_id], async (err, createStockResult) => {
					if(err) {
						await pg.query("DELETE FROM products WHERE product_id = $1", [productId]);
						res.status(400).json({ responseCode: 0, message: "Error creating product stock", data: err })
					} else if(createStockResult) {
						pg.query("SELECT * FROM products WHERE product_id = $1", [productId], (err, finalProductResult) => {
							if(err) {
								res.status(400).json({ responseCode: 0, message: "Error retrieving product", data: err })
							} else if(finalProductResult) {
								res.status(201).json({ message: "Product created successfully", data: finalProductResult.rows[0] });
							}
						});
					}
				});
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
	}
});


// get all products
router.get("/", async (req, res) => {
	const query = "SELECT * FROM products";
	try {
		pg.query(query, (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving products", data: err })
			: res.status(200).json({ responseCode: 1, message: "Products retrieved successfully", data: result.rows, count: result.rows?.length });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});


// get single product
router.get("/item/:id", async (req, res) => {
	const { id } = req.params;
	const query = "SELECT * FROM products WHERE product_id = $1";
	try {
		pg.query(query, [id], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving product", data: err })
			: res.status(200).json({ message: "Product retrieved successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});


// edit product
router.put("/update/:id", async (req, res) => {
	const { id } = req.params;
	const { name, cost, price, department_id, brand_id, is_active, in_stock } = req.body;
	const query = "UPDATE products SET name = $1, cost = $2, price = $3, department_id = $4, brand_id = $5, is_active = $6, in_stock = $7, modified_at = NOW()::TIMESTAMP WHERE product_id = $8 RETURNING *";

	try {
		pg.query(query, [name, cost, price, department_id, brand_id, is_active, in_stock, id], async (err, result) => {
			if(err) {
				res.status(400).json({ responseCode: 0, message: "Error updating product", data: err })
			} else if(result) {
				res.status(200).json({ message: "Product updated successfully", data: result.rows[0] });
			}
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});


// get all product brands
router.get("/brands", async (req, res) => {
	const query = "SELECT brand_id, description, marked_for_deletion, username AS created_by, brands.created_at, brands.modified_at FROM brands LEFT JOIN users ON users.user_id = brands.created_by ORDER BY brands.description ASC";
	try {
		pg.query(query, (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving product brands", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product brands retrieved successfully", data: result.rows, count: result.rows?.length });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});


// create new product brand
router.post("/brands", checkTokenAdmin, async(req, res) => {
	const query = "INSERT INTO brands VALUES ($1, $2, $3, $4, $5) RETURNING *";
	const { description } = req.body;
	pg.query(query, [v4(), description, now, now, req.user.user_id], (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error creating product brands", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product brand created successfully", data: result.rows[0] });
	});
});

// edit brand
router.put("/brands/update/:id", checkTokenAdmin, async(req, res) => {
	const { id } = req.params;
	const { description, marked_for_deletion } = req.body;
	const query = "UPDATE brands SET description = $1, marked_for_deletion = $2, modified_at = $3 WHERE brand_id = $4 RETURNING *";
	pg.query(query, [description, marked_for_deletion, now, id], (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error updating product brand", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product brand updated successfully", data: result.rows[0] });
	});
});

// mark brand for deletion
router.put("/brands/delete/:id", checkTokenAdmin, async(req, res) => {
	const query = "UPDATE brands SET marked_for_deletion = $1, modified_at = $2 WHERE brand_id = $3";
	const { id } = req.params;
	pg.query(query, [true, now, id], (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error deleting product brand", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product brand deleted successfully", data: result.rows[0] });
	});
});


// get all product departments
router.get("/department", checkTokenAdmin, async (req, res) => {
	const query = "SELECT department_id, description, marked_for_deletion, username AS created_by, department.created_at, department.modified_at FROM department LEFT JOIN users ON users.user_id = department.created_by ORDER BY department.description ASC";
	try {
		pg.query(query, (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving product class", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product class retrieved successfully", data: result.rows, count: result.rows?.length });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

// create new product brand
router.post("/department", checkTokenAdmin, async(req, res) => {
	const query = "INSERT INTO department VALUES ($1, $2, $3, $4, $5) RETURNING *";
	const { description } = req.body;
	pg.query(query, [v4(), description, now, now, req.user.user_id], (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error creating product class", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product class created successfully", data: result.rows[0] });
	});
});

// edit brand
router.put("/department/update/:id", checkTokenAdmin, async(req, res) => {
	const { id } = req.params;
	const { description, marked_for_deletion } = req.body;
	const query = "UPDATE department SET description = $1, marked_for_deletion = $2, modified_at = $3 WHERE department_id = $4 RETURNING *";
	pg.query(query, [description, marked_for_deletion, now, id], (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error updating product class", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product class updated successfully", data: result.rows[0] });
	});
});

// mark brand for deletion
router.put("/department/delete/:id", checkTokenAdmin, async(req, res) => {
	const query = "UPDATE department SET marked_for_deletion = $1, modified_at = $2 WHERE department_id = $3 RETURNING *";
	const { id } = req.params;
	pg.query(query, [true, now, id], (err, result) => {
		err ? res.status(400).json({ responseCode: 0, message: "Error deleting product class", data: err })
			: res.status(200).json({ responseCode: 1, message: "Product class deleted successfully", data: result.rows[0] });
	});
});


module.exports = router;