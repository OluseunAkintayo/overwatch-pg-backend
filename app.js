require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const app = express();

// routes
const UsersRoute = require('./Routes/Users');
const ProductsRoute = require('./Routes/Products');
const TransactionsRoute = require('./Routes/Transactions');
const StoreRoute = require('./Routes/Store');
const Roles = require("./Routes/Roles");
const Auth = require("./Routes/Auth");
const { v4 } = require('uuid');

console.log(v4())
console.log(new Date('2023-04-10').toISOString())

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v2/users", UsersRoute);
app.use("/api/v2/products", ProductsRoute);
app.use("/api/v2/store", StoreRoute);
app.use("/api/v2/transactions", TransactionsRoute);
app.use("/api/v2/roles", Roles);
app.use("/api/v2/auth", Auth);

app.get("/api", (req, res) => {
  res.json({ status: 200, message: "API works!" });
});

app.listen(process.env.PORT || 4000, () => console.log("server started on " + process.env.PORT));
