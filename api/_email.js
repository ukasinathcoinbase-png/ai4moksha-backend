// Emails the buyer their download link through Brevo (brevo.com).
// Needs BREVO_API_KEY and EMAIL_FROM in Vercel (see README.md).
// If they are not set, or sending fails, the buyer still gets the link on screen.
async function sendDownloadEmail(to, bookName, link) {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM || !to) {
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "AI4Moksha", email: process.env.EMAIL_FROM },
        replyTo: { email: process.env.EMAIL_FROM },
        to: [{ email: to }],
        subject: "Your eBook: " + bookName,
        textContent:
          "Namaste,\n\n" +
          "Thank you for buying “" + bookName + "” from AI4Moksha.\n\n" +
          "Download your eBook here:\n" + link + "\n\n" +
          "Keep this email so you can download it again later.\n" +
          "If you have any trouble, just reply to this email.\n\n" +
          "AI4Moksha\nhttps://ukasinathcoinbase-png.github.io/ai4moksha/",
      }),
    });

    if (!response.ok) {
      console.error("Brevo refused the download email:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Could not send download email:", err);
    return false;
  }
}

module.exports = { sendDownloadEmail };
