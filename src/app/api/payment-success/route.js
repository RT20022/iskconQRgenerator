// src/app/api/payment-success/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import fs from 'fs';
import path from 'path';
import QRCode from "qrcode";
import { PDFDocument, rgb } from 'pdf-lib';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const nodemailer = require("nodemailer")

/**
 * Generates a base64 QR Code Data URL from given input text/data.
 * @param {string} text - The data you want to encode in the QR code.
 * @returns {Promise<string>} - A base64 image Data URL of the QR code.
 */

async function generateQRPdf(data, username, usermail) {
  const assetsPath = path.join(process.cwd(), "src", "assets");
  const backgroundImgBuffer = fs.readFileSync(path.join(assetsPath, "template.png"));

  // Generate QR code
  const qrBuffer = await QRCode.toBuffer(data);

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  // Embed images
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const backgroundImage = await pdfDoc.embedPng(backgroundImgBuffer);

  // Draw background full page
  page.drawImage(backgroundImage, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  // Draw QR code (center in blank area)
  const qrMaxSize = 200; // adjust size as needed
  const scale = Math.min(qrMaxSize / qrImage.width, qrMaxSize / qrImage.height);

  const qrDisplayWidth = qrImage.width * scale;
  const qrDisplayHeight = qrImage.height * scale;

  const qrX = (pageWidth - qrDisplayWidth) / 2;
  const qrY = (pageHeight / 2 - qrDisplayHeight / 2) - 25;


  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrDisplayWidth,
    height: qrDisplayHeight,
  });

  // Add only Name & Email just below QR
  const textY = qrY - 40; // 40px below QR
  const textX = 60;

  page.drawText(`Name: ${username}`, {
    x: textX,
    y: textY,
    size: 14,
    color: rgb(1, 1, 1), // white text
  });

  page.drawText(`Email: ${usermail}`, {
    x: textX,
    y: textY - 20,
    size: 14,
    color: rgb(1, 1, 1),
  });

  return await pdfDoc.save();
}



async function generateUniqueId(name, email) {
  await connectToDatabase();
  const lastUser = await User.findOne().sort({ userID: -1 }).limit(1);
  console.log(lastUser, "lastuserid ============<<<,", lastUser?.userID)
  let nextUserId
  if (!lastUser) {
    nextUserId = 1
  }
  else if (!lastUser?.userID) {
    nextUserId = 1
  }
  else {
    nextUserId = lastUser.userID + 1
  }
  console.log("===========user id ========", nextUserId);
  const data = `${name.toLowerCase().trim()}-${email.toLowerCase().trim()}-${nextUserId}`;
  const hashID = crypto.createHash('sha256').update(data).digest('hex');
  return { hashID, nextUserId } // 64-char hash
}
async function generateQrCodeData(name, email) {
  try {
    let { hashID, nextUserId } = await generateUniqueId(name, email);
    const pdfBuffer = await generateQRPdf(hashID, name, email);
    // const qrDataUrl = await QRCode.toDataURL(text, {
    //     errorCorrectionLevel: "H", // High error correction
    //     width: 300,
    //     margin: 2,
    //     color: {
    //         dark: "#000000",
    //         light: "#FFFFFF",
    //     },
    // });
    return { hashID, pdfBuffer, nextUserId }; // This is a base64 image data URL
  } catch (err) {
    console.error("QR Code Generation Failed:", err);
    return null;
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(bodyString)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const { hashID, pdfBuffer, nextUserId } = await generateQrCodeData(body.userData.fullName, body.userData.email);
    console.log(hashID, pdfBuffer, nextUserId);
    await connectToDatabase();
    const newUser = await User.create({
      fullname: body.userData.fullName,
      email: body.userData.email,
      phone: body.userData.contact,
      qrCodeData: hashID,
      userID: nextUserId,
      age: body.userData.age,
      Gender: body.userData.Gender,
      DOB: body.userData.DOB,
      Address: body.userData.Address,
      School: body.userData.School,
      Class: body.userData.Class,
    });


    const emailHtml = `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="text-align: center; color: #4B0082;">🎉 Congratulations! 🎉</h2>
      <p style="font-size: 16px;">You have successfully registered for the <strong>UDAAN - Rise Beyond Limits</strong> session by <strong>HG Amogh Lila Das</strong>.</p>
      
      <p style="font-size: 16px;">
        We are excited to welcome you on <strong>5th October 2025</strong> at 
        <strong>Regalia - The Forest Resort , Verka Vallah Bypass Road, Amritsar</strong>.
      </p>
      
      <p style="text-align: center; font-size: 18px; margin: 20px 0; color: #006400;">
        🌸🦚 <strong>Hari Bol</strong> 🦚🌸
      </p>

      <hr style="border: none; border-top: 1px solid #ddd;" />

      <h3 style="color: #333;">📅 Event Details</h3>
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Date:</strong> 5 October 2025</li>
        <li><strong>Timing :</strong> 3 P.M. Onwards</li>
        <li><strong>Venue:</strong> Regalia - The Forest Resort , Verka Vallah Bypass Road, Amritsar</li>
        <li><strong>What You Will Get:</strong> Inspiring Talk | Electrifying Kirtan | Delicious Prasadam</li>
      </ul>

      <hr style="border: none; border-top: 1px solid #ddd;" />

      <h3 style="color: #B22222;">🚨 Important Note</h3>
      <p style="font-size: 16px;">
        The QR code sent below is your <strong>Entry Pass</strong> for the event.
        <br/>Each QR code is valid for <strong>1 person only</strong>.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 14px; color: #555; margin-top: 10px;">Please show Entry Pass at the entry Gate.</p>
      </div>

      <p style="text-align: center; margin-top: 30px; font-size: 16px;">
        🙏 Looking forward to seeing you! 🙏<br/>
        <strong>Iskcon Sri Gokul Gaushala Amrtisar</strong>
      </p>
    </div>
  </div>
`
    const base64 = Buffer.from(pdfBuffer).toString('base64');
    const response = await resend.emails.send({
      from: 'Iskcon Sri Gokul Gaushala <events@iskconsrigokulgaushala.com>',
      to: body.userData.email,
      subject: "🎉 You're Registered for UDAAN with HG Amogh Lila Das!",
      html: emailHtml,
      attachments: [
        {
          filename: 'UDAAN-EntryPass.pdf',
          content: base64,
          contentType: 'application/pdf',
        },
      ],
    })
    console.log(response, "Email response data");

    // const transporter = nodemailer.createTransport({
    //   service: 'gmail', // or your SMTP provider
    //   auth: {
    //     user: 'srigokulgaushala@gmail.com',
    //     pass: process.env.GMAIL_APP_PASS, // Use App Password for Gmail
    //   },
    // })

    // const mailOptions = {
    //   from: 'iskconsrigokulgaushalaevents@gmail.com',
    //   to: body.userData.email,
    //   subject: "🎉 You're Registered for UDAAN with HG Amogh Lila Das!",
    //   attachments: [
    //     {
    //       filename: 'UDAAN-EntryPass.pdf',
    //       content: pdfBuffer,
    //       contentType: 'application/pdf',
    //     },
    //   ],
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error('Error sending email:', error);
    //   } else {
    //     console.log('Email sent:', info.response);
    //   }
    // });
    // const base64 = Buffer.from(pdfBuffer).toString('base64');
    return NextResponse.json({ message: "payment Successful", pdfBase64: base64 }, { status: 200 });
  } else {
    console.log("Payment verification failed");
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }
  } catch (error) {
    return NextResponse.json({ message: "Try again Later" }, { status: 400 });
  }
}
