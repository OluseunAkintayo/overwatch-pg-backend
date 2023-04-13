const router = require('express').Router();
const pg = require("../DB");
const { v4 } = require('uuid');
const { checkTokenAdmin, checkToken } = require('../Middleware/CheckToken');

// create new role
router.post("/", checkTokenAdmin, async (req, res) => {
	const query = "INSERT INTO roles VALUES ($1, $2, $3, $4) RETURNING *";
	try {
		pg.query(query, [v4(), req.body.description, new Date().toISOString(), new Date().toISOString()], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error creating user role", data: err })
			: res.status(201).json({ message: "Role created successfully", data: result.rows[0] });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

// get all roles
router.get("/", checkToken, async (req, res) => {
	const query = "SELECT * FROM roles";
	try {
		pg.query(query, (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving roles", data: err })
			: res.status(200).json({ responseCode: 1, message: "Roles retrieved successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

// get specific role
router.get("/:id", checkToken, async (req, res) => {
	const { id } = req.params;
	const query = "SELECT * FROM roles WHERE role_id = $1";
	try {
		pg.query(query, [id], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving role", data: err })
			: res.status(200).json({ responseCode: 1, message: "Role retrieved successfully", data: result.rows[0] });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

router.put("/update/:id", checkTokenAdmin, async (req, res) => {
	const { id } = req.params;
	const { description } = req.body;
	const query = "UPDATE roles SET description = $1, modified_at = NOW()::TIMESTAMP WHERE role_id = $2";
	try {
		pg.query(query, [description, id], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error updating role", data: err })
			: res.status(200).json({ responseCode: 1, message: "Role updated successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

router.delete("/delete/:id", checkTokenAdmin, async (req, res) => {
	const { id } = req.params;
	const query = "DELETE FROM roles WHERE role_id = $1";
	try {
		pg.query(query, [id], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error deleting role", data: err })
			: res.status(200).json({ responseCode: 1, message: "Role deleted successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

module.exports = router;
