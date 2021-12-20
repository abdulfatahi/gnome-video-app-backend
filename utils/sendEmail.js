import nodemailer from 'nodemailer';
import MailGen from 'mailgen';

// eslint-disable-next-line consistent-return
const sendEmail = async (email, subject, intro, name, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      secure: true,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const MailGenerator = new MailGen({
      theme: 'default',
      product: {
        name: 'Kvid',
        link: process.env.main_url,
      },
    });

    const response = {
      body: { name, intro },
    };

    const html = MailGenerator.generate(response);

    await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject,
      replyTo: process.env.EMAIL_SENDER,
      html,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export default sendEmail;
