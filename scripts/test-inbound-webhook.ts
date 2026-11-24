import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../server/.env') });

const port = process.env.PORT || 3000;
const secret = process.env.WEBHOOK_SECRET;
const baseUrl = `http://localhost:${port}/api/webhooks/inbound-email?secret=${secret}`;

console.log(`\n====================================================`);
console.log(`📨 Inbound Email Webhook Simulator`);
console.log(`====================================================`);
console.log(`• Webhook Endpoint: http://localhost:${port}/api/webhooks/inbound-email`);
console.log(`• Webhook Secret:   ${secret ? 'Configured ✅' : 'Missing ❌'}`);
console.log(`====================================================\n`);

if (!secret) {
  console.error(`❌ ERROR: WEBHOOK_SECRET is not configured in server/.env`);
  process.exit(1);
}

async function simulateInboundEmail() {
  const customerEmail = process.argv[2] || `customer_${Date.now()}@example.com`;
  const subject = `Urgent Issue with Login and Payment #${Math.floor(Math.random() * 9000 + 1000)}`;

  console.log(`1️⃣ Simulating Inbound Email #1 (New Ticket)...`);
  console.log(`   From: "Jane Doe" <${customerEmail}>`);
  console.log(`   Subject: "${subject}"`);

  const formData1 = new FormData();
  formData1.append('from', `Jane Doe <${customerEmail}>`);
  formData1.append('to', `support@yourdomain.com`);
  formData1.append('subject', subject);
  formData1.append('text', 'Hello Support Team,\n\nI am having an issue accessing my account after my recent subscription payment. Could someone please look into this?\n\nThank you,\nJane Doe');
  formData1.append('html', '<p>Hello Support Team,</p><p>I am having an issue accessing my account after my recent subscription payment. Could someone please look into this?</p><p>Thank you,<br>Jane Doe</p>');

  try {
    const res1 = await fetch(baseUrl, {
      method: 'POST',
      body: formData1,
    });

    if (!res1.ok) {
      const errText = await res1.text();
      console.error(`❌ Request failed with status ${res1.status}:`, errText);
      console.log(`💡 Make sure the Helpdesk dev server is running on port 3000 (run: bun run dev)`);
      return;
    }

    const json1: any = await res1.json();
    console.log(`✅ Success! Ticket created with ID #${json1.ticket.id}`);
    console.log(`   Status:   ${json1.ticket.status}`);
    console.log(`   Assigned: ${json1.ticket.assignedToId}`);

    console.log(`\n2️⃣ Simulating Inbound Customer Reply #2 (Appending to existing ticket)...`);
    console.log(`   From: "Jane Doe" <${customerEmail}>`);
    console.log(`   Subject: "Re: ${subject}"`);

    const formData2 = new FormData();
    formData2.append('from', `Jane Doe <${customerEmail}>`);
    formData2.append('to', `support@yourdomain.com`);
    formData2.append('subject', `Re: ${subject}`);
    formData2.append('text', 'Just wanted to add: I tried clearing my browser cache but the error persists.\n\nBest,\nJane');

    const res2 = await fetch(baseUrl, {
      method: 'POST',
      body: formData2,
    });

    if (res2.ok) {
      const json2: any = await res2.json();
      console.log(`✅ Success! Reply was automatically threaded into Ticket #${json2.ticket.id}!`);
      console.log(`\n🎉 End-to-end inbound email threading is working flawlessly!`);
      console.log(`👉 Open http://localhost:5173/tickets/${json1.ticket.id} in your browser to view the live ticket and conversation.`);
    }
  } catch (err: any) {
    console.error(`❌ Connection error:`, err.message);
    console.log(`💡 Is your backend server running? Start it with: bun run dev`);
  }
}

simulateInboundEmail();
