const express = require("express");
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/customertransactionHistory", authMiddleware, transactionController.handleTransaction);


router.get("/merchanttransactionHistory", authMiddleware, transactionController.getTransactionHistory);

module.exports = router;

