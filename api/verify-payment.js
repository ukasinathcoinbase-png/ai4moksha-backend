const crypto = require("crypto");
const Razorpay = require("razorpay");
const { BOOKS, downloadLink, setCors } = require("./_catalog");
const { sendDownloadEmail } = require("./_email");

// Called by the site after Razorpay checkout succeeds.
// Returns the download link only if Razorpay's signature proves the payment is real.
module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details." });
    }

    // Razorpay signs "order_id|payment_id" with your key secret.
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const valid =
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

    if (!valid) {
      return res.status(400).json({ error: "Payment could not be verified." });
    }

    // Look up which book this order was for, and check the full price was set.
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await instance.orders.fetch(razorpay_order_id);
    const bookId = order.notes && order.notes.book;
    const item = BOOKS[bookId];

    if (!item || order.amount < item.amount) {
      return res.status(400).json({ error: "Order does not match a book." });
    }

    const link = downloadLink(bookId);
    if (!link) {
      console.error("No download link configured for", bookId);
      return res.status(500).json({ error: "Download link not set up yet. Please email ai4moksha@gmail.com with your payment id." });
    }

    // Email the link to the address the buyer gave on the site, or to Razorpay at checkout.
    let emailed = false;
    try {
      let to = order.notes && order.notes.email;
      if (!to) {
        const payment = await instance.payments.fetch(razorpay_payment_id);
        to = payment.email;
      }
      emailed = await sendDownloadEmail(to, item.name, link);
    } catch (err) {
      console.error("Could not look up buyer email:", err);
    }

    return res.status(200).json({ name: item.name, link: link, emailed: emailed });
  } catch (err) {
    console.error("Payment verification failed:", err);
    return res.status(500).json({ error: "Could not verify payment" });
  }
};
