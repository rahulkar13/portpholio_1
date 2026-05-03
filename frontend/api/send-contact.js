const nodemailer = require("nodemailer");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    return res.status(500).json({
      ok: false,
      message: "Email service is not configured",
    });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const subject = String(req.body?.subject || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      ok: false,
      message: "All fields are required",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${EMAIL_USER}>`,
      to: "rahulkar849@gmail.com",
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172019;">
          <h2 style="margin: 0 0 12px;">New Portfolio Contact Message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return res.status(200).json({
      ok: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("SMTP send failed:", {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
    });

    if (error.code === "EAUTH") {
      return res.status(500).json({
        ok: false,
        message: "Email authentication failed. Check EMAIL_USER or EMAIL_PASS.",
      });
    }

    if (error.code === "ESOCKET" || error.code === "ETIMEDOUT") {
      return res.status(500).json({
        ok: false,
        message: "Email server connection failed.",
      });
    }

    return res.status(500).json({
      ok: false,
      message: error.message || "Message could not be sent",
    });
  }
};
