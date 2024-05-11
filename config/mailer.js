import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
export const sendEmail=async(data)=>{
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL, // sender address
    to: data.toEmail, // list of receivers
    subject:data.subject, // Subject line
    html: data.body, // html body
  })
}