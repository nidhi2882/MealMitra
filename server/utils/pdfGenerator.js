const PDFDocument = require("pdfkit");

/**
 * MealMitra Brand Colors (aligned with client/tailwind.config.js)
 */
const BRAND = {
    ink: "#1F2E1C",        // deep forest
    surface: "#F3EFE4",    // warm card surface
    background: "#FAF8F3", // soft porridge
    accent: "#C98A3B",     // turmeric gold
    verified: "#4B7F52",   // herb green
    alert: "#B3492E",      // muted brick
    line: "#E4DDC9",       // hairline divider
    white: "#FFFFFF",
    muted: "#667264",
};

/**
 * Draw a clean brand accent stripe across top of page
 */
function drawTopStripe(doc) {
    const pw = doc.page.width;
    doc.rect(0, 0, pw, 7).fill(BRAND.ink);
    doc.rect(0, 7, pw, 3).fill(BRAND.accent);
}

/**
 * Draw a clean, standard 1-page footer without triggering extra blank pages
 */
function drawSinglePageFooter(doc, title) {
    const pw = doc.page.width;
    const ph = doc.page.height;
    const footerY = ph - 30;

    // Temporarily zero the bottom margin to ensure PDFKit never triggers auto-pagination
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.moveTo(40, footerY - 8).lineTo(pw - 40, footerY - 8).strokeColor(BRAND.line).lineWidth(0.75).stroke();
    doc.fontSize(7.5).font("Helvetica").fillColor(BRAND.muted);
    doc.text(`MealMitra Network • ${title}`, 40, footerY, { width: 340, lineBreak: false });
    doc.text("Page 1 of 1", pw - 180, footerY, { width: 140, align: "right", lineBreak: false });

    doc.page.margins.bottom = prevBottom;
}

/**
 * Generates a clean, clutter-free single-page Admin Platform Report
 * 
 * @param {Response} res - Express HTTP response stream
 * @param {Object} data - Core platform metrics payload
 */
