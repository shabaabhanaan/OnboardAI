import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { email, username } = await req.json();

        if (!email || !username) {
            return NextResponse.json({ error: "Missing email or username" }, { status: 400 });
        }

        // Configure SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "shababhanaan22@gmail.com",
                pass: "cczt xdiq nwog jmqx", // App Password
            },
        });

        // Set up email data
        const mailOptions = {
            from: '"Summriate AI" <shababhanaan22@gmail.com>',
            to: email,
            subject: `Welcome to Summriate, ${username}! 🚀`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Welcome to Summriate!</h2>
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>Thanks for joining Summriate AI! We're excited to help you transform your meetings into smart, actionable notes.</p>
                    <p>With Summriate, you can:</p>
                    <ul>
                        <li>Generate intelligent summaries of your meetings.</li>
                        <li>Automatically extract action items and key points.</li>
                        <li>Keep all your meeting intelligence in one secure place.</li>
                    </ul>
                    <p style="margin-top: 30px;">Ready to get started? Head over to your dashboard and create your first summary!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" 
                           style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; rounded: 5px; font-weight: bold;">
                           Go to Dashboard
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        © 2026 Summriate AI. Powered by Advanced Intelligence.
                    </p>
                </div>
            `,
        };

        // Send mail
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);

        return NextResponse.json({ success: true, message: "Welcome email sent successfully" });
    } catch (error: any) {
        console.error("Error sending welcome email:", error);
        return NextResponse.json({ error: "Failed to send welcome email", details: error.message }, { status: 500 });
    }
}
