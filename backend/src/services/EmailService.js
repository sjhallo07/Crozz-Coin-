class EmailService {
  async send({ to, subject, text, html }) {
    const payload = {
      to,
      subject,
      text,
      html,
      sentAt: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== "test") {
      console.info("[email]", JSON.stringify(payload, null, 2));
    }
    return payload;
  }
}

export const emailService = new EmailService();
