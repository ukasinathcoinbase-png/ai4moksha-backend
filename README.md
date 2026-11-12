# ai4moksha-backend

Vercel functions for the Ai4Moksha ebook checkout.

- `api/create-order.js` creates a Razorpay order. The site sends only the book id (for example `upi-3`); the price comes from `api/_catalog.js`.
- `api/order-status.js` lets the site ask again, when the buyer comes back from their UPI app, whether the order is paid; if so it returns the link.
- `api/razorpay-webhook.js` is called by Razorpay after every payment, so the link is emailed even if the buyer never comes back to the site.
- `api/verify-payment.js` checks Razorpay's payment signature and, only if it is valid, returns that book's download link and emails it to the buyer.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay key id (already set) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (already set) |
| `BREVO_API_KEY` | API key from Brevo (brevo.com → SMTP & API → API Keys) |
| `EMAIL_FROM` | The sender address verified in Brevo, for example `ai4moksha@gmail.com` |
| `EBOOK_LINKS` | JSON map of book id to download link, for example `{"upi-1":"https://drive.google.com/...","upi-2":"..."}` |

Download links are kept in `EBOOK_LINKS` and not in the code, because this repository is public.

To change a price, edit `api/_catalog.js` and update the price shown on the site to match.

If `BREVO_API_KEY` or `EMAIL_FROM` is missing, no email is sent, but the buyer still sees the download link on screen.

## Razorpay webhook (one-time setup)

Razorpay Dashboard → Account & Settings → Webhooks → Add New Webhook:

- Webhook URL: `https://ai4moksha-backend.vercel.app/api/razorpay-webhook`
- Secret: any word (the backend does not rely on it; it re-checks every order with Razorpay's API)
- Active events: tick `order.paid`

Every sale also sends a "New sale" email to `EMAIL_FROM`, so you can help any buyer by hand.
