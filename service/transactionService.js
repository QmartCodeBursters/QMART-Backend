const Transaction = require('../models/transactionModel');
const Wallet = require('../models/wallet');

exports.getTransactionHistory = async (userId, role) => {
  const filter = { userId, role };

  if (role === 'merchant') {
    filter.type = 'withdrawal'; // Merchants only see withdrawals
  }

  return Transaction.find(filter).sort({ createdAt: -1 });
};

exports.deposit = async (walletId, amount, userId) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new Error('Wallet not found');

  wallet.balance += amount;
  await wallet.save();

  const transaction = new Transaction({
    userId,
    walletId,
    type: 'deposit',
    amount,
    role: 'customer',
    referenceId: `REF-${Date.now()}`,
  });

  return transaction.save();
};

exports.withdraw = async (walletId, amount, userId, role) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new Error('Wallet not found');

  if (wallet.balance < amount) throw new Error('Insufficient balance');

  wallet.balance -= amount;
  await wallet.save();

  const transaction = new Transaction({
    userId,
    walletId,
    type: 'withdrawal',
    amount,
    role,
    referenceId: `REF-${Date.now()}`,
  });

  return transaction.save();
};
