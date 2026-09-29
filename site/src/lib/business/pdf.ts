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
  const logo = await pdf.embedPng(
    await sharp(
      await readFile(
        path.join(
          process.cwd(),
          "public/assets/exotic/logos/logo-transparent-native.png",
        ),
      ),
    )
      .resize({ width: 420 })
      .png()
      .toBuffer(),
  );
  const qr = await qrBytes(doc),
    qrImage = qr ? await pdf.embedPng(qr) : null;
  pdf.setTitle(`${doc.number} · ${doc.clientName}`);
  pdf.setAuthor(doc.business.businessName);
  const W = 595.28,
    H = 841.89,
    M = 36,
    R = W - M;
  const ink = rgb(0.12, 0.12, 0.11),
    muted = rgb(0.38, 0.37, 0.34),
    gold = rgb(0.59, 0.43, 0.17),
    pale = rgb(0.97, 0.95, 0.9),
    rule = rgb(0.86, 0.83, 0.76),
    white = rgb(1, 1, 1);
  let page!: PDFPage;
  let y = 0;
  const money = (n: number) =>
    "₹ " +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const text = (s: string, x: number, yy: number, size = 9, color = ink) =>
    page.drawText(s, { x, y: yy, size, font, color });
  const right = (s: string, x: number, yy: number, size = 9, color = ink) =>
    text(s, x - font.widthOfTextAtSize(s, size), yy, size, color);
  function lines(s: string, width: number, size = 9, f: PDFFont = font) {
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
    page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: gold });
    page.drawRectangle({ x: 0, y: H - 104, width: W, height: 98, color: ink });
    const dims = logo.scaleToFit(123, 70);
    page.drawImage(logo, {
      x: M,
      y: H - 89,
      width: dims.width,
      height: dims.height,
    });
    right(
      doc.kind === "quotation" ? "QUOTATION" : "INVOICE",
      R,
      H - 43,
      23,
      white,
    );
    right(doc.number, R, H - 64, 10, rgb(0.9, 0.77, 0.5));
    right(
      doc.status === "issued" && totals(doc).balance === 0
        ? "PAID"
        : doc.status.toUpperCase(),
      R,
      H - 82,
      8,
      white,
    );
    y = H - 125;
  }
  function room(h: number) {
    if (y - h < 65) newPage();
  }
  function para(s: string, width = R - M, size = 8, color = muted, x = M) {
    for (const line of lines(s, width, size)) {
      room(size * 1.4);
      text(line, x, y, size, color);
      y -= size * 1.4;
    }
  }
  newPage();
  const partyTop = y;
  text("PREPARED FOR", M, y, 7, gold);
  y -= 18;
  para(doc.clientName, 245, 12, ink);
  para([doc.clientEmail, doc.clientPhone].filter(Boolean).join(" · "), 245, 8);
  if (doc.clientAddress) para(doc.clientAddress, 245, 8);
  const partyBottom = y;
  y = partyTop;
  text("EVENT & DATES", 325, y, 7, gold);
  y -= 18;
  para(doc.event, R - 325, 10, ink, 325);
  para(
    "Issued: " + (doc.sharedAt || doc.createdAt).slice(0, 10),
    R - 325,
    8,
    muted,
    325,
  );
  if (doc.eventDate) para("Event: " + doc.eventDate, R - 325, 8, muted, 325);
  if (doc.dueDate)
    para(
      (doc.kind === "quotation" ? "Valid until: " : "Payment due: ") +
        doc.dueDate,
      R - 325,
      8,
      muted,
      325,
    );
  y = Math.min(y, partyBottom) - 16;
  function tableHeader() {
    room(38);
    page.drawRectangle({
      x: M,
      y: y - 8,
      width: R - M,
      height: 24,
      color: ink,
    });
    text("ITEM / DESCRIPTION", M + 8, y, 7, white);
    right("QTY", 353, y, 7, white);
    right("RATE", 445, y, 7, white);
    right("AMOUNT", R - 8, y, 7, white);
    y -= 25;
  }
  tableHeader();
  for (let i = 0; i < doc.lines.length; i++) {
    const item = doc.lines[i];
    const title = lines(
      `${String(i + 1).padStart(2, "0")}  ${item.name}`,
      278,
      9,
    );
    const detail = lines(
      [item.variant, item.description].filter(Boolean).join(" · "),
      266,
      7.5,
    ).filter(Boolean);
    const all = [
      ...title.map((v) => ({ v, size: 9, color: ink })),
      ...detail.map((v) => ({ v, size: 7.5, color: muted })),
    ];
    const height = all.length * 12 + 12;
    if (y - Math.min(height, 600) < 70) {
      newPage();
      tableHeader();
    }
    right(
      String(item.quantity) + (item.unit ? " " + item.unit : ""),
      353,
      y,
      Math.min(
        8,
        48 /
          font.widthOfTextAtSize(
            String(item.quantity) + (item.unit ? " " + item.unit : ""),
            1,
          ),
      ),
    );
    right(money(item.rate), 445, y, 8);
    const amount = money(Math.round(item.quantity * item.rate * 100) / 100);
    right(
      amount,
      R - 8,
      y,
      Math.min(9, 100 / font.widthOfTextAtSize(amount, 1)),
    );
    for (const row of all) {
      if (y < 78) {
        newPage();
        tableHeader();
      }
      text(row.v, M + 8, y, row.size, row.color);
      y -= row.size + 3;
    }
    page.drawLine({
      start: { x: M, y: y + 4 },
      end: { x: R, y: y + 4 },
      thickness: 0.5,
      color: rule,
    });
    y -= 9;
  }
  const t = totals(doc);
  const sums: [string, number][] = [
    ["Subtotal", t.subtotal],
    ...(t.discount ? [["Discount", -t.discount] as [string, number]] : []),
    ...(doc.taxRate
      ? [[`Tax (${doc.taxRate}%)`, t.tax] as [string, number]]
      : []),
    ["Total", t.total],
    ...(doc.kind === "invoice" ? [["Paid", t.paid] as [string, number]] : []),
  ];
  const blockHeight = Math.max(sums.length * 19 + 48, qrImage ? 134 : 75);
  room(blockHeight + 12);
  y -= 10;
  const blockTop = y;
  if (qrImage && doc.kind === "invoice" && t.balance > 0) {
    page.drawImage(qrImage, { x: M, y: y - 99, width: 99, height: 99 });
    text("SCAN TO PAY", M + 110, y - 12, 8, gold);
    let payY = y - 29;
    for (const l of lines(
      doc.business.payeeName || doc.business.businessName,
      145,
      8,
    )) {
      text(l, M + 110, payY, 8);
      payY -= 11;
    }
    for (const l of lines(doc.business.upiId || "Use your UPI app", 145, 7.5)) {
      text(l, M + 110, payY, 7.5, muted);
      payY -= 11;
    }
    text("Reference: " + doc.number, M + 110, payY - 9, 7, muted);
  } else {
    text(
      doc.kind === "quotation"
        ? "YOUR CELEBRATION, BEAUTIFULLY PLANNED."
        : t.balance === 0
          ? "THANK YOU. PAYMENT RECEIVED."
          : "THANK YOU FOR CHOOSING EXOTIC.",
      M,
      y - 12,
      7,
      gold,
    );
  }
  for (const [label, value] of sums) {
    text(label, 343, y - 8, 8, muted);
    right(money(value), R - 8, y - 8, 9);
    y -= 19;
  }
  page.drawRectangle({
    x: 333,
    y: y - 32,
    width: R - 333,
    height: 32,
    color: pale,
  });
  text(
    doc.kind === "invoice" ? "BALANCE DUE" : "QUOTATION TOTAL",
    343,
    y - 20,
    7,
    gold,
  );
  right(
    money(doc.kind === "invoice" ? t.balance : t.total),
    R - 8,
    y - 20,
    11,
    ink,
  );
  y = Math.min(y - 45, blockTop - blockHeight);
  if (doc.kind === "invoice" && t.balance > 0 && doc.business.paymentNote) {
    para(doc.business.paymentNote, 290, 7.5);
    y -= 5;
  }
  if (doc.approvedAt) {
    para(
      `${doc.status === "declined" ? "Declined" : "Approved"} by ${doc.approvedBy} on ${doc.approvedAt.slice(0, 10)}`,
      R - M,
      8,
      gold,
    );
    y -= 7;
  }
  for (const [title, value] of [
    ["NOTES", doc.notes],
    ["TERMS & INCLUSIONS", doc.terms],
  ]) {
    if (value) {
      room(38);
      text(title, M, y, 7, gold);
      y -= 13;
      para(value, R - M, 8);
      y -= 10;
    }
  }
  if (doc.payments.length) {
    room(35);
    text("PAYMENT RECORD", M, y, 7, gold);
    y -= 13;
    for (const p of doc.payments)
      para(
        `${p.date} · ${money(p.amount)} · ${p.method} · ${p.reference}`,
        R - M,
        7.5,
      );
  }
  // Long addresses remain complete in the body; a concise branded footer repeats on every page.
  room(45);
  para(doc.business.businessName, R - M, 8, ink);
  para(doc.business.address, R - M, 7.5);
  if (doc.business.taxId)
    para("Business tax ID: " + doc.business.taxId, R - M, 7.5);
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    page = p;
    page.drawLine({
      start: { x: M, y: 49 },
      end: { x: R, y: 49 },
      color: gold,
      thickness: 0.7,
    });
    text("EXOTIC  /  EVENT & ENTERTAINMENT", M, 34, 7, gold);
    right(`${doc.number}  ·  ${i + 1} / ${pages.length}`, R, 34, 7, muted);
    const contact = [doc.business.phone, doc.business.email]
      .filter(Boolean)
      .join("  ·  ");
    text(
      contact,
      M,
      21,
      Math.min(7, 450 / Math.max(1, font.widthOfTextAtSize(contact, 1))),
      muted,
    );
  });
  return pdf.save();
}
