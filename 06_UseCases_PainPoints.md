# Use Cases, Pain Points & Problem Statement
## PropManage — AI-Powered Global Property Management Platform

**Document ID:** PM-USECASE-001  
**Version:** 1.0  
**Date:** March 2026

---

## Part 1 — The Problem in Depth

### 1.1 The Global Landlord Reality

Property ownership is one of the most common forms of wealth creation across India, the Gulf, Southeast Asia, and the UK among diaspora communities. Yet unlike stocks or mutual funds, property portfolios are managed almost entirely through informal, manual, and fragmented systems.

A landlord owning 15 properties in Chennai is simultaneously:

- Keeping 15+ tenancy agreements in physical folders, WhatsApp forwards, or Gmail
- Tracking rent in a notebook, personal Excel, or purely in their head
- Receiving maintenance requests through personal WhatsApp, which then gets buried under family messages
- Running to a lawyer or CA to answer questions they should be able to answer themselves
- Missing agreement renewals because there is no reminder system
- Unable to delegate to a property manager without losing complete visibility
- Handling disputes with no paper trail, no logged communication, no audit history

This is not a niche problem. This is the default operating state of hundreds of millions of property owners globally.

### 1.2 The Core Problem Statement

**There is no software platform that gives individual property owners and small property management firms a unified, private, intelligent system for managing the full lifecycle of real properties — from ownership documentation through tenant management, rent tracking, and AI-assisted decision support — that works across countries, languages, and property types, at a price accessible to individual landlords.**

Every existing solution fails on at least one of these dimensions:
- Too expensive (AppFolio: US$1.49/unit/month, enterprise contracts)
- Too narrow (India-only, or US-only, or commercial-only)
- Not intelligent (no AI, no document understanding)
- Not private (SaaS platforms sell data, integrate with tax authorities)
- Not mobile-first (desktop-heavy, unusable on a phone in a Tamil Nadu village)
- No WhatsApp integration (WhatsApp is the primary business communication channel in India + MENA)

### 1.3 Pain Points — Detailed Analysis

#### Pain Point 1: Document Chaos (Severity: Critical)

**What landlords experience:**
- Physical documents locked in almirahs, at risk from fire, flood, theft, or pests
- Scanned copies in "Documents" folder on phone — no organization, no search
- Agreement given to tenant on WhatsApp, never stored systematically
- During a legal dispute or audit: hours spent finding a single document
- No awareness that a document (insurance, registration) has expired until a crisis hits

**Specific user stories:**
- *"I couldn't find my original sale deed when I tried to sell one of my apartments. The deal was almost lost."*
- *"My tenant damaged the property and I couldn't produce the handover checklist. I lost ₹80,000 in arbitration."*
- *"I have 12 insurance policies. I have no idea which ones are current or expired."*

**Root cause:** No structured storage, no lifecycle tracking, no intelligent retrieval

---

#### Pain Point 2: Rent Chaos (Severity: Critical)

**What landlords experience:**
- Manual rent tracking in Excel or notebooks, prone to errors and out of date
- Chasing overdue tenants is awkward, embarrassing, often avoided
- No systematic record of who paid what, when, and how
- Cash payments not documented — creates disputes and tax complications
- No alerts when a tenant goes overdue
- No financial overview of the full portfolio

**Specific user stories:**
- *"I have 8 tenants. Every month I call each one individually to confirm payment. It takes half a day."*
- *"A tenant claimed they'd paid cash 3 months ago. I had no record. We settled out of court."*
- *"My NRI landlord has no idea what's happening with his Chennai properties. His manager just sends ₹X to his account and he trusts it."*

**Root cause:** No automated rent ledger, no payment logging system, no visibility layer

---

#### Pain Point 3: Agreement Expiry Blindness (Severity: High)

**What landlords experience:**
- Leases run month-to-month after expiry — legally ambiguous and risky
- Tenants gain stronger rights after a certain period without a new agreement (varies by country)
- Rent escalation clauses are missed, leaving money on the table
- Agreements expire without the owner even noticing

