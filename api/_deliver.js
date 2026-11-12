const Razorpay = require("razorpay");
const { BOOKS, downloadLink } = require("./_catalog");
const { sendDownloadEmail, sendSaleNotice } = require("./_email");

function razorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Razorpay puts this placeholder on payments where it did not ask for an email.
function realEmail(address) {
  return typeof address === "string" && address.includes("@") && !/@razorpay\.com$/i.test(address)
    ? address
    : "";
}

// Given an order that Razorpay itself says is paid, find the book and its link,
// and send the emails once. Every caller (the browser after checkout, the page
// checking again when the buyer comes back, and Razorpay's webhook) ends up here,
// so a buyer gets the book even if the payment app never returned to the site.
// Returns { item, link } or { error, status }.
async function deliverPaidOrder(instance, order, paymentId) {
  const bookId = order.notes && order.notes.book;
  const item = BOOKS[bookId];
  if (!item || order.amount < item.amount) {
    return { status: 400, error: "Order does not match a book." };
  }

  const link = downloadLink(bookId);

  // Send the emails only the first time this order is delivered.
  if (!(order.notes && order.notes.delivered)) {
    let buyer = realEmail(order.notes && order.notes.email);
    if (!buyer && paymentId) {
      try {
        const payment = await instance.payments.fetch(paymentId);
        buyer = realEmail(payment.email);
      } catch (err) {
        console.error("Could not look up buyer email:", err);
      }
    }
    try {
      // Mark first, so two callers at the same moment don't both send.
      await instance.orders.edit(order.id, { notes: Object.assign({}, order.notes, { delivered: "yes" }) });
    } catch (err) {
      console.error("Could not mark order delivered:", err);
    }
    if (link) await sendDownloadEmail(buyer, item.name, link);
    await sendSaleNotice({ book: item.name, orderId: order.id, paymentId: paymentId, buyer: buyer, linkMissing: !link });
  }

  if (!link) {
    console.error("No download link configured for", bookId);
    return { status: 500, error: "Download link not set up yet. Please email ai4moksha@gmail.com with your payment id." };
  }
  return { item: item, link: link };
}

module.exports = { razorpay, deliverPaidOrder };
