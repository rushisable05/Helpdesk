export interface SeedTicket {
  subject: string;
  body: string;
  status: 'open' | 'resolved' | 'closed';
  category: 'technical_question' | 'general_question' | 'refund_request' | null;
  senderName: string;
  senderEmail: string;
  daysAgo: number;
  hoursAgo: number;
  replies?: {
    senderType: 'customer' | 'agent';
    body: string;
    minutesAfter: number;
  }[];
}

export const rawTicketsData: SeedTicket[] = [
  // --- A ---
  {
    subject: "API response timeout during peak traffic hours",
    body: "Our frontend microservice is experiencing frequent 504 gateway timeout errors when calling GET /api/v1/orders between 2 PM and 5 PM UTC.",
    status: "open",
    category: "technical_question",
    senderName: "Alice Johnson",
    senderEmail: "alice.johnson@techcorp.io",
    daysAgo: 0,
    hoursAgo: 2,
    replies: [
      { senderType: "agent", body: "Hello Alice, we are investigating our database connection pools on the orders microservice. A fix is being deployed.", minutesAfter: 45 }
    ]
  },
  {
    subject: "Authentication cookie expiring too early on mobile Safari",
    body: "Users on iOS Safari report being logged out every 15 minutes even though 'Remember Me' is enabled and session duration is set to 30 days.",
    status: "open",
    category: "technical_question",
    senderName: "Aaron Miller",
    senderEmail: "aaron@mobilefirst.dev",
    daysAgo: 1,
    hoursAgo: 4
  },
  {
    subject: "Automatic invoice generation failed for November billing cycle",
    body: "Our automated monthly invoice #INV-2026-11 was not emailed to our accounts payable department. Could you generate and send the PDF?",
    status: "resolved",
    category: "general_question",
    senderName: "Amara Diallo",
    senderEmail: "amara@financesolutions.org",
    daysAgo: 2,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "Invoice #INV-2026-11 has been re-generated and sent to your accounts email. You can also download it from Billing Settings.", minutesAfter: 20 },
      { senderType: "customer", body: "Received, thank you so much for the quick resolution!", minutesAfter: 35 }
    ]
  },
  {
    subject: "Accidental double charge on corporate Mastercard",
    body: "We upgraded our team workspace from 10 to 15 seats yesterday, and two identical charges of $150 appeared on our credit card statement.",
    status: "resolved",
    category: "refund_request",
    senderName: "Alan Turing",
    senderEmail: "alan.t@bletchley-labs.co.uk",
    daysAgo: 3,
    hoursAgo: 6,
    replies: [
      { senderType: "agent", body: "We verified the duplicate charge and issued a refund of $150. It should reflect in 3-5 business days.", minutesAfter: 30 }
    ]
  },

  // --- B ---
  {
    subject: "Billing receipt missing company European VAT number",
    body: "We updated our tax ID in settings (FR823482910) but the latest invoice still displays 0% VAT with no ID listed. We need a compliant tax invoice.",
    status: "open",
    category: "general_question",
    senderName: "Baptiste Renault",
    senderEmail: "baptiste@agence-paris.fr",
    daysAgo: 1,
    hoursAgo: 7
  },
  {
    subject: "Bulk export to CSV generates empty 0-byte file",
    body: "When selecting all 450 contacts in the CRM view and clicking 'Export to CSV', the downloaded file is named contacts.csv but has 0 bytes.",
    status: "open",
    category: "technical_question",
    senderName: "Brooke Simmons",
    senderEmail: "brooke@growthlabs.io",
    daysAgo: 4,
    hoursAgo: 3
  },
  {
    subject: "Button text unreadable in dark mode contrast ratio",
    body: "The secondary action button in the modal dialog has #71717A text on #27272A background, which fails WCAG AA accessibility standards.",
    status: "resolved",
    category: "technical_question",
    senderName: "Brendan Eich",
    senderEmail: "brendan@standards-web.org",
    daysAgo: 5,
    hoursAgo: 11,
    replies: [
      { senderType: "agent", body: "Thanks Brendan! This was resolved in v2.4.1. Contrast ratio is now 4.8:1.", minutesAfter: 120 }
    ]
  },
  {
    subject: "Business partnership and reseller inquiry",
    body: "We are an IT MSP servicing 200+ small businesses across Ohio. We would love to discuss distributor pricing and partner tiers.",
    status: "closed",
    category: null,
    senderName: "Benjamin Vance",
    senderEmail: "bvance@buckeye-it.com",
    daysAgo: 12,
    hoursAgo: 5,
    replies: [
      { senderType: "agent", body: "Forwarded your inquiry to our partnerships lead. They will reach out by Friday.", minutesAfter: 60 }
    ]
  },

  // --- C ---
  {
    subject: "Cannot invite team members with subdomains in their email",
    body: "Whenever I invite users with emails like user@eng.company.com, the validation regex fails saying 'invalid email format'.",
    status: "open",
    category: "technical_question",
    senderName: "Carlos Mendez",
    senderEmail: "carlos@eng.company.com",
    daysAgo: 2,
    hoursAgo: 3
  },
  {
    subject: "CORS policy blocking cross-origin asset requests from CDN",
    body: "Custom font files on cdn.ourdomain.com are blocked by CORS policy because the Access-Control-Allow-Origin header is missing on font files.",
    status: "resolved",
    category: "technical_question",
    senderName: "Chloe Davenport",
    senderEmail: "chloe@designstudio.net",
    daysAgo: 6,
    hoursAgo: 14,
    replies: [
      { senderType: "agent", body: "We have updated the S3 and CloudFront distribution CORS headers. Please test again.", minutesAfter: 40 },
      { senderType: "customer", body: "Working perfectly now, thank you!", minutesAfter: 55 }
    ]
  },
  {
    subject: "Cancellation request and prorated refund for unused months",
    body: "Our project has concluded early so we no longer need the Pro subscription. Can we get a prorated refund for the remaining 7 months of our annual plan?",
    status: "resolved",
    category: "refund_request",
    senderName: "Colin Firth",
    senderEmail: "colin@production-house.co.uk",
    daysAgo: 7,
    hoursAgo: 9,
    replies: [
      { senderType: "agent", body: "Your subscription has been cancelled and a prorated refund of $168.50 has been processed to your original card.", minutesAfter: 15 }
    ]
  },
  {
    subject: "Can we sign a Business Associate Agreement (BAA) for HIPAA?",
    body: "Our clinic intends to use your helpdesk for patient inquiries. Do you sign HIPAA BAAs for enterprise tier customers?",
    status: "open",
    category: "general_question",
    senderName: "Dr. Catherine Hayes",
    senderEmail: "chayes@stjude-health.org",
    daysAgo: 3,
    hoursAgo: 5
  },

  // --- D ---
  {
    subject: "Database connection pool exhausted under concurrent test load",
    body: "During our automated load testing with 500 virtual users, the backend server throws PrismaClientInitializationError: Connection pool timeout.",
    status: "open",
    category: "technical_question",
    senderName: "Daniel Kim",
    senderEmail: "dkim@scalableapps.io",
    daysAgo: 0,
    hoursAgo: 5
  },
  {
    subject: "Duplicate subscription created due to browser timeout",
    body: "The payment page spinner hung during checkout, so I refreshed and submitted again. I received two confirmation emails with two subscription IDs.",
    status: "resolved",
    category: "refund_request",
    senderName: "David O'Connor",
    senderEmail: "doconnor@ireland-tech.ie",
    daysAgo: 8,
    hoursAgo: 10,
    replies: [
      { senderType: "agent", body: "We have cancelled the duplicate subscription (#SUB-9941) and refunded $49.", minutesAfter: 18 }
    ]
  },
  {
    subject: "Do you offer educational discounts for university computer science labs?",
    body: "I am a professor at UC Berkeley teaching cloud computing. Can our class of 60 students get access to educational licenses?",
    status: "closed",
    category: "general_question",
    senderName: "Prof. Douglas Hofstadter",
    senderEmail: "douglas@cs.berkeley.edu",
    daysAgo: 14,
    hoursAgo: 2,
    replies: [
      { senderType: "agent", body: "We would love to sponsor your class! We generated an education license key for 60 seats.", minutesAfter: 45 }
    ]
  },
  {
    subject: "Documentation link for Webhook HMAC verification is broken",
    body: "The link in Settings pointing to 'https://docs.helpdesk.dev/security/hmac' returns a 404 page.",
    status: "resolved",
    category: "general_question",
    senderName: "Deepak Sharma",
    senderEmail: "deepak@fintech-mumbai.in",
    daysAgo: 9,
    hoursAgo: 4
  },

  // --- E ---
  {
    subject: "Email notifications delayed by more than 45 minutes",
    body: "Inbound ticket notifications that usually arrive within seconds are arriving with delays of 30-45 minutes according to email headers.",
    status: "open",
    category: "technical_question",
    senderName: "Emma Watson",
    senderEmail: "emma.w@appbuilders.io",
    daysAgo: 1,
    hoursAgo: 6
  },
  {
    subject: "Enterprise SSO SAML 2.0 integration setup instructions needed",
    body: "Our IT security team is setting up Okta SAML 2.0 for single sign-on. Where can we find your ACS URL and Entity ID?",
    status: "resolved",
    category: "general_question",
    senderName: "Ethan Vance",
    senderEmail: "evance@globalenterprise.com",
    daysAgo: 10,
    hoursAgo: 7,
    replies: [
      { senderType: "agent", body: "Hi Ethan, our ACS URL is https://auth.helpdesk.dev/sso/saml/callback and Entity ID is helpdesk-saml-prod. Full setup guide attached.", minutesAfter: 25 }
    ]
  },
  {
    subject: "Exported PDF report truncated on right margin on A4 paper",
    body: "When generating customer ticket metrics and selecting A4 format, the 4th and 5th columns are sliced off.",
    status: "open",
    category: "technical_question",
    senderName: "Elena Rostova",
    senderEmail: "elena@analytics-moscow.ru",
    daysAgo: 4,
    hoursAgo: 12
  },

  // --- F ---
  {
    subject: "File upload failing for video attachments larger than 25MB",
    body: "When a customer attempts to attach a 32MB .mp4 screen recording, the progress bar hits 100% and then shows 'Payload Too Large (413)'.",
    status: "open",
    category: "technical_question",
    senderName: "Felix Hartmann",
    senderEmail: "felix@cachebuster.dev",
    daysAgo: 2,
    hoursAgo: 9
  },
  {
    subject: "Forgot password reset link throwing 403 Forbidden error",
    body: "When clicking the reset link in the email 'https://app.helpdesk.dev/auth/reset-password?token=...', the browser renders a blank 403 page.",
    status: "resolved",
    category: "technical_question",
    senderName: "Fatima Al-Mansoor",
    senderEmail: "fatima@gulfinvest.ae",
    daysAgo: 11,
    hoursAgo: 6,
    replies: [
      { senderType: "agent", body: "We identified an issue with URL encoding in token links which has now been patched. Please request a new link.", minutesAfter: 15 }
    ]
  },
  {
    subject: "Full refund request for dissatisfied annual plan purchase",
    body: "We signed up for the annual plan 3 days ago. The software lacks the multi-department hierarchy we require, so we request a refund under your 14-day policy.",
    status: "resolved",
    category: "refund_request",
    senderName: "Franklin Roosevelt",
    senderEmail: "franklin@logistics-corp.com",
    daysAgo: 13,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "Your refund of $588 has been issued in full. We appreciate your feedback.", minutesAfter: 22 }
    ]
  },
  {
    subject: "Feature request: Ability to merge duplicate customer tickets",
    body: "Customers frequently send 2 or 3 emails about the same issue. It would be extremely helpful if agents could merge tickets into a single thread.",
    status: "closed",
    category: null,
    senderName: "Fiona Gallagher",
    senderEmail: "fiona@gallagher-retail.com",
    daysAgo: 18,
    hoursAgo: 4
  },

  // --- G ---
  {
    subject: "Google Workspace OAuth login looping infinitely on consent screen",
    body: "When logging in via 'Sign in with Google', after choosing the Google account it redirects back to the login page without creating a session.",
    status: "open",
    category: "technical_question",
    senderName: "George Hamilton",
    senderEmail: "george@mobilefirst.io",
    daysAgo: 3,
    hoursAgo: 8
  },
  {
    subject: "GraphQL query returning partial null fields for ticket replies",
    body: "In the GraphQL API, ticket.replies[].user is coming back as null even when the reply was posted by a registered agent.",
    status: "open",
    category: "technical_question",
    senderName: "Gita Gopinath",
    senderEmail: "gita@economics-dev.org",
    daysAgo: 5,
    hoursAgo: 7
  },
  {
    subject: "Grace period inquiry after company credit card expired",
    body: "Our credit card expired at the end of October. Will our agents lose access before our new card arrives next Tuesday?",
    status: "resolved",
    category: "general_question",
    senderName: "Guillermo Del Toro",
    senderEmail: "guillermo@miracle-studios.mx",
    daysAgo: 15,
    hoursAgo: 5,
    replies: [
      { senderType: "agent", body: "Hi Guillermo, we provide a 14-day grace period for payment updates. Your account will remain fully functional.", minutesAfter: 10 }
    ]
  },

  // --- H ---
  {
    subject: "High CPU usage when loading analytics dashboard with 10k tickets",
    body: "Opening the Analytics tab causes the browser tab CPU to spike to 100% and freezes Chrome for 8-10 seconds while rendering the SVG chart.",
    status: "open",
    category: "technical_question",
    senderName: "Hans Mueller",
    senderEmail: "hans@mueller-gmbh.de",
    daysAgo: 2,
    hoursAgo: 1
  },
  {
    subject: "How do I transfer workspace ownership to another administrator?",
    body: "Our primary administrator is transitioning to another department. What are the steps to make Jane Doe (jane@acme.com) the new account owner?",
    status: "resolved",
    category: "general_question",
    senderName: "Haruto Takahashi",
    senderEmail: "haruto@tokyo-robotics.jp",
    daysAgo: 16,
    hoursAgo: 9,
    replies: [
      { senderType: "agent", body: "You can transfer ownership by going to Workspace Settings -> Members -> Jane Doe -> Change Role to Owner.", minutesAfter: 12 }
    ]
  },
  {
    subject: "How to configure custom webhook retry policy with exponential backoff?",
    body: "If our receiving server returns a 503, how many times will your webhook system retry and what is the interval between attempts?",
    status: "resolved",
    category: "general_question",
    senderName: "Hannah Abbott",
    senderEmail: "hannah@devcraft.uk",
    daysAgo: 17,
    hoursAgo: 3
  },

  // --- I ---
  {
    subject: "Integration with Slack not posting messages to alert channels",
    body: "We configured the Slack incoming webhook URL for #support-urgent, but tickets marked urgent do not trigger any notifications.",
    status: "open",
    category: "technical_question",
    senderName: "Ingrid Bauer",
    senderEmail: "ingrid@eufinance.de",
    daysAgo: 3,
    hoursAgo: 10
  },
  {
    subject: "Invoice currency changed unexpectedly to EUR instead of USD",
    body: "Our account has always billed in USD, but this month's invoice #INV-4919 shows 49.00 EUR. Please correct the billing currency.",
    status: "resolved",
    category: "general_question",
    senderName: "Ian Malcolm",
    senderEmail: "ian@jurassic-research.com",
    daysAgo: 19,
    hoursAgo: 7,
    replies: [
      { senderType: "agent", body: "The currency mismatch was caused by an IP geo-lookup update. We have reset your account currency to USD.", minutesAfter: 20 }
    ]
  },
  {
    subject: "Intermittent 502 bad gateway on /api/v1/tickets during bulk import",
    body: "When importing tickets via the REST API in batches of 50, roughly 1 in 10 requests fails with a 502 Bad Gateway response from Nginx.",
    status: "open",
    category: "technical_question",
    senderName: "Ibrahim Traore",
    senderEmail: "ibrahim@sahel-dev.bf",
    daysAgo: 4,
    hoursAgo: 6
  },
  {
    subject: "Incorrect tax rate applied on invoice for Australian business",
    body: "We were charged 10% GST even though we submitted our Australian Business Number (ABN) and are exempt from international digital sales tax.",
    status: "resolved",
    category: "refund_request",
    senderName: "Isabella Smith",
    senderEmail: "isabella@sydney-design.com.au",
    daysAgo: 20,
    hoursAgo: 4,
    replies: [
      { senderType: "agent", body: "We have validated your ABN and refunded the AU$14.20 tax amount.", minutesAfter: 35 }
    ]
  },

  // --- J ---
  {
    subject: "JWT token validation failing across distributed microservices",
    body: "The auth service issues a JWT with RS256, but the tickets service throws JsonWebTokenError: invalid signature when verifying with the public JWKS.",
    status: "open",
    category: "technical_question",
    senderName: "James O'Brien",
    senderEmail: "james.obrien@startup.co",
    daysAgo: 0,
    hoursAgo: 7
  },
  {
    subject: "Javascript error on ticket creation modal: Uncaught TypeError",
    body: "Console shows: 'Cannot read properties of undefined (reading target)' whenever an agent clicks 'New Ticket' while viewing an existing ticket.",
    status: "resolved",
    category: "technical_question",
    senderName: "Jennifer Lee",
    senderEmail: "jennifer.lee@inbox.com",
    daysAgo: 21,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "This bug was fixed in the latest patch release deployed this afternoon.", minutesAfter: 40 }
    ]
  },
  {
    subject: "Job queue workers getting stuck in processing state for email sync",
    body: "Redis BullMQ queue shows 14 jobs permanently stuck in 'active' state with 0% CPU. Inbound emails stopped syncing 3 hours ago.",
    status: "open",
    category: "technical_question",
    senderName: "Jake Morrison",
    senderEmail: "jake@morrisontech.com",
    daysAgo: 1,
    hoursAgo: 2
  },

  // --- K ---
  {
    subject: "Kafka consumer group lag increasing rapidly on ticket events topic",
    body: "The partition lag on helpdesk-ticket-events reached 45,000 messages. Consumers appear to be deadlocked during deserialization.",
    status: "open",
    category: "technical_question",
    senderName: "Klaus Schmidt",
    senderEmail: "klaus@datenschutz.de",
    daysAgo: 5,
    hoursAgo: 2
  },
  {
    subject: "Knowledge base article search returning 0 matches for common terms",
    body: "Searching for 'password reset' or 'billing' in the public help center returns 'No articles found', despite those articles existing and published.",
    status: "resolved",
    category: "technical_question",
    senderName: "Kevin Wright",
    senderEmail: "kevin@wrightco.com",
    daysAgo: 22,
    hoursAgo: 6,
    replies: [
      { senderType: "agent", body: "The PostgreSQL full-text search index had stalled. We re-indexed the articles table.", minutesAfter: 15 }
    ]
  },
  {
    subject: "Keyboard navigation inaccessible in reply editor modal",
    body: "Pressing Tab skips over the rich text formatting toolbar and jumps directly to the Submit button. Screen reader users cannot format text.",
    status: "closed",
    category: "technical_question",
    senderName: "Kiran Mazumdar",
    senderEmail: "kiran@a11y-advocacy.in",
    daysAgo: 25,
    hoursAgo: 5
  },

  // --- L ---
  {
    subject: "Loading spinner does not disappear after customer submits form",
    body: "Even though the ticket is created successfully in the backend, the submit button remains in a disabled loading state on the customer portal.",
    status: "resolved",
    category: "technical_question",
    senderName: "Laura Martinez",
    senderEmail: "laura.m@oldcompany.com",
    daysAgo: 23,
    hoursAgo: 4,
    replies: [
      { senderType: "agent", body: "Fixed! The onSuccess callback in the React mutation was missing an event handler reset.", minutesAfter: 18 }
    ]
  },
  {
    subject: "Log retention policy configuration inquiry for enterprise plan",
    body: "Under our regulatory compliance, we need audit logs stored for 7 years. Does your system support S3 bucket streaming for log archiving?",
    status: "open",
    category: "general_question",
    senderName: "Liam Thompson",
    senderEmail: "liam@cloudops.dev",
    daysAgo: 6,
    hoursAgo: 5
  },
  {
    subject: "License tier downgrade request from Enterprise to Professional",
    body: "We downsized our support team from 25 to 8 agents. Please downgrade our account effective next billing cycle and confirm new pricing.",
    status: "resolved",
    category: "general_question",
    senderName: "Lisa Wong",
    senderEmail: "lisa.wong@photopro.com",
    daysAgo: 24,
    hoursAgo: 7,
    replies: [
      { senderType: "agent", body: "Your account is scheduled to downgrade to Professional on Dec 1st. Your monthly bill will adjust to $240.", minutesAfter: 30 }
    ]
  },

  // --- M ---
  {
    subject: "Memory leak observed on long-running node worker processes",
    body: "The worker process RAM usage climbs linearly by ~50MB per hour until PM2 restarts it with an out-of-memory crash every 12 hours.",
    status: "open",
    category: "technical_question",
    senderName: "Marcus Chen",
    senderEmail: "marcus.chen@techcorp.io",
    daysAgo: 1,
    hoursAgo: 8
  },
  {
    subject: "Missing receipt for wire transfer payment of invoice #INV-3829",
    body: "Our bank transferred $2,400 via SWIFT wire on Monday. We need an official stamped payment receipt for tax filing.",
    status: "resolved",
    category: "general_question",
    senderName: "Michael Scott",
    senderEmail: "michael@dundermifflin.com",
    daysAgo: 25,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "Hello Michael, attached is the stamped payment receipt confirming receipt of funds.", minutesAfter: 25 }
    ]
  },
  {
    subject: "Mobile viewport horizontal scrollbar appearing on iPhone 15 Safari",
    body: "The ticket detail page causes a 20px horizontal overflow on screens under 390px width due to a hardcoded min-width on table headers.",
    status: "resolved",
    category: "technical_question",
    senderName: "Maria Garcia",
    senderEmail: "maria@creativeco.com",
    daysAgo: 26,
    hoursAgo: 4
  },
  {
    subject: "Money back guarantee refund request within 30 days of purchase",
    body: "I purchased the software on Nov 5th. It does not meet our workflow requirements. Please issue a refund under the 30-day guarantee.",
    status: "resolved",
    category: "refund_request",
    senderName: "Miles Morales",
    senderEmail: "miles@spidey-media.nyc",
    daysAgo: 16,
    hoursAgo: 11,
    replies: [
      { senderType: "agent", body: "Refund of $99 has been approved and processed back to your original payment method.", minutesAfter: 15 }
    ]
  },

  // --- N ---
  {
    subject: "Next.js server-side rendering error on ticket detail page route",
    body: "Navigating to /tickets/104 produces a runtime error: 'Text content does not match server-rendered HTML' caused by Date formatting mismatch.",
    status: "open",
    category: "technical_question",
    senderName: "Nina Kowalski",
    senderEmail: "nina@agencyplus.com",
    daysAgo: 0,
    hoursAgo: 9
  },
  {
    subject: "Notification bell icon counter out of sync with unread messages",
    body: "The badge on the top navigation displays '9+' unread tickets even after all tickets in the inbox have been opened and read.",
    status: "resolved",
    category: "technical_question",
    senderName: "Natasha Ivanova",
    senderEmail: "natasha@rustech.ru",
    daysAgo: 27,
    hoursAgo: 5,
    replies: [
      { senderType: "agent", body: "A cache invalidation bug in the notification socket was resolved. Refresh your page to see the accurate count.", minutesAfter: 20 }
    ]
  },
  {
    subject: "Need Data Processing Agreement (DPA) and SOC2 compliance report",
    body: "Our security risk assessment team requires a signed DPA and your latest SOC2 Type 2 executive summary before our pilot launch.",
    status: "open",
    category: "general_question",
    senderName: "Neil Armstrong",
    senderEmail: "neil@aerospace-consulting.com",
    daysAgo: 7,
    hoursAgo: 2
  },

  // --- O ---
  {
    subject: "OAuth refresh token rotation causing premature agent logout",
    body: "When two tabs are open simultaneously, token rotation invalidates the refresh token on the second tab, kicking the agent to the login screen.",
    status: "open",
    category: "technical_question",
    senderName: "Olivia Taylor",
    senderEmail: "olivia.t@personalmail.com",
    daysAgo: 2,
    hoursAgo: 11
  },
  {
    subject: "Organization invite link expired before employee could accept",
    body: "We sent an invitation link to dev@ourcompany.com, but by the time they opened it Monday morning, it reported 'Link has expired'. Can you resend?",
    status: "resolved",
    category: "general_question",
    senderName: "Omar Sy",
    senderEmail: "omar@lupin-security.fr",
    daysAgo: 28,
    hoursAgo: 6,
    replies: [
      { senderType: "agent", body: "We extended invite link validity to 7 days and resent the invitation to dev@ourcompany.com.", minutesAfter: 10 }
    ]
  },
  {
    subject: "Order #84920 duplicate transaction refund request",
    body: "Our credit card was billed twice for transaction #84920 on Nov 12th. Please refund the $79 duplicate fee.",
    status: "resolved",
    category: "refund_request",
    senderName: "Oscar Isaac",
    senderEmail: "oscar@dune-cinematics.com",
    daysAgo: 9,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "Duplicate transaction refunded. Receipt sent to your email.", minutesAfter: 12 }
    ]
  },

  // --- P ---
  {
    subject: "Pagination resets to page 1 upon sorting any table column",
    body: "If I am on Page 5 of the tickets list and click on the 'Sender' header to sort alphabetically, it unexpectedly jumps back to Page 1.",
    status: "open",
    category: "technical_question",
    senderName: "Priya Patel",
    senderEmail: "priya@devstudio.com",
    daysAgo: 1,
    hoursAgo: 10
  },
  {
    subject: "Password complexity requirement explanation needed for users",
    body: "Several users report being unable to register passwords containing symbols like # and @. What is the exact password policy?",
    status: "resolved",
    category: "general_question",
    senderName: "Patrick O'Sullivan",
    senderEmail: "patrick@osullivan.me",
    daysAgo: 29,
    hoursAgo: 7,
    replies: [
      { senderType: "agent", body: "Passwords must be at least 8 characters and include at least 1 number. Special symbols are allowed and encouraged.", minutesAfter: 15 }
    ]
  },
  {
    subject: "Payment gateway webhook signature mismatch error in logs",
    body: "Our server logs show repeated 'StripeSignatureVerificationError: No signatures found matching the expected signature for payload'.",
    status: "open",
    category: "technical_question",
    senderName: "Paul Anderson",
    senderEmail: "paul.anderson@corp.com",
    daysAgo: 3,
    hoursAgo: 11
  },
  {
    subject: "Press inquiry regarding recent series A funding announcement",
    body: "I am a reporter with TechCrunch writing an article on customer support automation. Does your executive team have 15 minutes for an interview?",
    status: "closed",
    category: null,
    senderName: "Penelope Cruz",
    senderEmail: "penelope@techcrunch-press.org",
    daysAgo: 26,
    hoursAgo: 3
  },

  // --- Q ---
  {
    subject: "Query parameters stripped on client-side redirect after login",
    body: "When visiting /tickets/42 while unauthenticated, after logging in the user is redirected to / rather than back to /tickets/42.",
    status: "open",
    category: "technical_question",
    senderName: "Quentin Tarantino",
    senderEmail: "quentin@pulp-productions.com",
    daysAgo: 4,
    hoursAgo: 8
  },
  {
    subject: "Quarterly subscription renewal cancellation request",
    body: "Please cancel our quarterly renewal scheduled for Dec 1st and ensure no recurring charges occur on our card.",
    status: "resolved",
    category: "general_question",
    senderName: "Quincy Jones",
    senderEmail: "quincy@motown-sound.org",
    daysAgo: 27,
    hoursAgo: 2,
    replies: [
      { senderType: "agent", body: "Your quarterly subscription renewal has been successfully stopped. You will retain access until Dec 1st.", minutesAfter: 14 }
    ]
  },
  {
    subject: "Quota increase request for inbound webhook endpoints",
    body: "We are currently capped at 10,000 webhook events per day and expect to hit 25,000 during our Black Friday sales weekend. Can our limit be raised?",
    status: "resolved",
    category: "general_question",
    senderName: "Qasim Ali",
    senderEmail: "qasim@karachi-ecom.pk",
    daysAgo: 8,
    hoursAgo: 5,
    replies: [
      { senderType: "agent", body: "We have temporarily increased your inbound webhook limit to 50,000 events/day for the holiday season at no extra charge.", minutesAfter: 25 }
    ]
  },

  // --- R ---
  {
    subject: "Rate limit exceeded header missing Retry-After response value",
    body: "When our automated scraper receives a 429 Too Many Requests response, the Retry-After HTTP header is empty instead of containing seconds to wait.",
    status: "open",
    category: "technical_question",
    senderName: "Rachel Green",
    senderEmail: "rachel.green@marketing.co",
    daysAgo: 0,
    hoursAgo: 11
  },
  {
    subject: "Refund request: accidental team tier upgrade by non-admin employee",
    body: "One of our junior developers clicked 'Upgrade to Team' which billed $199. Only our procurement officer is authorized to make purchases. Please refund.",
    status: "resolved",
    category: "refund_request",
    senderName: "Robert Chang",
    senderEmail: "robert@ecommerce-store.com",
    daysAgo: 10,
    hoursAgo: 9,
    replies: [
      { senderType: "agent", body: "We have rolled back the account to the individual plan and refunded $199. You can also restrict upgrade permissions under Team Settings.", minutesAfter: 18 }
    ]
  },
  {
    subject: "Role-based access control not restricting agent from viewing billing",
    body: "An agent with the 'Support Agent' role was able to navigate directly to /settings/billing and view our payment history. This should be admin-only.",
    status: "open",
    category: "technical_question",
    senderName: "Ryan Patel",
    senderEmail: "ryan@webagency.co",
    daysAgo: 3,
    hoursAgo: 1
  },
  {
    subject: "Request for white-labeling and custom CSS styling options",
    body: "We want to embed the helpdesk widget into our SaaS app and remove the 'Powered by Helpdesk' branding. Which tier includes this?",
    status: "resolved",
    category: "general_question",
    senderName: "Rania Youssef",
    senderEmail: "rania@cairo-tech.eg",
    daysAgo: 28,
    hoursAgo: 3
  },

  // --- S ---
  {
    subject: "Session timeout triggering after only 5 minutes of inactivity",
    body: "Our agents are constantly getting logged out while drafting lengthy replies. The session timeout should be at least 2 hours.",
    status: "open",
    category: "technical_question",
    senderName: "Sara Johansson",
    senderEmail: "sara@nordicdesign.se",
    daysAgo: 1,
    hoursAgo: 1
  },
  {
    subject: "SSL certificate expiration warning received for custom domain",
    body: "Let's Encrypt sent an alert stating the certificate for support.ourcompany.com expires in 3 days and auto-renewal has failed.",
    status: "resolved",
    category: "technical_question",
    senderName: "Sofia Rodriguez",
    senderEmail: "sofia@webworks.net",
    daysAgo: 11,
    hoursAgo: 11,
    replies: [
      { senderType: "agent", body: "Our ACME challenge DNS record was refreshed and a new 90-day SSL certificate has been installed.", minutesAfter: 35 }
    ]
  },
  {
    subject: "Search autocomplete returning irrelevant results with special characters",
    body: "Typing C# or C++ into the ticket search box causes the backend SQL query to fail or return every ticket containing the letter C.",
    status: "open",
    category: "technical_question",
    senderName: "Stephen Hawking",
    senderEmail: "stephen@cambridge-physics.ac.uk",
    daysAgo: 5,
    hoursAgo: 9
  },
  {
    subject: "Service credit request for 4-hour unscheduled downtime last Tuesday",
    body: "Per our Service Level Agreement (SLA 99.9%), the 4-hour database outage entitles our account to a 10% monthly service credit.",
    status: "resolved",
    category: "refund_request",
    senderName: "Sandra Miller",
    senderEmail: "sandra@trainingco.com",
    daysAgo: 12,
    hoursAgo: 6,
    replies: [
      { senderType: "agent", body: "We deeply apologize for the outage. A 10% credit ($35.00) has been applied to your upcoming December invoice.", minutesAfter: 20 }
    ]
  },

  // --- T ---
  {
    subject: "Two-factor authentication backup codes not accepted during recovery",
    body: "My authenticator phone was lost, and when entering my 8-digit emergency backup code, the system says 'Invalid code format'.",
    status: "open",
    category: "technical_question",
    senderName: "Tom Baker",
    senderEmail: "tom.baker@smallbiz.com",
    daysAgo: 2,
    hoursAgo: 12
  },
  {
    subject: "Ticket assignment notification not delivered to newly added agent",
    body: "Tickets assigned to agent Sarah are not showing in her notifications tray, although they show correctly in the assigned tickets list.",
    status: "resolved",
    category: "technical_question",
    senderName: "Tariq Mansour",
    senderEmail: "tariq@beirut-dev.lb",
    daysAgo: 13,
    hoursAgo: 7,
    replies: [
      { senderType: "agent", body: "Sarah's notification preferences had 'Email only' checked. We updated her settings to include in-app notifications.", minutesAfter: 15 }
    ]
  },
  {
    subject: "Transfer billing to annual invoice payment via purchase order (PO)",
    body: "Our accounts department requires Net-30 payment terms via PO instead of automatic monthly credit card charges. Can we set this up?",
    status: "resolved",
    category: "general_question",
    senderName: "Timothy Dalton",
    senderEmail: "tdalton@mi6-procurement.gov.uk",
    daysAgo: 29,
    hoursAgo: 4
  },
  {
    subject: "Tax exemption certificate submission for 501(c)(3) nonprofit organization",
    body: "Attached is our IRS 501(c)(3) determination letter. Please update our account so sales tax is not charged on future invoices.",
    status: "closed",
    category: "general_question",
    senderName: "Theresa May",
    senderEmail: "theresa@charity-uk.org",
    daysAgo: 20,
    hoursAgo: 8
  },

  // --- U ---
  {
    subject: "Unable to download monthly expense breakdown report in Excel format",
    body: "Clicking 'Download Excel' on the Reports page shows a brief flash and then nothing downloads. Browser console shows net::ERR_CONNECTION_RESET.",
    status: "open",
    category: "technical_question",
    senderName: "Uma Thurman",
    senderEmail: "uma@killbill-films.com",
    daysAgo: 4,
    hoursAgo: 4
  },
  {
    subject: "Unexpected 500 error when uploading custom PNG avatar for agent profile",
    body: "Whenever I try to upload a 512x512 PNG avatar image, the server returns 500 Internal Server Error: Sharp was unable to decode image stream.",
    status: "resolved",
    category: "technical_question",
    senderName: "Ulysses Grant",
    senderEmail: "ulysses@union-defense.us",
    daysAgo: 14,
    hoursAgo: 5,
    replies: [
      { senderType: "agent", body: "We resolved an issue with the image processing pipeline handling 16-bit PNG files. Your avatar has been updated.", minutesAfter: 25 }
    ]
  },
  {
    subject: "Unrecognized charge of $49 on corporate American Express card",
    body: "There is a charge from HELPDESK*ONLINE on our card statement dated Nov 10th. Nobody in our office claims to have authorized this.",
    status: "resolved",
    category: "refund_request",
    senderName: "Ursula von der Leyen",
    senderEmail: "ursula@ec-commission.eu",
    daysAgo: 15,
    hoursAgo: 4,
    replies: [
      { senderType: "agent", body: "We traced this charge to an account created under marketing@ec-commission.eu. We cancelled the subscription and issued a full refund.", minutesAfter: 19 }
    ]
  },

  // --- V ---
  {
    subject: "Vulnerability disclosure: potential XSS in customer reply editor",
    body: "I noticed that customer replies containing <img src=x onerror=alert(1)> are sanitized, but SVG tags with embedded script blocks execute in the agent view.",
    status: "resolved",
    category: "technical_question",
    senderName: "Victor Okonkwo",
    senderEmail: "victor@nigeriabiz.ng",
    daysAgo: 17,
    hoursAgo: 10,
    replies: [
      { senderType: "agent", body: "Thank you for responsibly disclosing this! We deployed DOMPurify with strict SVG script filtering. You have been added to our Security Hall of Fame.", minutesAfter: 45 }
    ]
  },
  {
    subject: "Video tutorial buffering continuously on documentation pages",
    body: "The embedded videos explaining ticket routing buffer every 4 seconds. Are they hosted on a global CDN?",
    status: "closed",
    category: "general_question",
    senderName: "Valerie Adams",
    senderEmail: "valerie@kiwi-athletics.nz",
    daysAgo: 24,
    hoursAgo: 6
  },
  {
    subject: "VAT tax exemption certificate validation taking longer than expected",
    body: "We submitted our German USt-IdNr 5 days ago and the banner still says 'Verification Pending'. How long does manual review take?",
    status: "open",
    category: "general_question",
    senderName: "Volker Bruch",
    senderEmail: "volker@babylon-media.de",
    daysAgo: 5,
    hoursAgo: 4
  },

  // --- W ---
  {
    subject: "Webhook endpoint returning 401 Unauthorized after secret key rotation",
    body: "We rotated our WEBHOOK_SECRET yesterday in accordance with our 90-day security policy, and our receiver now rejects all inbound tickets with 401.",
    status: "open",
    category: "technical_question",
    senderName: "Winston Churchill",
    senderEmail: "winston@chartwell-heritage.org",
    daysAgo: 1,
    hoursAgo: 5
  },
  {
    subject: "WebSocket disconnected unexpectedly without automatic reconnection",
    body: "When an agent switches Wi-Fi networks, the real-time ticket stream drops and never attempts exponential reconnect backoff, requiring manual page refresh.",
    status: "open",
    category: "technical_question",
    senderName: "Wendy Rhoades",
    senderEmail: "wendy@axe-capital.com",
    daysAgo: 2,
    hoursAgo: 6
  },
  {
    subject: "Wrong company name printed on annual subscription tax invoice",
    body: "The invoice says 'Acme Inc' instead of our legal entity 'Acme International Holdings LLC'. Please re-issue invoice #INV-29401 with the correct name.",
    status: "resolved",
    category: "general_question",
    senderName: "Walter White",
    senderEmail: "walter@heisenberg-chem.com",
    daysAgo: 18,
    hoursAgo: 6,
    replies: [
      { senderType: "agent", body: "We updated your organization name and regenerated invoice #INV-29401. A revised copy has been sent to your billing email.", minutesAfter: 20 }
    ]
  },
  {
    subject: "Warranty and uptime SLA guarantee terms for multi-region hosting",
    body: "Could you provide your formal multi-region failover architecture documentation and financial SLA penalties for uptime drops below 99.95%?",
    status: "open",
    category: null,
    senderName: "Wyatt Earp",
    senderEmail: "wyatt@tombstone-law.com",
    daysAgo: 6,
    hoursAgo: 3
  },

  // --- X ---
  {
    subject: "XML sitemap returning 404 on public help center domain",
    body: "Google Search Console reports that https://help.ourcompany.com/sitemap.xml returns a 404 Not Found error, hurting our SEO indexation.",
    status: "resolved",
    category: "technical_question",
    senderName: "Xavier Hernandez",
    senderEmail: "xavier@barca-sports.es",
    daysAgo: 19,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "The dynamic sitemap generator route was missing in the reverse proxy config. It is now resolving properly with 200 OK.", minutesAfter: 22 }
    ]
  },
  {
    subject: "XLSX export corrupted for large customer databases over 50,000 rows",
    body: "When attempting to export 65,000 resolved tickets to Excel, Microsoft Excel reports 'We found a problem with some content in tickets.xlsx'.",
    status: "open",
    category: "technical_question",
    senderName: "Xiao Ming",
    senderEmail: "xiaoming@shanghai-fin.cn",
    daysAgo: 3,
    hoursAgo: 7
  },

  // --- Y ---
  {
    subject: "Yearly subscription auto-renewed without advance email notification",
    body: "Our annual plan renewed on Nov 14 for $1,200. We did not receive the standard 30-day advance reminder email, and we had planned to cancel.",
    status: "resolved",
    category: "refund_request",
    senderName: "Yuki Tanaka",
    senderEmail: "yuki@codelab.jp",
    daysAgo: 7,
    hoursAgo: 5,
    replies: [
      { senderType: "agent", body: "We apologize for the missing email notification. We cancelled the renewal and refunded the full $1,200 to your corporate card.", minutesAfter: 20 }
    ]
  },
  {
    subject: "YubiKey hardware security key setup failure for FIDO2 WebAuthn",
    body: "When inserting our YubiKey 5 NFC on Chrome macOS, the browser prompt says 'Security key not recognized or timed out'.",
    status: "open",
    category: "technical_question",
    senderName: "Youssef Chahine",
    senderEmail: "youssef@alexandria-films.eg",
    daysAgo: 5,
    hoursAgo: 6
  },

  // --- Z ---
  {
    subject: "Zapier integration trigger not firing when a ticket status changes",
    body: "We set up a Zap 'When ticket is resolved -> Send Slack notification'. Tickets marked resolved in Helpdesk do not trigger the Zapier webhook.",
    status: "open",
    category: "technical_question",
    senderName: "Zoe Mitchell",
    senderEmail: "zoe.mitchell@designstudio.co",
    daysAgo: 1,
    hoursAgo: 3
  },
  {
    subject: "Zero search results shown when filtering tickets by custom date range",
    body: "Selecting dates from Nov 1 to Nov 15 returns an empty list, even though dozens of tickets exist in that timeframe.",
    status: "resolved",
    category: "technical_question",
    senderName: "Zachary Taylor",
    senderEmail: "zachary@presidential-archive.org",
    daysAgo: 21,
    hoursAgo: 4,
    replies: [
      { senderType: "agent", body: "This was caused by the end date defaulting to 00:00:00 instead of 23:59:59. Date range queries now include the entire end day.", minutesAfter: 15 }
    ]
  },

  // --- Additional High-Quality Real-Life Tickets (Total 100) ---
  {
    subject: "Active Directory LDAP synchronization failing on password changes",
    body: "When an employee updates their password in Microsoft Active Directory, they cannot log into Helpdesk until an admin manually triggers an LDAP sync.",
    status: "open",
    category: "technical_question",
    senderName: "Arthur Dent",
    senderEmail: "arthur@galaxy-hitchhiker.co.uk",
    daysAgo: 2,
    hoursAgo: 5
  },
  {
    subject: "Billing statement shows incorrect billing address after company relocation",
    body: "We moved our corporate headquarters from Boston to Austin last month and updated the billing profile, but the invoice still lists Boston.",
    status: "resolved",
    category: "general_question",
    senderName: "Barbara Gordon",
    senderEmail: "barbara@gotham-pd.org",
    daysAgo: 22,
    hoursAgo: 8
  },
  {
    subject: "Customer satisfaction (CSAT) survey link in ticket email gives 404",
    body: "When customers click 'Rate your support experience' in the ticket resolution email, they land on a 404 page.",
    status: "resolved",
    category: "technical_question",
    senderName: "Charles Darwin",
    senderEmail: "charles@origin-science.org",
    daysAgo: 18,
    hoursAgo: 9,
    replies: [
      { senderType: "agent", body: "The survey route parameter was misconfigured. We corrected the link generator and tested it successfully.", minutesAfter: 20 }
    ]
  },
  {
    subject: "CSV upload of customer contacts fails on non-ASCII foreign characters",
    body: "Names containing accents like José, Müller, and François cause the CSV parser to throw 'Malformed UTF-8 string' on line 42.",
    status: "open",
    category: "technical_question",
    senderName: "Dmitri Mendeleev",
    senderEmail: "dmitri@periodic-chem.ru",
    daysAgo: 4,
    hoursAgo: 10
  },
  {
    subject: "Duplicate billing on account after updating payment method",
    body: "We switched from Visa to Mastercard on Nov 8. Both cards were billed $79 on the same day. Please refund the Visa charge.",
    status: "resolved",
    category: "refund_request",
    senderName: "Eleanor Roosevelt",
    senderEmail: "eleanor@human-rights.org",
    daysAgo: 13,
    hoursAgo: 4,
    replies: [
      { senderType: "agent", body: "Visa charge refunded in full. Mastercard remains your active payment method.", minutesAfter: 15 }
    ]
  },
  {
    subject: "Export all ticket conversations for legal discovery compliance",
    body: "We are undergoing a regulatory legal hold and need a complete JSON or SQL dump of all ticket conversations involving user ID #8491.",
    status: "open",
    category: "general_question",
    senderName: "Frank Castle",
    senderEmail: "frank@vigilante-investigations.com",
    daysAgo: 6,
    hoursAgo: 11
  },
  {
    subject: "File attachments in ticket emails stripped by inbound mail parser",
    body: "When customers send attachments like PDF or PNG via email, the ticket is created in the dashboard but attachments are completely missing.",
    status: "open",
    category: "technical_question",
    senderName: "Grace Hopper",
    senderEmail: "grace@compiler-navy.mil",
    daysAgo: 1,
    hoursAgo: 12
  },
  {
    subject: "How can we set up custom ticket status workflows like 'Pending Vendor'?",
    body: "We need custom status options beyond Open, Resolved, and Closed. Is this configurable in the admin dashboard or via API?",
    status: "resolved",
    category: "general_question",
    senderName: "Henry Cavill",
    senderEmail: "henry@witcher-studios.co.uk",
    daysAgo: 26,
    hoursAgo: 2
  },
  {
    subject: "Inbound email webhook dropping messages containing emojis in subject",
    body: "Whenever a subject line includes emojis like 🚨 Urgent or ❓ Help, the SendGrid inbound webhook parser returns 500 error due to database utf8 vs utf8mb4.",
    status: "resolved",
    category: "technical_question",
    senderName: "Isaac Newton",
    senderEmail: "isaac@principia-math.uk",
    daysAgo: 16,
    hoursAgo: 4,
    replies: [
      { senderType: "agent", body: "We updated the PostgreSQL text column collation to full UTF-8 encoding. Emojis in subject lines are now fully supported.", minutesAfter: 35 }
    ]
  },
  {
    subject: "Just wanted to say your support platform has been fantastic for our team!",
    body: "Our customer satisfaction rating jumped from 78% to 94% since switching to Helpdesk. Kudos to your engineering and design team!",
    status: "closed",
    category: null,
    senderName: "Julia Roberts",
    senderEmail: "julia@hollywood-arts.com",
    daysAgo: 28,
    hoursAgo: 8,
    replies: [
      { senderType: "agent", body: "Thank you so much for the wonderful feedback Julia! That made our team's day.", minutesAfter: 60 }
    ]
  },
  {
    subject: "Kubernetes pod readiness probe failing after database reconnect",
    body: "When the database undergoes a maintenance restart, the /healthz endpoint continues returning 500 because the health check does not ping the refreshed pool.",
    status: "open",
    category: "technical_question",
    senderName: "Linus Torvalds",
    senderEmail: "linus@kernel-foundation.org",
    daysAgo: 3,
    hoursAgo: 12
  },
  {
    subject: "Monthly invoice missing line item breakdown for add-on storage",
    body: "We were charged $120 instead of $99, but the PDF invoice only says 'Subscription' with no itemization for the extra 50GB storage add-on.",
    status: "resolved",
    category: "general_question",
    senderName: "Marie Curie",
    senderEmail: "marie@radium-institute.fr",
    daysAgo: 23,
    hoursAgo: 5
  },
  {
    subject: "Notification sounds not playing on incoming tickets in web browser",
    body: "Even with browser sound permissions allowed, incoming ticket chimes do not play unless the user has previously interacted with the document.",
    status: "resolved",
    category: "technical_question",
    senderName: "Nikola Tesla",
    senderEmail: "nikola@wardenclyffe.org",
    daysAgo: 25,
    hoursAgo: 10
  },
  {
    subject: "Order cancelled within 1 hour - requesting immediate refund",
    body: "I accidentally ordered the Agency 50-agent plan instead of the 5-agent plan. Order #38291. Please refund immediately so I can re-order.",
    status: "resolved",
    category: "refund_request",
    senderName: "Oprah Winfrey",
    senderEmail: "oprah@harpo-studios.com",
    daysAgo: 17,
    hoursAgo: 2,
    replies: [
      { senderType: "agent", body: "We immediately cancelled Order #38291 and released the $499 credit card pre-authorization hold.", minutesAfter: 10 }
    ]
  },
  {
    subject: "Password reset emails failing SPF and DKIM verification in Outlook",
    body: "Corporate customers using Microsoft Office 365 find our password reset emails in their Quarantine folder due to missing DKIM DNS records.",
    status: "open",
    category: "technical_question",
    senderName: "Pierre Fermat",
    senderEmail: "pierre@toulouse-math.fr",
    daysAgo: 2,
    hoursAgo: 7
  },
  {
    subject: "Querying tickets by updated_at timestamp returns unexpected results",
    body: "The REST API /api/v1/tickets?updatedAfter=2026-11-01 returns tickets that haven't been touched since October.",
    status: "open",
    category: "technical_question",
    senderName: "Queen Elizabeth",
    senderEmail: "queen@windsor-estate.co.uk",
    daysAgo: 5,
    hoursAgo: 8
  },
  {
    subject: "Refund request: charged during 14-day free trial period",
    body: "Our trial started on Nov 5 and was supposed to end Nov 19. Our card was charged $49 on Nov 12. Please refund the premature charge.",
    status: "resolved",
    category: "refund_request",
    senderName: "Rosa Parks",
    senderEmail: "rosa@civil-liberties.org",
    daysAgo: 9,
    hoursAgo: 3,
    replies: [
      { senderType: "agent", body: "We apologize for the billing schedule glitch. The $49 charge was refunded and your free trial extended by 14 days.", minutesAfter: 18 }
    ]
  },
  {
    subject: "Search bar should support exact match with quotation marks",
    body: "Searching for \"database connection\" with quotes still returns all tickets that have 'database' OR 'connection'. Exact phrase search is needed.",
    status: "open",
    category: "technical_question",
    senderName: "Steve Jobs",
    senderEmail: "steve@apple-infinite.com",
    daysAgo: 4,
    hoursAgo: 5
  },
  {
    subject: "Two agents editing the same ticket reply simultaneously overwrite each other",
    body: "We had a collision where Agent A and Agent B both replied to Ticket #19 at the same time. Does Helpdesk have collision detection or presence indicators?",
    status: "open",
    category: "general_question",
    senderName: "Tim Berners-Lee",
    senderEmail: "tim@w3c-consortium.org",
    daysAgo: 6,
    hoursAgo: 6
  },
  {
    subject: "Unable to update company logo on customer portal settings page",
    body: "Clicking 'Change Logo' opens the file picker, but after choosing a SVG file, nothing changes and the old logo remains.",
    status: "resolved",
    category: "technical_question",
    senderName: "Usain Bolt",
    senderEmail: "usain@jamaica-track.jm",
    daysAgo: 21,
    hoursAgo: 9
  },
  {
    subject: "Virus scanner false positive flagging your desktop companion app",
    body: "Windows Defender flags the Helpdesk-Tray-v2.1.exe installer with Trojan:Win32/Wacatac.B!ml. Is this a false positive?",
    status: "resolved",
    category: "general_question",
    senderName: "Virginia Woolf",
    senderEmail: "virginia@bloomsbury-group.co.uk",
    daysAgo: 27,
    hoursAgo: 10,
    replies: [
      { senderType: "agent", body: "Yes, this was a false positive due to a new EV code signing certificate. Microsoft has updated Defender definitions.", minutesAfter: 30 }
    ]
  },
  {
    subject: "Webhook payload signature verification code example in Python needed",
    body: "Could you provide a code snippet for verifying the X-Helpdesk-Signature header using Python's hmac and hashlib libraries?",
    status: "closed",
    category: "technical_question",
    senderName: "Werner Heisenberg",
    senderEmail: "werner@quantum-physics.de",
    daysAgo: 24,
    hoursAgo: 2,
    replies: [
      { senderType: "agent", body: "Here is a Python 3 example: hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest() == signature.", minutesAfter: 15 }
    ]
  },
  {
    subject: "X-Frame-Options header preventing embedding help widget into iframe",
    body: "Our web portal tries to iframe the widget at /embed/ticket-form but Chrome blocks it with 'Refused to display in a frame because it set X-Frame-Options to SAMEORIGIN'.",
    status: "open",
    category: "technical_question",
    senderName: "Xerxes The Great",
    senderEmail: "xerxes@persian-empire.ir",
    daysAgo: 3,
    hoursAgo: 4
  },
  {
    subject: "Yearly enterprise contract negotiation for 500+ agent seats",
    body: "Our enterprise IT organization is evaluating Helpdesk against Zendesk for 550 agents. Please connect us with your VP of Enterprise Sales.",
    status: "open",
    category: null,
    senderName: "Yuri Gagarin",
    senderEmail: "yuri@cosmonaut-agency.ru",
    daysAgo: 7,
    hoursAgo: 11
  },
  {
    subject: "Zoom integration link generator creating expired meeting URLs",
    body: "When an agent clicks 'Start Zoom Support Call', the generated URL returns 'This meeting link has expired or is invalid'.",
    status: "resolved",
    category: "technical_question",
    senderName: "Zendaya Coleman",
    senderEmail: "zendaya@euphoria-studios.com",
    daysAgo: 19,
    hoursAgo: 2,
    replies: [
      { senderType: "agent", body: "The Zoom OAuth token refresh scope was renewed. Meeting links now generate fresh sessions properly.", minutesAfter: 20 }
    ]
  }
];
