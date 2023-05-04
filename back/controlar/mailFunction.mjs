import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const MailSender = process.env.MailSender
const PASS = process.env.PASS
const sendMail = async(resever,subject,text) => {
    try{
        const client = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: MailSender,
                pass: PASS
            }
        });
        client.sendMail({
            from:MailSender,
            to:resever,
            subject:subject,
           html:
           `<html>
             <head>
               <style>
               .num{
                    color:blue;
                    font-size: 20px;
                    font-weight: bold;
               }
               </style>
             </head>
             <body>
               <h1>Welcome to our website!</h1>
               <h3>Hi there,</h3>
               <p>Thank you for signing up for our website. We're excited to have you on board!</p>
                <p> Your Verify  Code Is <strong class="num">${text}</strong></p>
               <p>If you have any questions or need any assistance, please don't hesitate to contact us.</p>
               <strong>Best regards,</strong>
             
             </body>
           </html>`
        });
    }
    catch(err){
        console.log(err);
    }
  
}

export default sendMail;