const nodemailer = require("nodemailer");

// Emails the buyer their download link, sent from your Gmail account.
// Needs GMAIL_USER and GMAIL_APP_PASSWORD in Vercel (see README.md).
// If they are not set, or sending fails, the buyer still gets the link on screen.
async function sendDownloadEmail(to, bookName, link) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !to) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: '"AI4Moksha" <' + process.env.GMAIL_USER + ">",
      to: to,
      subject: "Your eBook: " + bookName,
      text:
        "Namaste,\n\n" +
        "Thank you for buying “" + bookName + "” from AI4Moksha.\n\n" +
        "Download your eBook here:\n" + link + "\n\n" +
        "Keep this email so you can download it again later.\n" +
        "If you have any trouble, just reply to this email.\n\n" +
        "AI4Moksha\nhttps://ukasinathcoinbase-png.github.io/ai4moksha/",
    });
    return true;
  } catch (err) {
    console.error("Could not send download email:", err);
    return false;
  }
}

module.exports = { sendDownloadEmail };