**Specific user stories:**
- *"I realized my tenant's agreement expired 18 months ago. He's technically a holdover tenant now."*
- *"My Dubai property's Ejari registration lapsed. I got fined by RERA."*
- *"I should have increased rent by 8% last April per the agreement. Missed it. That's ₹2,000/month gone."*

**Root cause:** No document lifecycle tracking, no automated expiry alerts

---

#### Pain Point 4: Remote Owner Blindness (NRI/Remote) (Severity: High)

**What NRI and remote owners experience:**
- Complete dependence on a local property manager with no verification mechanism
- No access to documents without physically traveling or trusting someone to scan and send
- Rent confirmation is a monthly phone call or bank statement check
- Maintenance issues are reported and handled without owner awareness
- Legal or regulatory issues surface only when they're already in crisis

**Specific user stories:**
- *"I'm in London. I found out my Chennai apartment had a water leak only when the tenant stopped paying rent in protest."*
- *"My property manager collected 3 months of deposits and disappeared. I had no documentation."*
- *"I bought a property in Dubai in 2019. I've never physically visited it. I have no idea what's happening."*

**Root cause:** No remote visibility tool, no document sharing, no structured communication between owner and manager

---

#### Pain Point 5: Maintenance Invisibility (Severity: Medium)

**What landlords experience:**
- Maintenance requests arrive in personal WhatsApp and are forgotten
- No record of what was fixed, when, by whom, at what cost
- Disputes about who is responsible for a repair (tenant vs. landlord)
- No way for a property manager to log and track maintenance systematically
- Cost tracking for tax purposes is impossible

**Root cause:** No structured maintenance workflow

---

#### Pain Point 6: Language and Localization Barriers (Severity: Medium)

**What landlords experience:**
- All existing platforms are English-only
- Tamil, Hindi, Arabic-speaking landlords must navigate English interfaces
- Legal documents are in local languages but no AI system understands them in context
- WhatsApp communications are in Tanglish, Hinglish, or regional scripts

**Root cause:** All existing solutions built for Western English-speaking markets

---

### 1.4 Why This Problem Is Solvable Now

Three technology capabilities have converged to make PropManage possible in 2026:

1. **Multimodal OCR** (Google Document AI) — can extract text from handwritten, printed, and photographed documents with high accuracy across Indian scripts + Arabic + Latin
2. **Retrieval-Augmented Generation** (pgvector + Gemini) — allows an AI to answer questions by searching the owner's actual documents rather than hallucinating
3. **WhatsApp Business API** (Twilio) — enables native WhatsApp integration without requiring users to change their primary communication habit

These three together mean we can build something that: understands your documents in any language, keeps your data private, and delivers everything on WhatsApp — the channel your tenants already use.

---

## Part 2 — Use Cases (Complete)

### Use Case 1 — Owner Onboards First Property
**Actor:** Owner (Ramesh)  
**Trigger:** Downloads app, wants to set up his 12 properties

**Main Flow:**
1. Registers with Google SSO or email
2. Sees empty portfolio screen
3. Taps "Add Property"
4. Enters: name "MG Road Flat 3B", type: Residential Apartment, city: Chennai, country: India, status: Occupied
5. Property created. Portfolio shows 1 property.
6. Optional: uploads sale deed for this property → categorized as "Ownership"

**Outcome:** Property exists in system, document uploaded and queued for OCR

---

### Use Case 2 — Upload and Index a Rental Agreement
**Actor:** Owner  
**Trigger:** Wants to upload existing agreement with current tenant

**Main Flow:**
1. Opens property → Documents tab
2. Taps "Upload Document" → selects PDF from files
3. Selects category: "Rental Agreement"
4. System uploads file, shows "Processing..." indicator
5. Background: OCR runs → text extracted → auto-extraction runs (tenant name, rent, dates)
6. Owner sees: "Agreement auto-detected — Tenant: Ravi Kumar, Rent: ₹22,500, End Date: Apr 30, 2026"
7. Owner confirms extracted fields or edits
8. System sets expiry alert for 30 days before Apr 30, 2026
9. Document is chunked and embedded in vector index

**Outcome:** Agreement is searchable via AI agent, expiry alert set

---

### Use Case 3 — Invite a Tenant
**Actor:** Owner  
**Trigger:** Has a new tenant moving in

