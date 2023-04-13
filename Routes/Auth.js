const router = require('express').Router();
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const pg = require('../DB');
const dayjs = require('dayjs');

const { ENCRYPTION_KEY, TOKEN_KEY } = process.env;

router.post('/login', async(req, res) => {
	const findUserQuery = "SELECT * FROM users WHERE username = $1";
	let user = await pg.query(findUserQuery, [req.body.username]);
	user = user.rows[0];
	try {
		if(user) {
			if(user.is_active) {
				let password = CryptoJS.AES.decrypt(user.passcode, ENCRYPTION_KEY);
				password = password.toString(CryptoJS.enc.Utf8);
				if(password === req.body.passcode) {
					const { passcode, is_active, created_at, modified_at, ...userProps  } = user;
					const token = jwt.sign(
						{
							user_id: user.user_id,
							is_cashier: user.is_cashier,
							is_admin: user.is_admin,
							exp: Date.parse(dayjs().add(1, 'd'))
						},
						TOKEN_KEY,
						{ algorithm: 'HS512' }
						// { expiresIn: 30 }
					);
					const tokenExpiryDate = dayjs().add(1, 'd').toISOString();
					res.status(200).json({ status: 1, message: "Login successful", data: { user: userProps, token, tokenExpiryDate } });
				} else {
					res.status(302).json({ status: 0, message: "Incorrect password" });
				} 
			} else {
				res.status(200).json({ status: 0, message: "User is inactive, please contact admin." });
			}
		} else {
			res.status(200).json({ status: 0, message: "Incorrect username." });
		}
	} catch (error) {
		console.log(error);
		let err = new Error(error);
		res.status(500).json({ status: 0, message: "Error signing in!", data: err });
	}
});

module.exports = router;
