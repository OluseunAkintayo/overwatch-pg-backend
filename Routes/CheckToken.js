const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

const { TOKEN_KEY } = process.env;

const check = (req, res, next) => {
	const authToken = req.headers.authorization;
	if(authToken) {
		const token = authToken.split(' ')[1];
		jwt.verify(token, TOKEN_KEY, (err, decodedToken) => {
			if(err) {
				res.status(403).json({ status: 0, message: "Unauthorized access: invalid token" });
			} else {
				if(dayjs(decodedToken.exp) > dayjs()) {
					req.user = decodedToken;
					next();
				} else {
					res.status(401).json({ status: 0, message: "Token expired" });
				}
			}
		});
	} else {
		res.status(401).json({ status: 0, message: "Unauthorized access: token not found" });
	}
}

const checkToken = (req, res, next) => {
	check(req, res, () => {
    if(req.user.user_id === req.params.id || req.user.is_admin) {
      next();
    } else {
      res.status(403).json({ status: 0, message: "Unauthorized access: provided token not valid for specified user or the user is not an admin."	});
    }
  });
}

const checkTokenAdmin = (req, res, next) => {
  checkToken(req, res, () => {
    if(req.user.is_admin) {
      next();
    } else {
      res.status(403).json({ status: 0, message: "Unauthorized access: user is not an admin" });
    }
  });
}

module.exports = { check, checkToken, checkTokenAdmin };
