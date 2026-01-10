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
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "465"),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Set up email data
        const mailOptions = {
            from: '"CodeOnboard" <' + process.env.SMTP_USER + '>',
            to: email,
            subject: `Welcome to OnboardAI, ${username}! 🚀`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Welcome to OnboardAI!</h2>
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>Thanks for joining! You're now ready to master any codebase in minutes.</p>
                    <p>With OnboardAI, you can:</p>
                    <ul>
                        <li><strong>Map Architecture:</strong> Get instant high-level overviews of complex repos.</li>
                        <li><strong>Find Critical Files:</strong> Know exactly where to start reading.</li>
                        <li><strong>Get Learning Plans:</strong> Follow a personalized day-by-day guide.</li>
                    </ul>
                    <p style="margin-top: 30px;">Ready to onboard specifically? Paste your first GitHub repo URL to get started.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" 
                           style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                           Start Onboarding
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        © 2026 OnboardAI. Master any codebase.
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
