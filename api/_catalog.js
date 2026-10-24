// Book prices live here, on the server, so the browser can't choose the amount.
// Amounts are in paise (3900 = ₹39).
// Download links are NOT kept in this file because this repository is public.
// They come from the EBOOK_LINKS environment variable in Vercel (see README.md).
const BOOKS = {
  "upi-1":  { name: "Mahaganapathi Pancharatnam", amount: 3900 },
  "upi-2":  { name: "Kalabhairavastakam",          amount: 3900 },
  "upi-3":  { name: "Prahlada Charitra",           amount: 9900 },
  "upi-4":  { name: "Neem Karoli Baba Maharaj Ji", amount: 9900 },
  "upi-5":  { name: "Chandrashekarastakam",        amount: 3900 },
  "upi-6":  { name: "Kaupina Panchakam",           amount: 3900 },
  "upi-7":  { name: "Panchayudha Stotram",         amount: 3900 },
  "upi-8":  { name: "Dakshinamurthy Stotram",      amount: 3900 },
  "upi-9":  { name: "Matru Panchakam",             amount: 3900 },
  "upi-10": { name: "Shatpadi Stotram",            amount: 3900 },
  "upi-11": { name: "Nirvana Shatkam",             amount: 3900 },
  "upi-12": { name: "Siva Tandava Stotram",        amount: 3900 },
  "upi-13": { name: "Sivananda Lahari",            amount: 9900 },
  "upi-14": { name: "Kanaka Dhara Stotram",        amount: 3900 }
};

function downloadLink(bookId) {
  try {
    const links = JSON.parse(process.env.EBOOK_LINKS || "{}");
    return links[bookId] || null;
  } catch (err) {
    console.error("EBOOK_LINKS is not valid JSON:", err);
    return null;
  }
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = { BOOKS, downloadLink, setCors };