function generateAdminReportPDF(res, data) {
    const doc = new PDFDocument({
        margins: { top: 30, bottom: 20, left: 40, right: 40 },
        size: "A4",
        info: {
            Title: "MealMitra Platform Summary Report",
            Author: "MealMitra Platform",
            Subject: "Platform Statistics & Monthly Summary",
        },
    });

    doc.pipe(res);
    drawTopStripe(doc);

    const pw = doc.page.width;

    // Header
    doc.fillColor(BRAND.ink).fontSize(20).font("Helvetica-Bold").text("MEALMITRA", 40, 28);
    doc.fontSize(9.5).font("Helvetica-Bold").fillColor(BRAND.accent).text("SURPLUS FOOD RESCUE NETWORK", 40, 52);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND.ink).text("Platform Summary Report", 40, 68);

    // Right-aligned Metadata
    const metaX = pw - 200;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(BRAND.ink).text("REPORT REF:", metaX, 30, { width: 160, align: "right" });
    doc.font("Helvetica").fillColor(BRAND.muted).text(data.reportRef || `MM-REP-${Date.now().toString().slice(-6)}`, metaX, 42, { width: 160, align: "right" });
    doc.font("Helvetica-Bold").fillColor(BRAND.ink).text("DATE GENERATED:", metaX, 56, { width: 160, align: "right" });
    doc.font("Helvetica").fillColor(BRAND.muted).text(data.generatedDate || new Date().toLocaleDateString("en-IN"), metaX, 68, { width: 160, align: "right" });

    // Divider
    doc.moveTo(40, 95).lineTo(pw - 40, 95).strokeColor(BRAND.line).lineWidth(1).stroke();

    let y = 112;

    // 1. Core Platform KPI Cards
    doc.fillColor(BRAND.ink).fontSize(10).font("Helvetica-Bold").text("CORE PLATFORM METRICS", 40, y);
    y += 16;

    const cards = [
        {
            label: "TOTAL USERS",
            val: String(data.totalUsers || 0),
            sub: `${data.totalRestaurants || 0} Rest. • ${data.totalNGOs || 0} NGOs`,
            color: BRAND.ink,
        },
        {
            label: "DONATION POSTS",
            val: String(data.totalDonations || 0),
            sub: "Total food listings",
            color: BRAND.ink,
        },
        {
            label: "COMPLETED PICKUPS",
            val: String(data.completedPickups || 0),
            sub: `${data.fulfillmentRate || "0%"} Handover rate`,
            color: BRAND.verified,
        },
        {
            label: "PENDING VERIFICATION",
            val: String(data.pendingVerification || 0),
            sub: "Awaiting approval",
            color: (data.pendingVerification || 0) > 0 ? BRAND.alert : BRAND.muted,
        },
    ];

    const cardWidth = 120;
    const cardHeight = 58;
    const gap = (pw - 80 - cardWidth * 4) / 3;

    cards.forEach((card, idx) => {
        const x = 40 + idx * (cardWidth + gap);
        doc.roundedRect(x, y, cardWidth, cardHeight, 5).fillAndStroke(BRAND.surface, BRAND.line);

        doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica-Bold").text(card.label, x + 8, y + 8, { width: cardWidth - 16 });
        doc.fillColor(card.color).fontSize(15).font("Helvetica-Bold").text(card.val, x + 8, y + 21, { width: cardWidth - 16 });
        doc.fillColor(BRAND.muted).fontSize(7).font("Helvetica").text(card.sub, x + 8, y + 42, { width: cardWidth - 16 });
    });

    y += cardHeight + 24;

    // 2. User & Account Breakdown Table
    doc.fillColor(BRAND.ink).fontSize(10).font("Helvetica-Bold").text("USER COMMUNITY BREAKDOWN", 40, y);
    y += 14;

    const breakdownW = pw - 80;
    doc.rect(40, y, breakdownW, 20).fill(BRAND.ink);
    doc.fillColor(BRAND.white).fontSize(8).font("Helvetica-Bold");
    doc.text("ACCOUNT TYPE / CATEGORY", 50, y + 6, { width: 220 });
    doc.text("COUNT", 280, y + 6, { width: 100, align: "right" });
    doc.text("SHARE OF COMMUNITY", 400, y + 6, { width: breakdownW - 360, align: "right" });
    y += 20;

    const totalU = data.totalUsers || 1;
    const userRows = [
        { label: "Restaurants & Food Providers", count: data.totalRestaurants || 0 },
        { label: "Non-Governmental Organizations (NGOs)", count: data.totalNGOs || 0 },
        { label: "Verified & Active Accounts", count: data.verifiedUsers || 0 },
        { label: "Pending Verification Queue", count: data.pendingVerification || 0 },
    ];

    userRows.forEach((row, idx) => {
        const bg = idx % 2 === 0 ? BRAND.white : BRAND.surface;
        doc.rect(40, y, breakdownW, 18).fill(bg);
        doc.rect(40, y, breakdownW, 18).strokeColor(BRAND.line).lineWidth(0.5).stroke();

        doc.fillColor(BRAND.ink).fontSize(8).font("Helvetica").text(row.label, 50, y + 5, { width: 220 });
        doc.text(String(row.count), 280, y + 5, { width: 100, align: "right" });

        const pct = Math.round((row.count / totalU) * 100) + "%";
        doc.fillColor(BRAND.muted).text(pct, 400, y + 5, { width: breakdownW - 360, align: "right" });
        y += 18;
    });

    y += 26;

    // 3. Monthly Donation Trends Table
    doc.fillColor(BRAND.ink).fontSize(10).font("Helvetica-Bold").text("MONTHLY DONATION & FULFILLMENT TRENDS", 40, y);
    y += 14;

    doc.rect(40, y, breakdownW, 20).fill(BRAND.ink);
    doc.fillColor(BRAND.white).fontSize(8).font("Helvetica-Bold");
    doc.text("MONTH / YEAR", 50, y + 6, { width: 150 });
    doc.text("DONATIONS LISTED", 210, y + 6, { width: 110, align: "right" });
    doc.text("COMPLETED PICKUPS", 330, y + 6, { width: 110, align: "right" });
    doc.text("FULFILLMENT RATE", 450, y + 6, { width: breakdownW - 410, align: "right" });
    y += 20;

    const monthlyTrends = data.monthlyTrends && data.monthlyTrends.length > 0 ? data.monthlyTrends : [
        { month: "Current Period", count: data.totalDonations || 0, completed: data.completedPickups || 0, rate: data.fulfillmentRate || "0%" }
    ];

    monthlyTrends.slice(0, 6).forEach((row, idx) => {
        const bg = idx % 2 === 0 ? BRAND.white : BRAND.surface;
        doc.rect(40, y, breakdownW, 19).fill(bg);
        doc.rect(40, y, breakdownW, 19).strokeColor(BRAND.line).lineWidth(0.5).stroke();

        doc.fillColor(BRAND.ink).fontSize(8).font("Helvetica").text(row.month, 50, y + 6, { width: 150 });
        doc.text(String(row.count || 0), 210, y + 6, { width: 110, align: "right" });
        doc.text(String(row.completed || 0), 330, y + 6, { width: 110, align: "right" });

        const rate = row.rate || (row.count > 0 ? Math.round((row.completed / row.count) * 100) + "%" : "0%");
        doc.fillColor(BRAND.verified).font("Helvetica-Bold").text(rate, 450, y + 6, { width: breakdownW - 410, align: "right" });
        y += 19;
    });

    y += 28;

    // Summary Note Box
    doc.roundedRect(40, y, breakdownW, 36, 4).fillAndStroke(BRAND.surface, BRAND.line);
    doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica")
        .text("System Notice: This document is an automated administrative extract of all active accounts and food donation records in the MealMitra database. Prepared for platform moderation and operational oversight.", 50, y + 9, { width: breakdownW - 20, lineGap: 2 });

    // Footer
    drawSinglePageFooter(doc, "Platform Summary Report");

    doc.end();
}

