const router = require('express').Router();
const pg = require('../DB');
const { UserSchema } = require('../Schema');
const CryptoJS = require('crypto-js');
const { v4 } = require('uuid');

const { ENCRYPTION_KEY } = process.env;

const validate = (schema) => async (req, res, next) => {
	try {
		await schema.validate(req.body);
		return next();
	} catch (error) {
		res.status(400).json({ status: 0, type: error.name, message: error.message });
	}
}

// retrieve users
router.get("/", async (_req, res) => {
	const query = "SELECT * FROM users";
	try {
		pg.query(query, (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error retrieving users", data: err })
				: res.status(200).json({ responseCode: 1, message: "Users retrieved successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

// new user
router.post("/new-user", validate(UserSchema), async (req, res) => {
	const { name, username, passcode, email, is_cashier, is_admin, is_active } = req.body;
	const hashedPassword = CryptoJS.AES.encrypt(passcode, ENCRYPTION_KEY).toString();
	const query = "INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
	try {
		pg.query(query, [v4(), name, username, hashedPassword, email, is_cashier, is_admin, is_active, new Date().toISOString(), new Date().toISOString()], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error creating user", data: err })
				: res.status(200).json({ responseCode: 1, message: "User created successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

// update user
router.put("/update/:id", async (req, res) => {
	const { id } = req.params;
	const { name, email, is_cashier, is_active, is_admin } = req.body;
	// console.log(roles);
	const query = `UPDATE users SET name = $1, email = $2, is_cashier = $3, is_active = $4, is_admin = $5, modified_at = NOW()::TIMESTAMP WHERE user_id = $6`;
	// console.log(query);
	try {
		pg.query(query, [name, email, is_cashier, is_active, is_admin, id], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error updating user", data: err })
				: res.status(200).json({ responseCode: 1, message: "User updated successfully", data: result.rows });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

// delete user
router.delete("/delete/:id", async (req, res) => {
	const { id } = req.params;
	const query = "DELETE FROM users WHERE user_id = $1";
	try {
		pg.query(query, [id], (err, result) => {
			err ? res.status(400).json({ responseCode: 0, message: "Error deleting user", data: err })
				: res.status(200).json({ responseCode: 1, message: "User deleted successfully" });
		});
	} catch (error) {
		res.status(500).json({ responseCode: 500, message: "Server error", data: error });
		throw error;
	}
});

module.exports = router;
