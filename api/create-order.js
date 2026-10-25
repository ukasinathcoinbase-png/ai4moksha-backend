const Razorpay = require("razorpay");
const { BOOKS, setCors } = require("./_catalog");

module.exports = async (req, res) => {
  // Allow your GitHub Pages site to call this endpoint
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { book, email } = req.body || {};
    const item = BOOKS[book];

    if (!item) {
      return res.status(400).json({ error: "Unknown book." });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // The price comes from the catalog, never from the browser.
    // The book id is saved on the order so verify-payment knows what was bought.
    const order = await instance.orders.create({
      amount: item.amount,
      currency: "INR",
      receipt: "ai4moksha_" + Date.now(),
      // The buyer's email (asked on the site) is kept so verify-payment can send the link.
      notes: { book: book, email: typeof email === "string" ? email.slice(0, 200) : "" },
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
};
