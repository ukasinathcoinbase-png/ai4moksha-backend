const { razorpay, deliverPaidOrder } = require("./_deliver");

// Razorpay calls this (Dashboard → Settings → Webhooks, event "order.paid")
// after every successful payment, even if the buyer never returned to the site.
// It does not trust the message itself: it only uses the order id from it, and
// then asks Razorpay's API whether that order is really paid before emailing.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const orderEntity = body.payload && body.payload.order && body.payload.order.entity;
    const paymentEntity = body.payload && body.payload.payment && body.payload.payment.entity;
    const orderId = (orderEntity && orderEntity.id) || (paymentEntity && paymentEntity.order_id);

    if (typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId)) {
      return res.status(200).json({ ignored: true });
    }

    const instance = razorpay();
    const order = await instance.orders.fetch(orderId);
    if (order.status !== "paid") {
      return res.status(200).json({ paid: false });
    }
    await deliverPaidOrder(instance, order, paymentEntity && paymentEntity.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook failed:", err);
    // 200 so Razorpay does not keep retrying a broken message forever.
    return res.status(200).json({ ok: false });
  }
};
