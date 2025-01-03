const transporter = require('../config/emailConfig');

const sendOtpEmail = async (recipient, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: 'Qmart OTP Verification',
    text: `Your OTP for Qmart is ${otp.toString()}. It is valid for 10 minutes.`,
    html: `<p>Your OTP for Qmart is <strong>${otp}</strong>.</p><p>It is valid for <strong>10 minutes</strong>.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw new Error("Failed to send OTP.");
  }
};

const sendEmail = async (to, subject, text)=>{
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = {
  sendOtpEmail,
  sendEmail
};
