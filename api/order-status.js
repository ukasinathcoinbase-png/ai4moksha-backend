const { setCors } = require("./_catalog");
const { razorpay, deliverPaidOrder } = require("./_deliver");

// The site calls this when the buyer comes back from their UPI app (or reopens
// the page) and the checkout never reported back. It asks Razorpay directly
// whether the order is paid, and if so returns the download link.
module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order_id } = req.body || {};
    if (typeof order_id !== "string" || !/^order_[A-Za-z0-9]+$/.test(order_id)) {
      return res.status(400).json({ error: "Missing order id." });
    }

    const instance = razorpay();
    const order = await instance.orders.fetch(order_id);
    if (order.status !== "paid") {
      return res.status(200).json({ paid: false });
    }

    let paymentId = null;
    try {
      const payments = await instance.orders.fetchPayments(order_id);
      const captured = (payments.items || []).find(function (p) { return p.status === "captured"; });
      paymentId = captured ? captured.id : null;
    } catch (err) {
      console.error("Could not list order payments:", err);
    }

    const result = await deliverPaidOrder(instance, order, paymentId);
    if (result.error) {
      return res.status(result.status).json({ paid: true, error: result.error, payment_id: paymentId });
    }
    return res.status(200).json({ paid: true, name: result.item.name, link: result.link });
  } catch (err) {
    console.error("Order status check failed:", err);
    return res.status(500).json({ error: "Could not check order" });
  }
};
