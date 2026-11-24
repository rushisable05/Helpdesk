import sgMail from '@sendgrid/mail';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../server/.env') });

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const targetEmail = process.argv[2] || fromEmail;

console.log(`\n====================================================`);
console.log(`🧪 SendGrid Outbound Email Test`);
console.log(`====================================================`);
console.log(`• FROM Email:   ${fromEmail || '(Not configured in server/.env)'}`);
console.log(`• TO Email:     ${targetEmail || '(Not specified)'}`);
console.log(`• API Key set:  ${apiKey ? 'Yes (Starts with ' + apiKey.slice(0, 7) + '...)' : 'No (EMPTY in server/.env)'}`);
console.log(`====================================================\n`);

if (!apiKey || apiKey.trim() === '') {
  console.error(`❌ ERROR: SENDGRID_API_KEY is empty in server/.env!`);
  console.log(`👉 Step to fix:`);
  console.log(`   1. Open https://app.sendgrid.com -> Settings -> API Keys`);
  console.log(`   2. Create an API Key with 'Full Access' (or Mail Send permissions)`);
  console.log(`   3. Paste it in server/.env under SENDGRID_API_KEY="..."\n`);
  process.exit(1);
}

if (!fromEmail || fromEmail === 'support@yourdomain.com') {
  console.warn(`⚠️ WARNING: SENDGRID_FROM_EMAIL is set to default placeholder: '${fromEmail}'`);
  console.log(`👉 SendGrid requires a VERIFIED Sender Email address.`);
  console.log(`   Please verify your personal email in SendGrid under Settings -> Sender Authentication -> Single Sender Verification,`);
  console.log(`   and set SENDGRID_FROM_EMAIL="your-verified-email@gmail.com" in server/.env\n`);
}

if (!targetEmail) {
  console.error(`❌ Please provide a destination email: bun run scripts/test-sendgrid-outbound.ts your-email@gmail.com`);
  process.exit(1);
}

async function testSend() {
  sgMail.setApiKey(apiKey!);
  
  console.log(`🚀 Sending test email to ${targetEmail}...`);
  try {
    const res = await sgMail.send({
      to: targetEmail,
      from: fromEmail!,
      subject: 'Helpdesk — SendGrid Outbound Email Verification Test',
      text: 'Congratulations! Your SendGrid integration with Helpdesk is working perfectly. When you reply to tickets in the Helpdesk UI, your customers will receive emails just like this.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">🎉 SendGrid Outbound Email Working!</h2>
          <p>Congratulations! Your SendGrid email integration with the <strong>Helpdesk</strong> system is working perfectly.</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0;"><strong>Sender:</strong> ${fromEmail}</p>
            <p style="margin: 0;"><strong>Recipient:</strong> ${targetEmail}</p>
            <p style="margin: 0;"><strong>Status:</strong> Successfully delivered via SendGrid API</p>
          </div>
          <p>When you reply to any ticket in the Helpdesk web dashboard, your customers will automatically receive an email response from this address.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Helpdesk System &bull; Code with Mosh Architecture</p>
        </div>
      `,
    });

    console.log(`\n✅ SUCCESS! Email sent successfully! Status code: ${res[0].statusCode}`);
    console.log(`📬 Check the inbox of: ${targetEmail}`);
  } catch (err: any) {
    console.error(`\n❌ SendGrid Delivery Failed:`);
    if (err?.response?.body?.errors) {
      console.error(JSON.stringify(err.response.body.errors, null, 2));
    } else {
      console.error(err.message || err);
    }

    console.log(`\n💡 Common troubleshooting tips:`);
    console.log(`   1. "The from address does not match a verified Sender Identity":`);
    console.log(`      Go to SendGrid -> Settings -> Sender Authentication -> Single Sender Verification and verify ${fromEmail}`);
    console.log(`   2. "Authorization Required / Forbidden": Check if your API Key has 'Mail Send' access.`);
  }
}

testSend();