**Main Flow:**
1. Opens property → Tenants tab → "Add Tenancy"
2. Fills: tenant name Karthik Rajan, phone +91-9876543210, email karthik@gmail.com
3. Fills: Unit 4A, monthly rent ₹28,000, deposit ₹84,000, start May 1 2025, end Apr 30 2026, due on 5th
4. Uploads signed rental agreement
5. Taps "Invite Tenant via WhatsApp"
6. Twilio sends WhatsApp message: "Hi Karthik, your landlord has added you to PropManage. Tap to view your rental details: [link]"
7. Karthik taps link → creates account → sees his tenancy: agreement, payment history, maintenance form

**Outcome:** Tenancy created, tenant onboarded, system starts generating monthly rent entries

---

### Use Case 4 — Log a Rent Payment
**Actor:** Owner  
**Trigger:** Tenant paid cash, owner wants to record it

**Main Flow:**
1. Owner opens Payments tab → finds Karthik's May entry (status: Pending)
2. Taps "Log Payment"
3. Selects: Amount ₹28,000, Date: May 5 2025, Method: Cash
4. Confirms → status changes to "Paid"
5. Optional: generates PDF receipt → sends to Karthik via WhatsApp

**Alt Flow (AI Agent):**
1. Owner opens chat → types "Log payment from Karthik for May, ₹28,000 cash"
2. Agent: "I'll log ₹28,000 from Karthik Rajan (Unit 4A, MG Road) for May 2025, cash. Shall I proceed?"
3. Owner: "Yes" → Agent calls record_rent_payment tool → confirms "Done. May rent logged as Paid."

---

### Use Case 5 — AI Agent: Overdue Rent Query
**Actor:** Owner  
**Trigger:** Monthly check — who owes me rent?

**Main Flow:**
1. Owner opens chat: "Which tenants haven't paid this month?"
2. Agent calls get_portfolio_data(query_type="overdue_rent")
3. Returns from DB: 3 overdue tenants
4. Agent: "3 tenants are overdue for June 2025:
   - Ravi Kumar, Flat 3B, ₹22,500 (5 days overdue)
   - Lakshmi Devi, Flat 7A, ₹18,000 (8 days overdue)
   - ABC Enterprises, Shop 2, ₹45,000 (12 days overdue)"
5. Owner: "Send WhatsApp reminders to all three"
6. Agent drafts 3 personalized WhatsApp messages — shows all three
7. Owner: "Send them"
8. Agent calls send_notification for each → Twilio delivers
9. Agent: "Reminders sent to all 3 tenants."

---

### Use Case 6 — AI Agent: Document Clause Retrieval
**Actor:** Owner  
**Trigger:** Dispute with tenant over security deposit deduction

**Main Flow:**
1. Owner: "What does my agreement with Ravi Kumar say about security deposit return?"
2. Agent calls search_my_documents(query="security deposit return deduction Ravi Kumar", category="agreement")
3. pgvector finds relevant chunks from "Rental Agreement — Flat 3B.pdf"
4. Agent: "Based on your Rental Agreement for Flat 3B (Ravi Kumar, uploaded May 2024):
   
   'The security deposit of ₹67,500 shall be returned within 30 days of the tenant vacating and providing vacant possession. The landlord may deduct from the deposit: (a) any unpaid rent; (b) cost of repairing damage beyond normal wear and tear; (c) outstanding utility bills as evidenced by invoices.'
   
   Source: Rental Agreement — Flat 3B, MG Road · Category: Agreement"

---

### Use Case 7 — AI Agent: General Knowledge Query
**Actor:** Owner  
**Trigger:** Unsure about legal notice period requirements

**Main Flow:**
1. Owner: "How much notice do I have to give a tenant before eviction in Tamil Nadu?"
2. Agent calls get_property_knowledge(question="eviction notice period landlord requirements", country_code="IN")
3. Claude returns: Tamil Nadu Rent Control Act provisions, 15-day written notice for non-payment, 1-month notice for personal requirement, court order required for protected tenants
4. Agent responds with factual answer + disclaimer: "Note: This is general guidance, not legal advice. Consult a qualified advocate for advice specific to your situation."

