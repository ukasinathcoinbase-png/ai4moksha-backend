# ai4moksha-backend

Vercel functions for the Ai4Moksha ebook checkout.

- `api/create-order.js` creates a Razorpay order. The site sends only the book id (for example `upi-3`); the price comes from `api/_catalog.js`.
- `api/verify-payment.js` checks Razorpay's payment signature and, only if it is valid, returns that book's download link and emails it to the buyer.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay key id (already set) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (already set) |
| `GMAIL_USER` | The Gmail address the download emails are sent from, for example `ai4moksha@gmail.com` |
| `GMAIL_APP_PASSWORD` | A Gmail app password for that account (not your normal password) |
| `EBOOK_LINKS` | JSON map of book id to download link, for example `{"upi-1":"https://drive.google.com/...","upi-2":"..."}` |

Download links are kept in `EBOOK_LINKS` and not in the code, because this repository is public.

To change a price, edit `api/_catalog.js` and update the price shown on the site to match.

If `GMAIL_USER` or `GMAIL_APP_PASSWORD` is missing, no email is sent, but the buyer still sees the download link on screen.
