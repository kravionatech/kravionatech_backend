import { Resend } from "resend";
import config from "../config/config.js";

const resend = new Resend(config.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: config.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log("Email Sent Successfully: ", data);
  } catch (error) {
    console.table("Email Send Failed: ", error.message);
  }
};

export const OTPSENDUI = (
  otpCode,
  userEmail,
  logoUrl = `https://kraviona.com/logo.png`,
) => {
  const companyLogo = logoUrl || "https://kraviona.com/logo.webp";

  // Brand Colors based on logo
  const brandTeal = "#1e4d50"; // Dark teal from the main body
  const brandCoral = "#e9845e"; // Coral/Orange from the accent
  const lightTeal = "#f0f6f6"; // Soft background tint

  return `
    <div style="font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 50px 20px; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(30, 77, 80, 0.08); border: 1px solid #e2e8f0;">
        
        <div style="height: 6px; background: linear-gradient(90deg, ${brandTeal} 0%, ${brandCoral} 100%);"></div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="${companyLogo}" alt="Kraviona" style="max-width: 50px; height: auto;" />
          </div>

          <h2 style="color: ${brandTeal}; text-align: center; margin: 0 0 10px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Confirm your email</h2>
          
          <p style="font-size: 15px; color: #64748b; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Thanks for choosing <span style="color: ${brandTeal}; font-weight: 600;">Kraviona</span>. Use the secure code below to verify <span style="color: #1e293b; font-weight: 500;">${userEmail}</span>.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <div style="display: inline-block; font-size: 42px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: ${brandTeal}; background-color: ${lightTeal}; padding: 20px 45px; border-radius: 12px; letter-spacing: 10px; border: 2px solid ${brandTeal}15;">
              ${otpCode}
            </div>
            <p style="font-size: 12px; color: ${brandCoral}; font-weight: 600; text-transform: uppercase; margin-top: 20px; letter-spacing: 1px;">
              Expires in 10 minutes
            </p>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; text-align: center;">
            For security reasons, never share this code. If you didn't request this, please ignore this message.
          </p>
          
          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              &copy; ${new Date().getFullYear()} <strong>Kraviona</strong>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const LOGIN_NOTIFICATION_EMAIL_UI = ({
  userName,
  userEmail,
  deviceInfo = "Unknown Device",
  location = "Unknown Location",
  time = "Unknown Time",
  secureAccountLink = "#",
  logoUrl = `https://kraviona.com/logo.png`,
}) => {
  const companyLogo = logoUrl || "https://kraviona.com/logo.webp";

  // Brand Colors from your logo
  const brandTeal = "#1e4d50"; // Dark teal
  const brandCoral = "#e9845e"; // Coral orange
  const bgSoft = "#f8fafc";

  return `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: ${bgSoft}; padding: 40px 20px; margin: 0;">
      <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(30, 77, 80, 0.05); border: 1px solid #e2e8f0;">
        
        <div style="height: 6px; background: linear-gradient(90deg, ${brandTeal} 0%, ${brandCoral} 100%);"></div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="${companyLogo}" alt="Kraviona" style="max-width: 50px; height: auto;" />
          </div>

          <h2 style="color: ${brandTeal}; text-align: center; margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">New Login Detected ⚠️</h2>
          
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6; text-align: center;">
            Hello <strong>${userName}</strong>, we noticed a new sign-in to your Kraviona account (<span style="color: ${brandTeal};">${userEmail}</span>).
          </p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid ${brandCoral};">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #1e293b;">
              <tr>
                <td style="padding: 4px 0; font-weight: 600; width: 80px;">Device:</td>
                <td style="padding: 4px 0;">${deviceInfo}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: 600;">Location:</td>
                <td style="padding: 4px 0;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: 600;">Time:</td>
                <td style="padding: 4px 0;">${time}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 14px; color: #ef4444; font-weight: 600; margin-bottom: 20px;">
              Wasn't you? Secure your account immediately.
            </p>
            <a href="${secureAccountLink}" style="background-color: ${brandTeal}; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 8px; display: inline-block; transition: background-color 0.3s;">
              Secure My Account
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 25px;">
            If this was you, you can safely ignore this automated message.<br />
            &copy; ${new Date().getFullYear()} <strong>Kraviona</strong>. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

export const WelcomeEmailUI = ({
  userName,
  logoUrl = `https://kraviona.com/logo.png`,
}) => {
  const companyLogo = logoUrl || "https://kraviona.com/logo.webp";

  // Brand Colors
  const brandTeal = "#1e4d50";
  const brandCoral = "#e9845e";
  const bgSoft = "#f8fafc";

  return `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: ${bgSoft}; padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(30, 77, 80, 0.05); border: 1px solid #e2e8f0;">
        
        <div style="height: 8px; background: linear-gradient(90deg, ${brandTeal} 0%, ${brandCoral} 100%);"></div>

        <div style="padding: 45px 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${companyLogo}" alt="Kraviona" style="max-width: 60px; height: auto;" />
          </div>

          <h1 style="color: ${brandTeal}; text-align: center; margin: 0 0 15px 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Welcome to the family!</h1>
          
          <p style="font-size: 17px; color: #334155; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Hello <strong>${userName}</strong>, we're absolutely thrilled to have you join <strong>Kraviona</strong>.
          </p>
          
          <div style="background-color: #f1f5f9; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">
              Our mission is to provide you with a seamless and premium experience. Your account is now active and ready for you to explore.
            </p>
          </div>

          <p style="font-size: 15px; color: #64748b; line-height: 1.6; text-align: center;">
            Have questions? Just hit reply or visit our support center. We’re here to help you get the most out of your new account.
          </p>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://kraviona.com/dashboard" style="background-color: ${brandCoral}; color: #ffffff; text-decoration: none; padding: 16px 35px; font-size: 16px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(233, 132, 94, 0.3);">
              Get Started
            </a>
          </div>
          
          <div style="margin-top: 50px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0; letter-spacing: 0.5px;">
              &copy; ${new Date().getFullYear()} <strong>Kraviona</strong>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const SubscriberWelcomeEmail = ({
  email,
  logoUrl = `https://kraviona.com/logo.png`,
}) => {
  // Brand Colors
  const brandTeal = "#1e4d50";
  const brandCoral = "#e9845e";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome to Kraviona</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
      
      <tr>
        <td style="background: linear-gradient(90deg, ${brandTeal} 0%, ${brandCoral} 100%); height: 6px;"></td>
      </tr>

      <tr>
        <td align="center" style="padding:40px 40px 20px 40px;">
          <img src="${logoUrl}" alt="Kraviona Logo" width="50" style="display:block;outline:none;border:none;" />
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:0 40px;">
          <h2 style="color:${brandTeal};font-size:24px;margin:10px 0;font-weight:700;">You're on the list! 🎉</h2>
        </td>
      </tr>

      <tr>
        <td style="color:#475569;font-size:16px;line-height:1.6;padding:20px 40px;text-align:center;">
          Hello <span style="color:${brandTeal};font-weight:600;">${email}</span>,
          <br/><br/>
          Thank you for subscribing to the <b>Kraviona</b> newsletter. We're excited to share our journey, latest updates, and exclusive insights directly with you.
        </td>
      </tr>

      <tr>
        <td style="color:#64748b;font-size:14px;line-height:1.6;padding:0 40px;text-align:center;">
          You'll be the first to know about new features, professional services, and important announcements from our team.
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:35px 40px;">
          <a href="https://kraviona.com"
            style="background-color:${brandTeal};color:#ffffff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
            Explore Our Services
          </a>
        </td>
      </tr>

      <tr>
        <td style="padding:30px 40px;font-size:12px;color:#94a3b8;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0 0 10px 0;">You received this because you subscribed via our website.</p>
          <p style="margin:0;">&copy; ${new Date().getFullYear()} <strong>Kraviona</strong>. All rights reserved.</p>
        </td>
      </tr>

    </table>

  </body>
  </html>
  `;
};

// new post add mail
export const NewPostAddEmailNotification = ({
  subscriberName = "Hello Subscriber",
  postTitle,
  postDescription,
  postUrl,
  postThumbnail,
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Article Alert!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6; color: #333333;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
              
              <tr>
                <td style="background-color: #064e3b; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
                    New Article Published! 🚀
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">
                    Hi <strong>${subscriberName}</strong>,
                  </p>
                  <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5;">
                    We just published a brand new article that we think you'll love. Check out the details below:
                  </p>

                  ${
                    postThumbnail
                      ? `
                  <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${postThumbnail}" alt="Post Cover" style="max-width: 100%; border-radius: 8px; height: auto;">
                  </div>
                  `
                      : ""
                  }

                  <h2 style="font-size: 22px; color: #064e3b; margin-top: 0; margin-bottom: 10px;">
                    ${postTitle}
                  </h2>
                  <p style="font-size: 15px; color: #555555; line-height: 1.6; margin-bottom: 30px;">
                    ${postDescription.substring(0, 150)}...
                  </p>

                  <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${postUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Read Full Article
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="font-size: 12px; color: #888888; margin: 0; line-height: 1.5;">
                    You received this email because you are subscribed to our blog updates.<br>
                    If you no longer wish to receive these emails, you can <a href="#" style="color: #10b981; text-decoration: underline;">unsubscribe here</a>.
                  </p>
                </td>
              </tr>

            </table>
            
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};

export const accountUpdateMail = ({
  email,
  logoUrl = `https://kraviona.com/logo.png`,
  date,
  deviceInfo,
  IPAddress,
  loginTime,
}) => {
  // Brand Colors
  const brandTeal = "#1e4d50";
  const brandCoral = "#e9845e";
};
