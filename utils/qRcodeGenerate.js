const QRCode = require('qrcode');

const generateQRCode = async (merchantAccountNumber, amount, cashAmount, pin, businessName) => {
  const data = {
    merchantAccountNumber,
    amount,
    cashAmount,
    pin,
    businessName,
  };

  try {
    const qrCodeData = await QRCode.toDataURL(JSON.stringify(data)); // Generates a data URL for the QR code image
    return qrCodeData;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw new Error('Could not generate QR Code');
  }
};

module.exports = { generateQRCode };
