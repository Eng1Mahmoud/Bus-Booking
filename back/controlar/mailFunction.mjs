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
               <p>Thank you for using <strong><a href="https://bus-booking.vercel.app/">Tazkarty</a></strong></p>
                <p> Your Verify  Code Is <strong class="num">${text}</strong></p>
               <p>If you have any questions or need any assistance,<br><br> please don't hesitate to contact us. on <strong>   <a href="tel:01201453941" style={{ color: "blue",textDecoration:"none",fontSize:"20px" }}>01201453941 </a> </strong> </p>
               <strong>Best regards,</strong>
             </body>
           </html>`
        });
    }
    catch(err){}
  
}

export default sendMail;