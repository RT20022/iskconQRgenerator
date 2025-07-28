// src/app/api/payment-success/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import QRCode from "qrcode";
import { PDFDocument, rgb } from 'pdf-lib';
const nodemailer = require("nodemailer")

/**
 * Generates a base64 QR Code Data URL from given input text/data.
 * @param {string} text - The data you want to encode in the QR code.
 * @returns {Promise<string>} - A base64 image Data URL of the QR code.
 */

async function generateQRPdf(data) {
  // Generate QR code buffer
  const qrBuffer = await QRCode.toBuffer(data);

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);

  // Embed QR code image
  const pngImage = await pdfDoc.embedPng(qrBuffer);
  const scale = 1.8;
  const { width, height } = pngImage.scale(scale);

  // Set up text layout variables
  let y = 560;
  const lineHeight = 22;

  // Draw header
  page.drawText('UDAAN - Entry Pass', {
    x: 100,
    y,
    size: 20,
    color: rgb(0.2, 0.4, 0.6),
  });

  y -= lineHeight * 1.5;
  page.drawText('Event: UDAAN - Rise Beyond Limits', { x: 50, y, size: 14 });

  y -= lineHeight;
  page.drawText('Speaker: HG Amogh Lila Das', { x: 50, y, size: 14 });

  y -= lineHeight;
  page.drawText('Date: 5th October 2025', { x: 50, y, size: 14 });

  y -= lineHeight;
  page.drawText('Time: 3 P.M Onwards', { x: 50, y, size: 14 });

  y -= lineHeight;
  page.drawText('Venue: Malibu Gardens, Amritsar', { x: 50, y, size: 14 });

  y -= lineHeight;
  page.drawText('Please carry this pass at entry.', {
    x: 50,
    y,
    size: 12,
    color: rgb(1, 0, 0),
  });

  // Draw QR code centered below the text
  const qrX = (400 - width) / 2;
  const qrY = 100;
  page.drawImage(pngImage, {
    x: qrX,
    y: qrY,
    width,
    height,
  });

  // Finalize the PDF and return
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
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
    const pdfBuffer = await generateQRPdf(hashID);
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



    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your SMTP provider
      auth: {
        user: 'iskconsrigokulgaushalaevents@gmail.com',
        pass: 'icnb ltyn abri yeru', // Use App Password for Gmail
      },
    });

    const mailOptions = {
      from: 'iskconsrigokulgaushalaevents@gmail.com',
      to: body.userData.email,
      subject: "🎉 You're Registered for UDAAN with HG Amogh Lila Das!",
      html: `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="text-align: center; color: #4B0082;">🎉 Congratulations! 🎉</h2>
      <p style="font-size: 16px;">You have successfully registered for the <strong>UDAAN - Rise Beyond Limits</strong> session by <strong>HG Amogh Lila Das</strong>.</p>
      
      <p style="font-size: 16px;">
        We are excited to welcome you on <strong>5th October 2025</strong> at 
        <strong>Malibu Gardens, Amritsar</strong>.
      </p>
      
      <p style="text-align: center; font-size: 18px; margin: 20px 0; color: #006400;">
        🌸🦚 <strong>Hari Bol</strong> 🦚🌸
      </p>

      <hr style="border: none; border-top: 1px solid #ddd;" />

      <h3 style="color: #333;">📅 Event Details</h3>
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Date:</strong> 5 October 2025</li>
        <li><strong>Timing :</strong> 3 P.M. Onwards</li>
        <li><strong>Venue:</strong> Malibu Gardens, Amritsar</li>
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
`,
      attachments: [
        {
          filename: 'UDAAN-EntryPass.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
    return NextResponse.json({ message: "payment Successfull" }, { status: 200 });
  } else {
    console.log("Payment verification failed");
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }
}