/**
 * Generates a clean, practical single-page Donation Handover Receipt
 * 
 * @param {Response} res - Express HTTP response stream
 * @param {Object} data - Handover details
 */
function generateDonationReceiptPDF(res, data) {
    const doc = new PDFDocument({
        margins: { top: 30, bottom: 20, left: 40, right: 40 },
        size: "A4",
        info: {
            Title: `MealMitra Donation Receipt - ${data.receiptId || data.certId}`,
            Author: "MealMitra Surplus Food Network",
            Subject: "Official Surplus Food Handover Receipt",
        },
    });

    doc.pipe(res);
    drawTopStripe(doc);

    const pw = doc.page.width;
    const contentW = pw - 80;

    // Receipt Header
    doc.fillColor(BRAND.ink).fontSize(19).font("Helvetica-Bold").text("MEALMITRA", 40, 28);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(BRAND.accent).text("SURPLUS FOOD RESCUE NETWORK", 40, 50);
    doc.fontSize(13).font("Helvetica-Bold").fillColor(BRAND.ink).text("Donation Handover Receipt", 40, 66);

    // Right-aligned Receipt Info
    const rightX = pw - 210;
    const receiptNum = data.receiptId || data.certId || `MM-RCPT-${Date.now().toString().slice(-6)}`;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(BRAND.ink).text("RECEIPT NO:", rightX, 30, { width: 170, align: "right" });
    doc.font("Helvetica-Bold").fillColor(BRAND.accent).text(receiptNum, rightX, 42, { width: 170, align: "right" });

    doc.font("Helvetica-Bold").fillColor(BRAND.ink).text("STATUS:", rightX, 56, { width: 170, align: "right" });
    doc.font("Helvetica-Bold").fillColor(BRAND.verified).text("COMPLETED & VERIFIED", rightX, 68, { width: 170, align: "right" });

    // Divider
    doc.moveTo(40, 94).lineTo(pw - 40, 94).strokeColor(BRAND.line).lineWidth(1).stroke();

    let y = 110;

    // 1. Two-Column Parties Box (Donor & NGO)
    const colW = (contentW - 15) / 2;
    const colH = 92;
    const donorX = 40;
    const ngoX = donorX + colW + 15;

    // Donor Box
    doc.roundedRect(donorX, y, colW, colH, 5).fillAndStroke(BRAND.background, BRAND.line);
    doc.rect(donorX, y, colW, 20).fill(BRAND.ink);
    doc.fillColor(BRAND.white).fontSize(8).font("Helvetica-Bold").text("DONATING ENTITY (DONOR)", donorX + 8, y + 6);

    doc.fillColor(BRAND.ink).fontSize(9.5).font("Helvetica-Bold").text(data.donor.organizationName || data.donor.name || "Food Donor", donorX + 8, y + 27, { width: colW - 16, ellipsis: true });
    doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica")
        .text(`Contact Person: ${data.donor.name || "N/A"}`, donorX + 8, y + 42)
        .text(`Email: ${data.donor.email || "N/A"}`, donorX + 8, y + 54)
        .text(`Phone: ${data.donor.phone || "N/A"}`, donorX + 8, y + 66)
        .text(`Address: ${data.pickupAddress || data.donor.address || "On file"}`, donorX + 8, y + 78, { width: colW - 16, ellipsis: true });

    // Recipient NGO Box
    doc.roundedRect(ngoX, y, colW, colH, 5).fillAndStroke(BRAND.background, BRAND.line);
    doc.rect(ngoX, y, colW, 20).fill(BRAND.verified);
    doc.fillColor(BRAND.white).fontSize(8).font("Helvetica-Bold").text("RECIPIENT NGO / SHELTER", ngoX + 8, y + 6);

    doc.fillColor(BRAND.ink).fontSize(9.5).font("Helvetica-Bold").text(data.ngo.ngoName || data.ngo.name || "Recipient NGO", ngoX + 8, y + 27, { width: colW - 16, ellipsis: true });
    doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica")
        .text(`Registration No: ${data.ngo.registrationNo || "Verified Community Partner"}`, ngoX + 8, y + 42)
        .text(`Representative: ${data.ngo.name || "N/A"}`, ngoX + 8, y + 54)
        .text(`Email: ${data.ngo.email || "N/A"}`, ngoX + 8, y + 66)
        .text("Partner Status: Admin Verified", ngoX + 8, y + 78);

    y += colH + 24;

    // 2. Itemized Particulars Table
    doc.fillColor(BRAND.ink).fontSize(10).font("Helvetica-Bold").text("DONATION PARTICULARS", 40, y);
    y += 14;

    doc.rect(40, y, contentW, 20).fill(BRAND.ink);
    doc.fillColor(BRAND.white).fontSize(8).font("Helvetica-Bold");
    doc.text("ITEM DESCRIPTION", 48, y + 6, { width: 190 });
    doc.text("FOOD CATEGORY", 245, y + 6, { width: 95 });
    doc.text("QUANTITY", 345, y + 6, { width: 75, align: "right" });
    doc.text("COMPLETED ON", 425, y + 6, { width: contentW - 390, align: "right" });
    y += 20;

    const rowH = 34;
    doc.rect(40, y, contentW, rowH).fill(BRAND.white);
    doc.rect(40, y, contentW, rowH).strokeColor(BRAND.line).lineWidth(0.75).stroke();

    doc.fillColor(BRAND.ink).fontSize(9).font("Helvetica-Bold").text(data.donation.foodName || "Surplus Food", 48, y + 7, { width: 190, ellipsis: true });
    if (data.donation.description) {
        doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica").text(data.donation.description, 48, y + 19, { width: 190, ellipsis: true });
    }

    doc.fillColor(BRAND.ink).fontSize(8.5).font("Helvetica").text(data.donation.foodType || "General Food", 245, y + 11, { width: 95 });
    doc.fillColor(BRAND.accent).fontSize(9.5).font("Helvetica-Bold").text(`${data.donation.quantity || 1} Servings`, 345, y + 11, { width: 75, align: "right" });
    doc.fillColor(BRAND.ink).fontSize(8).font("Helvetica").text(data.completedAt || new Date().toLocaleDateString("en-IN"), 425, y + 11, { width: contentW - 390, align: "right" });

    y += rowH + 24;

    // 3. Simple Handover Acknowledgment
    doc.roundedRect(40, y, contentW, 44, 4).fillAndStroke(BRAND.surface, BRAND.line);
    doc.fillColor(BRAND.ink).fontSize(8).font("Helvetica-Bold").text("HANDOVER CONFIRMATION & ACKNOWLEDGMENT", 48, y + 8);
    const ackText = "This receipt officially records that the surplus food listed above was released by the donor and successfully collected by the recipient NGO in good, wholesome condition for immediate community distribution.";
    doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica").text(ackText, 48, y + 21, { width: contentW - 16, lineGap: 1.5 });

    y += 66;

    // 4. Digital Verification Sign-off
    const signBoxW = 200;
    // Left: Digital Hash
    doc.fillColor(BRAND.muted).fontSize(7.5).font("Helvetica")
        .text("Platform Electronic Verification:", 40, y)
        .font("Courier-Bold").fillColor(BRAND.ink).text(data.securityHash || `MM-SEC-${Date.now().toString(16).toUpperCase()}`, 40, y + 12)
        .font("Helvetica").fillColor(BRAND.verified).text("Verification: Handover Completed & Logged", 40, y + 24);

    // Right: Signature line
    const sigX = pw - 40 - signBoxW;
    doc.moveTo(sigX, y + 22).lineTo(sigX + signBoxW, y + 22).strokeColor(BRAND.ink).lineWidth(0.75).stroke();
    doc.fillColor(BRAND.ink).fontSize(8).font("Helvetica-Bold").text("Authorized Digital Handover Record", sigX, y + 27, { width: signBoxW, align: "center" });
    doc.fillColor(BRAND.muted).fontSize(7).font("Helvetica").text("MealMitra Automated Verification", sigX, y + 38, { width: signBoxW, align: "center" });

    // Footer
    drawSinglePageFooter(doc, "Official Donation Handover Receipt");

    doc.end();
}

module.exports = {
    generateAdminReportPDF,
    generateDonationReceiptPDF,
    generateDonationCertificatePDF: generateDonationReceiptPDF, // alias for backwards compatibility
};