---

### Use Case 8 — Tenant View: Check Own Agreement
**Actor:** Tenant (Karthik)  
**Trigger:** Wants to check his notice period requirement

**Main Flow:**
1. Karthik opens app → sees his tenancy overview
2. Opens chat: "What is my notice period if I want to vacate?"
3. Agent (tenant-scoped): searches Karthik's agreement only
4. Returns clause: "Per your rental agreement dated May 2025, you are required to give 30 days written notice before vacating."
5. Agent: "Would you like me to help you draft a notice to your landlord?"

---

### Use Case 9 — Property Manager View
**Actor:** Property Manager (Meenakshi)  
**Trigger:** Managing maintenance for her assigned properties

**Main Flow:**
1. Meenakshi logs in → sees only her 6 assigned properties (no others)
2. Opens property → Maintenance tab → sees 2 open requests
3. Taps on "Broken geyser" (Unit 3A) — raised by tenant 2 days ago
4. Updates status to "In Progress," adds vendor name "Surya Electricals," estimated cost ₹3,500
5. Tenant receives WhatsApp: "Your maintenance request (Broken geyser) has been assigned to a technician."
6. Once resolved: Meenakshi marks as "Resolved," adds actual cost ₹3,200

---

### Use Case 10 — Document Expiry Alert
**Actor:** System → Owner  
**Trigger:** Scheduled job detects expiry in 30 days

**Main Flow:**
1. Daily cron job (9 AM) runs
2. Finds: "Property Insurance, MG Road property" expires in 28 days
3. Sends WhatsApp to owner: "Your property insurance for MG Road Flat 3B expires on [date]. Tap to view the document."
4. Sends in-app notification
5. Owner opens app → sees orange expiry badge on document → renews insurance → uploads new policy
6. Old policy archived as previous version

---

### Use Case 11 — NRI Owner Remote Monitoring
**Actor:** Owner (Priya, in London)  
**Trigger:** Monthly portfolio check without calling anyone

**Main Flow:**
1. Priya opens app from London at 9 PM IST / 4:30 PM London time
2. Portfolio dashboard: 4 properties, 3 occupied, 1 vacant, ₹72,000 collected this month, ₹0 overdue
3. Taps on MG Road property → sees Ravi Kumar's payment history: 11/12 months paid on time
4. Opens Documents tab → sees insurance expires in 45 days (amber badge)
5. Opens AI agent: "Are there any issues I should know about with my Chennai properties?"
6. Agent summarizes: "All rent collected. One insurance expiring 15 April. One maintenance request resolved last week (cost: ₹1,800 logged by Meenakshi)."
7. Priya: fully informed in 3 minutes, without calling anyone.

---

### Use Case 12 — Draft Lease Renewal Notice
**Actor:** Owner  
**Trigger:** Tenant's agreement expiring in 45 days

**Main Flow:**
1. App sends alert: "Ravi Kumar's agreement expires Apr 30 — 45 days remaining"
2. Owner opens chat: "Draft a renewal notice for Ravi Kumar with 8% rent increase"
3. Agent:
   - Fetches current rent (₹22,500) and agreement details from DB
   - Calculates new rent: ₹24,300
   - Drafts formal renewal notice
   - Shows full draft to owner
4. Owner reads, makes minor edit ("change the date to May 1")
5. Owner: "Send this to Ravi on WhatsApp"
6. Agent confirms action → sends

---

## Part 3 — Quantified Impact

| Pain Point | Current State | With PropManage |
|---|---|---|
| Time spent on rent tracking | 4–8 hours/month (8 properties) | < 30 min/month |
| Overdue rent discovery | End of month, manually | Same day, automated alert |
| Document retrieval time | 30–120 minutes per document | < 10 seconds via AI search |
| Agreement expiry surprises | 2–3 per year (undetected) | Zero — automatic alerts |
| Tenant communication overhead | 2–3 hours/month per active tenant | Automated WhatsApp + in-app |
| NRI visibility | Zero (phone call only) | Real-time, anywhere |
| Dispute resolution readiness | Low (no paper trail) | High (audit log, document access) |

---

*Use Cases & Problem Statement v1.0 — PropManage*
