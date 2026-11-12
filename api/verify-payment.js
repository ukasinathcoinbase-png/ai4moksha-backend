const crypto = require("crypto");
const { setCors } = require("./_catalog");
const { razorpay, deliverPaidOrder } = require("./_deliver");

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

    const instance = razorpay();
    const order = await instance.orders.fetch(razorpay_order_id);
    const result = await deliverPaidOrder(instance, order, razorpay_payment_id);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(200).json({ name: result.item.name, link: result.link });
  } catch (err) {
    console.error("Payment verification failed:", err);
    return res.status(500).json({ error: "Could not verify payment" });
  }
};
