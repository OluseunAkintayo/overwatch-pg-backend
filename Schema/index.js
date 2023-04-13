const yup = require("yup");

const UserSchema = yup.object({
  name: yup.string().required("First name is required"),
  username: yup.string().required("Username is required"),
  passcode: yup.string().required("Password is required"),
  email: yup.string().required("Password is required"),
  is_cashier: yup.boolean().required(),
  is_admin: yup.boolean().required(),
  is_active: yup.boolean().required(),
});

const ProductSchema = yup.object({
  name: yup.string().required("Product name is required"),
  cost: yup.string().required("Product cost is required"),
  price: yup.string().required("Product price is required"),
  stock_id: yup.string(),
  in_stock: yup.boolean().required("Required"),
  is_active: yup.boolean().required("Required"),
});

const StockSchema = yup.object({
  shop: yup.number(),
  store: yup.number(),
  product_id: yup.string().required("Product ID is required"),
});

const TransactionSchema = yup.object({
  transaction_id: yup.string(),
  created_at: yup.string().required(),
  invoice_number: yup.string().required("Invoice number is required"),
  amount: yup.number(),
  products: yup.array().min(1, "At least one product should be supplied"),
  supply_date: yup.string().required("Supply date is required"),
  vendor: yup.string().required("Vendor is required")
});

const AuditSchema = yup.object({
  product_id: yup.string().required(),
	stock_id: yup.string().required(),
	transaction_type: yup.string().required(),
	prev_shop_qty: yup.number().required(),
	prev_store_qty: yup.number().required(),
	current_shop_qty: yup.number().required(),
	current_store_qty: yup.number().required(),
  transaction_date: yup.string().required()
});


module.exports = {
  UserSchema,
  ProductSchema,
  StockSchema,
  TransactionSchema,
  AuditSchema
};
