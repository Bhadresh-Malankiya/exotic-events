import { PDFDocument, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { get } from "@vercel/blob";
import { totals, type BusinessDocument } from "./schema";
export function upiLink(doc: BusinessDocument) {
  if (
    !doc.business.upiId ||
    !doc.business.payeeName ||
    doc.kind !== "invoice" ||
    totals(doc).balance <= 0
  )
    return "";
  return (
    "upi://pay?" +
    new URLSearchParams({
      pa: doc.business.upiId,
      pn: doc.business.payeeName,
      am: totals(doc).balance.toFixed(2),
      cu: "INR",
      tn: doc.number,
    }).toString()
  );
}
export async function qrBytes(doc: BusinessDocument) {
  const link = upiLink(doc);
  if (link)
    return QRCode.toBuffer(link, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
    });
  if (
    !doc.business.qrImage ||
    doc.kind !== "invoice" ||
    totals(doc).balance <= 0
  )
    return null;
  const source = doc.business.qrImage;
  let bytes: Buffer;
  if (/^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(source)) {
    const blob = await get(source.slice(5), { access: "private" });
    if (!blob) return null;
    bytes = Buffer.from(await new Response(blob.stream).arrayBuffer());
  } else if (
    /^\/assets\/[a-zA-Z0-9/_.-]+$/.test(source) &&
    !source.includes("..")
  )
    bytes = await readFile(path.join(process.cwd(), "public", source));
  else return null;
  return sharp(bytes).png().toBuffer();
}
export async function makePdf(doc: BusinessDocument) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "public/fonts/NotoSans-Regular.ttf"),
    ),
    { subset: true },
  );
  pdf.setTitle(doc.number + " · " + doc.clientName);
  pdf.setAuthor(doc.business.businessName);
  let page!: PDFPage,
    y = 0;
  const dark = rgb(0.12, 0.2, 0.17),
    muted = rgb(0.4, 0.45, 0.43),
    line = rgb(0.85, 0.88, 0.85);
  const W = 595,
    H = 842,
    M = 42;
  const money = (n: number) =>
    "INR " +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const text = (s: string, x: number, yy: number, size = 10, color = dark) =>
    page.drawText(s, { x, y: yy, size, font, color });
  function lines(s: string, width: number, size: number, f: PDFFont = font) {
    const out: string[] = [];
    for (const paragraph of s.split("\n")) {
      let row = "";
      for (const word of paragraph.split(/\s+/)) {
        if (
          f.widthOfTextAtSize(row + (row ? " " : "") + word, size) > width &&
          row
        ) {
          out.push(row);
          row = "";
        }
        if (f.widthOfTextAtSize(word, size) > width) {
          for (const ch of word) {
            if (f.widthOfTextAtSize(row + ch, size) > width) {
              out.push(row);
              row = "";
            }
            row += ch;
          }
        } else row += (row ? " " : "") + word;
      }
      out.push(row);
    }
    return out;
  }
  function newPage() {
    page = pdf.addPage([W, H]);
    y = H - 48;
    text(doc.business.businessName, M, y, 15);
    text(doc.number, W - 210, y, 10, muted);
    page.drawLine({
      start: { x: M, y: y - 16 },
      end: { x: W - M, y: y - 16 },
      thickness: 1,
      color: line,
    });
    y -= 48;
  }
  function room(h: number) {
    if (y - h < 65) newPage();
  }
  function para(s: string, width = W - M * 2, size = 10, color = dark, x = M) {
    for (const l of lines(s, width, size)) {
      room(size * 1.55);
      text(l, x, y, size, color);
      y -= size * 1.55;
    }
  }
  newPage();
  para(doc.kind === "quotation" ? "QUOTATION" : "INVOICE", W - 2 * M, 25);
  para(doc.status.toUpperCase(), W - 2 * M, 9, muted);
  y -= 10;
  para(doc.business.address, 350, 9, muted);
  para(
    [doc.business.phone, doc.business.email].filter(Boolean).join(" · "),
    W - 2 * M,
    9,
    muted,
  );
  if (doc.business.taxId)
    para("Business tax ID: " + doc.business.taxId, W - 2 * M, 9, muted);
  y -= 18;
  para("PREPARED FOR", W - 2 * M, 8, muted);
  para(doc.clientName, W - 2 * M, 15);
  para(
    [doc.clientEmail, doc.clientPhone].filter(Boolean).join(" · "),
    W - 2 * M,
    10,
  );
  if (doc.clientAddress) para(doc.clientAddress, W - 2 * M, 10);
  y -= 10;
  para(doc.event, W - 2 * M, 12);
  para(
    `Created: ${doc.createdAt.slice(0, 10)}${doc.eventDate ? "  |  Event: " + doc.eventDate : ""}${doc.dueDate ? "  |  " + (doc.kind === "quotation" ? "Valid until: " : "Due: ") + doc.dueDate : ""}`,
    W - 2 * M,
    9,
    muted,
  );
  y -= 20;
  function tableHeader() {
    room(45);
    page.drawRectangle({
      x: M,
      y: y - 9,
      width: W - 2 * M,
      height: 27,
      color: rgb(0.94, 0.96, 0.94),
    });
    text("ITEM / OPTION", M + 8, y, 8);
    text("QTY", 338, y, 8);
    text("RATE", 394, y, 8);
    text("AMOUNT", 480, y, 8);
    y -= 30;
  }
  tableHeader();
  for (const item of doc.lines) {
    const copy = [item.name, item.variant, item.description]
      .filter(Boolean)
      .join(" · ");
    const chunks = lines(copy, 272, 10);
    if (y - (chunks.length * 15 + 18) < 65) {
      newPage();
      tableHeader();
    }
    text(String(item.quantity), 338, y, 9);
    text(
      money(item.rate),
      468 - font.widthOfTextAtSize(money(item.rate), 8),
      y,
      8,
    );
    const amount = money(Math.round(item.quantity * item.rate * 100) / 100);
    const amountSize = Math.min(8, 73 / font.widthOfTextAtSize(amount, 1));
    text(
      amount,
      W - M - font.widthOfTextAtSize(amount, amountSize),
      y,
      amountSize,
    );
    for (const l of chunks) {
      room(17);
      text(l, M + 8, y, 10);
      y -= 15;
    }
    if (item.unit) {
      room(15);
      text(item.unit, M + 8, y, 8, muted);
      y -= 13;
    }
    page.drawLine({
      start: { x: M, y: y - 1 },
      end: { x: W - M, y: y - 1 },
      thickness: 0.5,
      color: line,
    });
    y -= 18;
  }
  const t = totals(doc);
  room(150);
  y -= 10;
  for (const [label, amount] of [
    ["Subtotal", t.subtotal],
    ["Discount", -t.discount],
    [`Tax (${doc.taxRate}%)`, t.tax],
    ["Total", t.total],
    ...(doc.kind === "invoice"
      ? [
          ["Paid", t.paid],
          ["Balance due", t.balance],
        ]
      : []),
  ] as [string, number][]) {
    text(label, 325, y, 10);
    text(
      money(amount),
      W - M - font.widthOfTextAtSize(money(amount), 10),
      y,
      10,
    );
    y -= 23;
  }
  if (doc.approvedAt) {
    y -= 8;
    para(
      `${doc.status === "declined" ? "Declined" : "Approved"} by ${doc.approvedBy} on ${doc.approvedAt.slice(0, 10)}`,
      W - 2 * M,
      9,
      muted,
    );
  }
  if (doc.payments.length) {
    y -= 15;
    para("PAYMENT RECORD", W - 2 * M, 10);
    for (const p of doc.payments)
      para(
        `${p.date} · ${p.method} · ${money(p.amount)} · ${p.reference}`,
        W - 2 * M,
        9,
        muted,
      );
  }
  if (doc.notes) {
    y -= 15;
    room(40);
    para("NOTES", W - 2 * M, 9);
    para(doc.notes, W - 2 * M, 9, muted);
  }
  if (doc.terms) {
    y -= 15;
    room(40);
    para("TERMS & INCLUSIONS", W - 2 * M, 9);
    para(doc.terms, W - 2 * M, 9, muted);
  }
  if (doc.kind === "invoice" && t.balance > 0) {
    const qr = await qrBytes(doc);
    room(qr ? 190 : 40);
    y -= 15;
    if (qr) {
      const img = await pdf.embedPng(qr);
      page.drawImage(img, { x: M, y: y - 130, width: 130, height: 130 });
      text("PAY BY UPI", 205, y - 8, 12);
      text(
        doc.business.payeeName || doc.business.businessName,
        205,
        y - 30,
        10,
      );
      text(doc.business.upiId || "Scan using your UPI app", 205, y - 48, 9);
      text("Amount due: " + money(t.balance), 205, y - 69, 11);
      y -= 150;
    }
    para(doc.business.paymentNote, W - 2 * M, 9, muted);
  }
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(`${doc.number}   |   Page ${i + 1} of ${pages.length}`, {
      x: M,
      y: 30,
      size: 8,
      font,
      color: muted,
    });
  }
  return pdf.save();
}
