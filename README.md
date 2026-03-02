Product Requirements Document (PRD)
Marketing Campaign & CRM Application — Powered by Brevo
Version: 1.0
Last Updated: June 2025
Status: Draft
Author: Product Team

Table of Contents
Executive Summary
Goals & Objectives
Target Users & Personas
Brevo API Integration Architecture
Feature Breakdown
5.1 Authentication & Onboarding
5.2 Dashboard
5.3 Audience / CRM Module
5.4 Campaign Module
5.5 Email Template Builder
5.6 Automation Module
5.7 Forms & Signup Pages
5.8 Analytics & Reporting
5.9 Settings & Account Management
UI/UX Specifications
Information Architecture & Navigation
Database Schema
API Mapping — Our App ↔ Brevo
Technical Architecture
Non-Functional Requirements
Phased Rollout Plan
Risk Assessment
Success Metrics
Appendix
1. Executive Summary
This document outlines the complete product specification for building a Mailchimp-clone marketing campaign and CRM application, powered by Brevo (formerly Sendinblue) as the underlying email infrastructure. The application will replicate Mailchimp's core campaign creation, audience management (CRM), email template building, automation workflows, and analytics reporting — all routed through Brevo's API for actual email delivery, contact storage, and event tracking.

The product will be a multi-tenant SaaS application where users can manage their marketing contacts, build and send email campaigns, set up automated workflows, and track engagement — all through a clean, modern interface that mirrors (and improves upon) the Mailchimp experience.

2. Goals & Objectives
Primary Goals
#	Goal	Success Criteria
G1	Replicate Mailchimp's campaign creation workflow	Users can create, design, schedule, and send email campaigns in < 10 minutes
G2	Replicate Mailchimp's CRM/Audience management	Users can import, segment, tag, and manage 100K+ contacts
G3	Provide drag-and-drop email builder	Template builder with 95%+ feature parity to Mailchimp's builder
G4	Deliver real-time analytics	Campaign stats update within 60 seconds of events
G5	Seamless Brevo integration	All email operations route through Brevo API with zero user-facing friction
Secondary Goals
Provide a superior UX compared to Mailchimp
Support multi-user team collaboration
Enable API-first extensibility for future integrations
Achieve sub-2-second page load times globally
3. Target Users & Personas
Persona 1: Marketing Manager — "Sarah"
Age: 28–42
Role: Marketing lead at a 20–200 person company
Needs: Send weekly newsletters, manage subscriber lists, track campaign ROI
Pain Points: Mailchimp pricing, complexity of advanced features
Tech Comfort: Moderate; prefers visual tools over code
Persona 2: Small Business Owner — "Marcus"
Age: 30–55
Role: Runs an e-commerce store or local business
Needs: Promotional emails, customer database, simple automations
Pain Points: Time-constrained, needs quick campaign setup
Tech Comfort: Low to moderate
Persona 3: Growth/Ops Specialist — "Priya"
Age: 25–35
Role: Handles growth, data, and marketing ops
Needs: Segmentation, A/B testing, automation workflows, API access
Pain Points: Needs granular control and data export capabilities
Tech Comfort: High
4. Brevo API Integration Architecture
4.1 Brevo Services We Will Consume
Brevo API Module	Our Feature Mapping	API Version
Contacts API	Audience/CRM management	v3
Email Campaigns API	Campaign creation & sending	v3
Transactional Email API	Automated/triggered emails	v3
SMTP API	Raw email sending	v3
Templates API	Server-side template storage	v3
Lists API	Audience lists	v3
Segments API	Dynamic segments	v3
Webhooks API	Real-time event tracking	v3
Senders API	Sender identity management	v3
Statistics API	Campaign analytics	v3
Automation API	Workflow automation	v3 (if available)
4.2 Integration Pattern
text

┌─────────────────────┐
│   Frontend (React)   │
│   Next.js App        │
└──────────┬──────────┘
           │ REST API calls
           ▼
┌─────────────────────┐
│   Backend API        │
│   (Node.js/Express   │
│    or Next.js API)   │
│                      │
│  ┌─────────────────┐ │
│  │ Brevo Service   │ │  ◄── Abstraction layer
│  │ Layer           │ │
│  └────────┬────────┘ │
│           │          │
│  ┌────────▼────────┐ │
│  │ Our Database    │ │  ◄── PostgreSQL (metadata, users, drafts)
│  │ (PostgreSQL)    │ │
│  └─────────────────┘ │
└──────────┬──────────┘
           │ Brevo API v3 calls
           ▼
┌─────────────────────┐
│   Brevo Platform     │
│   - Email Delivery   │
│   - Contact Storage  │
│   - Analytics        │
│   - Webhooks         │
└─────────────────────┘
4.3 Data Ownership Strategy
Data Type	Primary Store	Secondary/Cache
User accounts & auth	Our PostgreSQL	—
Contacts/Audience	Brevo (source of truth)	Our PostgreSQL (cached)
Campaign content & drafts	Our PostgreSQL	Brevo (on send)
Campaign analytics	Brevo (source of truth)	Our PostgreSQL (cached hourly)
Email templates	Our PostgreSQL (drafts) + Brevo (published)	—
Automation workflows	Our PostgreSQL (config) + Brevo (execution)	—
Tags & custom fields	Brevo (synced)	Our PostgreSQL (cached)
Sender identities	Brevo (source of truth)	Our PostgreSQL (cached)
4.4 Brevo API Key Management
Each tenant/organization connects their own Brevo API key
API keys stored encrypted (AES-256) in our database
Alternative: We use a single master Brevo account with sub-organizations
Rate limiting: Respect Brevo's rate limits (varies by plan — typically 400 req/min)
5. Feature Breakdown
5.1 Authentication & Onboarding
5.1.1 Registration Flow
Page: /signup

Element	Specification
Layout	Centered card (480px max-width) on a light gray (#F7F7F7) background
Logo	Top-center, 40px height, links to marketing site
Form fields	Full name (text), Email (email), Password (password, min 8 chars, strength indicator), Company name (text, optional)
Password strength	Bar below password field: Red (weak) → Yellow (fair) → Green (strong)
CTA button	"Create Account" — full-width, primary color (#6366F1 Indigo-500), 48px height, 16px font, bold
Social auth	Google OAuth and Microsoft OAuth buttons above form, separated by "or" divider
Footer links	"Already have an account? Log in" — link to /login
Terms	Checkbox: "I agree to Terms of Service and Privacy Policy" (required)
Post-Registration Onboarding (4-step wizard):

Step	Screen	Details
1	Company Profile	Company name, industry dropdown (20 options), company size radio (1-10, 11-50, 51-200, 201-1000, 1000+), website URL
2	Connect Brevo	Input field for Brevo API key with link "How to find your API key →" opening help modal. "Test Connection" button that validates the key via GET /account Brevo API call. Success: green checkmark + account name displayed. Failure: red error with retry.
3	Sender Setup	Verify a sender email address or domain. Input sender name + email. Triggers Brevo sender verification. Shows pending/verified status.
4	Import Contacts	Three options displayed as clickable cards: (A) Upload CSV, (B) Copy-paste emails, (C) Skip for now. CSV upload: drag-and-drop zone with column mapping interface.
5.1.2 Login
Page: /login

Element	Specification
Form fields	Email, Password, "Remember me" checkbox
CTA	"Log In" — same style as signup
Links	"Forgot password?" → /forgot-password, "Don't have an account? Sign up" → /signup
Error states	Invalid credentials: red banner above form "Invalid email or password"
2FA (Phase 2)	After password, redirect to TOTP/SMS code entry screen
5.1.3 Forgot Password
Page: /forgot-password

Single email input field
"Send Reset Link" button
Success state: "Check your email for a reset link" with email icon illustration
Reset page (/reset-password?token=xxx): New password + confirm password fields
5.2 Dashboard
Page: /dashboard

The dashboard is the home screen after login — providing an at-a-glance overview of marketing performance.

5.2.1 Layout Structure
text

┌──────────────────────────────────────────────────────────────┐
│  TOP NAV BAR (64px height, white, bottom shadow)             │
│  [Logo] [Dashboard|Audience|Campaigns|Automations|...]  [👤] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  GREETING SECTION (padding: 32px)                            │
│  "Good morning, Sarah 👋"                                    │
│  "Here's how your marketing is performing"                   │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ Campaigns│ │ Avg Open │ │ Avg Click│        │
│  │ Contacts │ │ Sent     │ │ Rate     │ │ Rate     │        │
│  │ 12,847   │ │ 34       │ │ 24.3%    │ │ 3.8%     │        │
│  │ ↑ 12%    │ │ ↑ 5      │ │ ↑ 1.2%   │ │ ↓ 0.3%   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────────────┐ ┌────────────────────┐ │
│  │ EMAIL PERFORMANCE CHART         │ │ RECENT CAMPAIGNS   │ │
│  │ (Line chart - 30 day trend)     │ │                    │ │
│  │ Lines: Sent, Opened, Clicked    │ │ • Campaign A  24%  │ │
│  │                                 │ │ • Campaign B  22%  │ │
│  │ [7d] [30d] [90d] toggle        │ │ • Campaign C  19%  │ │
│  │                                 │ │                    │ │
│  │         📈                      │ │ [View All →]       │ │
│  └─────────────────────────────────┘ └────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────┐ ┌────────────────────┐ │
│  │ AUDIENCE GROWTH CHART           │ │ QUICK ACTIONS      │ │
│  │ (Area chart - subscriber growth)│ │                    │ │
│  │                                 │ │ [📧 New Campaign]  │ │
│  │                                 │ │ [👥 Add Contacts]  │ │
│  │         📊                      │ │ [📝 New Template]  │ │
│  │                                 │ │ [⚡ New Automation]│ │
│  └─────────────────────────────────┘ └────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
5.2.2 KPI Cards (Top Row)
Card	Data Source	Display
Total Contacts	Brevo GET /contacts (count)	Number with thousands separator. Delta badge showing change vs. last 30 days (green ↑ or red ↓).
Campaigns Sent	Brevo GET /emailCampaigns (status=sent, last 30d)	Count of sent campaigns in last 30 days. Delta vs. previous 30 days.
Avg Open Rate	Brevo campaign statistics aggregated	Percentage to 1 decimal. Delta vs. previous period.
Avg Click Rate	Brevo campaign statistics aggregated	Percentage to 1 decimal. Delta vs. previous period.
Card UI Details:

Background: White (#FFFFFF)
Border: 1px solid #E5E7EB
Border-radius: 12px
Padding: 24px
Label: 14px, #6B7280 (gray-500), font-weight 500
Value: 32px, #111827 (gray-900), font-weight 700
Delta badge: 12px, pill-shaped, green (#10B981 bg, #065F46 text) for positive, red (#EF4444 bg, #991B1B text) for negative
5.2.3 Charts
Email Performance Chart:

Library: Recharts or Chart.js
Type: Multi-line chart
Lines: Emails Sent (blue #3B82F6), Opened (green #10B981), Clicked (purple #8B5CF6)
X-axis: Date labels
Y-axis: Count
Toggle buttons: 7d / 30d / 90d (pill-style toggle group)
Tooltip on hover showing exact values
Grid lines: light gray dashed
Audience Growth Chart:

Type: Area chart with gradient fill
Color: Indigo gradient (from #6366F1 to transparent)
Shows cumulative subscriber count over time
5.2.4 Recent Campaigns List
Column	Details
Campaign name	Truncated at 40 chars, bold, clickable (links to campaign report)
Status pill	Sent (green), Draft (gray), Scheduled (blue), Sending (yellow animated)
Open rate	Percentage with small bar indicator
Sent date	Relative time ("2 days ago")
5.2.5 Quick Actions
Four large clickable cards (icon + label):

📧 Create Campaign → /campaigns/new
👥 Add Contacts → /audience/import
📝 Create Template → /templates/new
⚡ Create Automation → /automations/new
Each card: 100% width, 56px height, left icon (24px), text 14px medium, hover state with indigo left border and light indigo background.

5.3 Audience / CRM Module
This is the core CRM feature — equivalent to Mailchimp's "Audience" section.

5.3.1 Audience Overview
Page: /audience

text

┌──────────────────────────────────────────────────────────────┐
│  AUDIENCE HEADER                                             │
│  "Audience" (H1, 28px, bold)                                │
│  [+ Add Contact]  [Import]  [Export]         🔍 Search...    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TAB BAR:  [All Contacts] [Lists] [Segments] [Tags]         │
│                                                              │
│  FILTER BAR:                                                 │
│  [+ Add Filter ▾]  Active filters as pills: [Tag: VIP ✕]   │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ☐ │ Email              │ Name        │ Lists  │ Status  ││
│  │───┼────────────────────┼─────────────┼────────┼─────────││
│  │ ☐ │ sarah@example.com  │ Sarah Lee   │ News.. │ 🟢 Sub  ││
│  │ ☐ │ john@example.com   │ John Smith  │ VIP,.. │ 🟢 Sub  ││
│  │ ☐ │ jane@example.com   │ Jane Doe    │ News.. │ 🔴 Unsub││
│  │ ☐ │ mike@example.com   │ Mike Brown  │ —      │ 🟢 Sub  ││
│  │   │                    │             │        │         ││
│  │   │ ◄ 1 2 3 ... 128 ► │             │        │         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Showing 1-50 of 12,847 contacts          [50 ▾] per page   │
└──────────────────────────────────────────────────────────────┘
5.3.2 Contacts Table — Detailed Specification
Table Columns (configurable):

Column	Width	Sortable	Details
Checkbox	40px	No	Select individual or all (header checkbox)
Email	250px (flex)	Yes	Primary identifier. Clickable → opens contact detail panel. Truncate with ellipsis.
First Name	120px	Yes	Plain text
Last Name	120px	Yes	Plain text
Lists	150px	No	Comma-separated list names, max 2 shown + "+N more" tooltip
Tags	150px	No	Colored tag pills (max 3 shown + "+N")
Status	100px	Yes	Subscribed (green dot), Unsubscribed (red dot), Bounced (orange dot), Blacklisted (black dot)
Added	120px	Yes	Date in "MMM DD, YYYY" format
Last Activity	130px	Yes	"Opened Campaign X" or "Clicked link" with relative time
Table Interactions:

Row hover: Light gray background (#F9FAFB)
Row click: Opens contact detail side panel (slide-in from right, 480px wide)
Bulk select: Header checkbox selects all on current page. Banner appears: "50 contacts selected. [Select all 12,847 contacts]"
Bulk actions toolbar (appears when contacts selected): [Add to List] [Add Tag] [Remove Tag] [Delete] [Export]
Sort: Click column header. Arrow indicator ↑↓. Default sort: Added (newest first)
Pagination: Bottom-right. Show page numbers with ellipsis. Rows per page dropdown: 25, 50, 100
Search Bar:

Position: Top-right of header area
Width: 320px, expandable on focus to 400px
Placeholder: "Search by email, name, or tag..."
Behavior: Debounced search (300ms). Searches via Brevo GET /contacts with query params. Shows results in table.
Icon: Magnifying glass left-aligned inside input
Brevo API Mapping:

text

GET /contacts?limit=50&offset=0&sort=desc → List contacts
GET /contacts?modifiedSince=... → Filter by date
GET /contacts/{email} → Get single contact
5.3.3 Contact Detail Side Panel
Trigger: Click on any contact row
Panel: Slides in from right, 480px wide, white background, elevation-16 shadow

text

┌────────────────────────────────────┐
│  ✕ Close                           │
│                                    │
│  [Avatar Circle - initials]        │
│  Sarah Lee                         │
│  sarah@example.com                 │
│  Status: 🟢 Subscribed             │
│                                    │
│  [Edit Contact]  [Delete]          │
│                                    │
│  ── DETAILS ─────────────────────  │
│  First Name:    Sarah              │
│  Last Name:     Lee                │
│  Phone:         +1 555-0123        │
│  Company:       Acme Corp          │
│  Added:         Jan 15, 2025       │
│  Source:         CSV Import         │
│                                    │
│  ── CUSTOM FIELDS ───────────────  │
│  Lifetime Value:  $2,450           │
│  Plan:            Enterprise       │
│                                    │
│  ── LISTS ───────────────────────  │
│  📋 Newsletter Subscribers         │
│  📋 VIP Customers                  │
│  [+ Add to List]                   │
│                                    │
│  ── TAGS ────────────────────────  │
│  [VIP] [Engaged] [Enterprise]      │
│  [+ Add Tag]                       │
│                                    │
│  ── ACTIVITY TIMELINE ───────────  │
│  📧 Opened "Summer Sale" - 2h ago  │
│  🔗 Clicked link in "Welcome" - 1d │
│  📨 Received "Newsletter #45" - 3d │
│  ✅ Subscribed - Jan 15, 2025      │
│                                    │
│  [Load More Activity]              │
└────────────────────────────────────┘
Avatar Circle:

Size: 80px diameter
Background: Generated from name hash (pick from 8 predefined colors)
Text: Initials, 32px, white, bold
Activity Timeline:

Vertical line on left (2px, gray-200)
Each event: Icon dot on line + event text + timestamp
Icons: 📧 Open, 🔗 Click, 📨 Delivered, 🚫 Bounce, ❌ Unsubscribe, ✅ Subscribe
Data Source: Brevo GET /contacts/{identifier}/campaignStats
5.3.4 Add/Edit Contact Modal
Trigger: "Add Contact" button or "Edit" from detail panel
Modal: Centered, 560px wide, max-height 80vh (scrollable)

Field	Type	Required	Validation
Email	email input	Yes	Valid email format. Check for duplicates via Brevo API.
First Name	text	No	Max 100 chars
Last Name	text	No	Max 100 chars
Phone	tel input (with country code dropdown)	No	E.164 format validation
Company	text	No	Max 200 chars
Lists	Multi-select dropdown	No	Pull from Brevo lists
Tags	Tag input (type to add, comma-separated)	No	Max 50 tags
Custom Fields	Dynamic fields rendered based on account's custom attributes	No	Type-specific validation
Status	Radio buttons: Subscribed / Unsubscribed	Yes	Default: Subscribed
Brevo API Mapping:

text

POST /contacts → Create contact
PUT /contacts/{identifier} → Update contact
DELETE /contacts/{identifier} → Delete contact
5.3.5 Import Contacts
Page: /audience/import

Step 1: Choose Method
Three option cards side by side:

Upload CSV/XLSX — Icon: file upload icon. Description: "Upload a spreadsheet file"
Copy & Paste — Icon: clipboard. Description: "Paste emails directly"
Connect Integration — Icon: plug. Description: "Import from another service" (Phase 2)
Step 2 (CSV): Upload & Map

Drag-and-drop zone: Dashed border (#D1D5DB), 200px height, centered icon + "Drag file here or click to browse"
Accepted: .csv, .xlsx, .xls — Max 50MB
After upload: Show preview table (first 5 rows)
Column mapping interface:
text

┌─────────────────────────────────────────────────┐
│  MAP YOUR COLUMNS                                │
│                                                  │
│  File Column        →    Our Field               │
│  ─────────────────       ──────────────────      │
│  [email_address  ▾]  →   [Email *         ▾]    │
│  [first_name     ▾]  →   [First Name      ▾]    │
│  [last_name      ▾]  →   [Last Name       ▾]    │
│  [company        ▾]  →   [Company         ▾]    │
│  [phone_num      ▾]  →   [Phone           ▾]    │
│  [loyalty_tier   ▾]  →   [— Skip Column — ▾]    │
│                          [+ Create Custom Field]  │
│                                                  │
│  Preview: 3,456 contacts found                   │
└─────────────────────────────────────────────────┘
Step 3: Configure

Add to list: Dropdown of existing lists + "Create new list" option
Tags to apply: Tag input field
Update existing: Toggle — "Update existing contacts if email matches"
Subscribe status: Radio — "Subscribe all" / "Keep existing status"
Step 4: Review & Import

Summary card showing: File name, number of contacts, mapped fields, target list, tags
Warning indicators: "234 duplicate emails found", "12 invalid emails will be skipped"
"Start Import" button
Step 5: Progress & Complete

Progress bar with percentage
Live count: "Imported 2,345 of 3,456..."
Completion: Success illustration + summary stats
Actions: "View Contacts" / "Import More"
Brevo API Mapping:

text

POST /contacts/import → Bulk import contacts
5.3.6 Lists Management
Tab: /audience?tab=lists

List of Lists View:

Column	Details
List name	Bold, clickable → filters main contacts table by list
Contact count	Number
Created	Date
Actions	⋮ menu → Rename, Duplicate, Delete, Export
Create List Modal:

Name: text input (required, max 100 chars)
Description: textarea (optional, max 500 chars)
CTA: "Create List"
Brevo API Mapping:

text

GET /contacts/lists → Get all lists
POST /contacts/lists → Create list
PUT /contacts/lists/{listId} → Update list
DELETE /contacts/lists/{listId} → Delete list
POST /contacts/lists/{listId}/contacts/add → Add contacts to list
POST /contacts/lists/{listId}/contacts/remove → Remove contacts from list
5.3.7 Segments
Tab: /audience?tab=segments

Segments are dynamic groups based on filter rules (like Mailchimp's segments/groups).

Segment Builder Interface:

text

┌─────────────────────────────────────────────────────────────┐
│  CREATE SEGMENT                                              │
│                                                              │
│  Segment Name: [_____________________________]               │
│                                                              │
│  Contacts who match [ALL ▾] of the following conditions:     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Email Activity ▾] [has opened ▾] [any campaign ▾]  │ ✕  │
│  └─────────────────────────────────────────────────────┘    │
│  AND                                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Tag ▾]            [is        ▾] [VIP          ▾]  │ ✕  │
│  └─────────────────────────────────────────────────────┘    │
│  AND                                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Date Added ▾]     [is after  ▾] [Jan 1, 2025   ]  │ ✕  │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [+ Add Condition]                                           │
│                                                              │
│  Preview: 1,234 contacts match                [Refresh ↻]   │
│                                                              │
│  [Cancel]                              [Save Segment]        │
└─────────────────────────────────────────────────────────────┘
Condition Categories (first dropdown):

Category	Conditions
Contact Info	Email, First Name, Last Name, Phone, Company, any custom field
Email Activity	Has opened, has not opened, has clicked, has not clicked — with campaign selector or "any campaign"
Tag	Is, is not — with tag selector
List Membership	Is in, is not in — with list selector
Date Added	Is before, is after, is between — with date picker(s)
Subscription Status	Is subscribed, is unsubscribed, is bounced
Campaign Activity	Was sent, was not sent — with campaign selector
Logic Toggle: "ALL" (AND) / "ANY" (OR) — dropdown at top

Brevo API Mapping:

text

POST /contacts/segments → Create segment (Note: Brevo segments have limited filter options via API; complex segments may need to be computed locally and stored as lists)
Important Note: Brevo's segment API may not support all filter combinations. For advanced segmentation, we will:

Build segment logic in our backend
Query contacts from Brevo with available filters
Apply additional filtering server-side
Materialize complex segments as Brevo lists when used for campaigns
5.3.8 Tags Management
Tab: /audience?tab=tags

Grid of tag cards or list view
Each tag shows: Tag name, contact count, color dot
Actions: Rename, change color, delete, view contacts
Create tag: Inline input or modal with name + color picker (8 preset colors)
Brevo Implementation:
Tags in Brevo are managed through contact attributes. We'll use a text attribute "TAGS" storing comma-separated values, or leverage Brevo's built-in tag feature if available in v3 API.

5.4 Campaign Module
The core email campaign creation and management feature.

5.4.1 Campaigns List
Page: /campaigns

text

┌──────────────────────────────────────────────────────────────┐
│  "Campaigns" (H1)                                            │
│  [+ Create Campaign]                           🔍 Search     │
│                                                              │
│  FILTER TABS: [All] [Drafts (5)] [Scheduled (2)] [Sent (34)]│
│                [Sending (1)]                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  📧 Summer Sale Announcement                             ││
│  │  Sent · Jun 10, 2025 at 2:30 PM · To: Newsletter (8.2K) ││
│  │  📊 Open: 24.3% · Click: 3.8% · Unsub: 0.1%            ││
│  │                                        [View Report] [⋮] ││
│  │──────────────────────────────────────────────────────────││
│  │                                                          ││
│  │  📧 Product Update v3.2                    DRAFT          ││
│  │  Last edited · Jun 12, 2025 at 9:15 AM                   ││
│  │                                        [Continue] [⋮]    ││
│  │──────────────────────────────────────────────────────────││
│  │                                                          ││
│  │  📧 Weekly Newsletter #46               SCHEDULED         ││
│  │  Scheduled · Jun 15, 2025 at 10:00 AM · To: All (12.8K)  ││
│  │                                        [Edit] [⋮]        ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
Campaign Card UI:

Layout: Full-width card, 100px min-height, padding 20px
Left: Email icon (40px, in colored circle)
Content:
Title: 16px, bold, #111827
Meta line: 14px, #6B7280 — status, date, recipient info
Stats line (if sent): 14px with colored values (open=blue, click=green, unsub=red)
Right: Action buttons and three-dot menu
Three-dot menu options:
Draft: Edit, Duplicate, Delete
Sent: View Report, Duplicate, Archive
Scheduled: Edit, Reschedule, Cancel, Duplicate
Hover: subtle elevation increase (shadow)
Status badges:
Draft: Gray pill
Scheduled: Blue pill with clock icon
Sending: Yellow pill with animated spinner
Sent: Green pill with checkmark
Paused: Orange pill
5.4.2 Campaign Creation Wizard
Page: /campaigns/new (and /campaigns/:id/edit)

This is a multi-step wizard with a persistent left sidebar showing progress.

text

┌───────────────────────────────────────────────────────────────┐
│  ← Back to Campaigns            [Save Draft]   [Exit]        │
├─────────┬─────────────────────────────────────────────────────┤
│         │                                                     │
│  STEPS  │   STEP CONTENT AREA                                │
│         │                                                     │
│ ● Setup │                                                     │
│ ○ To    │   (Content changes based on active step)            │
│ ○ From  │                                                     │
│ ○ Subject│                                                    │
│ ○ Content│                                                    │
│ ○ Review │                                                    │
│         │                                                     │
│         │                                                     │
│         │                                          [Next →]   │
│         │                                                     │
├─────────┴─────────────────────────────────────────────────────┤
│  BOTTOM BAR:  Step 1 of 6     [← Previous]    [Next Step →]  │
└───────────────────────────────────────────────────────────────┘
Step Sidebar:

Width: 240px
Background: #F9FAFB
Steps listed vertically
Active step: Indigo text + filled circle
Completed step: Green checkmark circle
Future step: Gray outlined circle
Step labels: 14px, clickable (can navigate to completed steps)
Step 1: Setup

Field	Type	Details
Campaign Name	Text input	Internal name, not shown to recipients. Required. Max 200 chars. Placeholder: "e.g., Summer Sale - June 2025"
Campaign Type	Radio cards (3 options)	Regular: Standard email campaign. A/B Test: Test variations (Phase 2). Automated: Trigger-based (redirects to automation builder).
Tags/Labels	Tag input	Internal tags for organization (e.g., "promotional", "Q2-2025")
Step 2: To (Recipients)

text

┌─────────────────────────────────────────────────────────────┐
│  WHO ARE YOU SENDING TO?                                     │
│                                                              │
│  Send to:                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ○ Entire audience (12,847 contacts)                     ││
│  │ ● Specific lists                                        ││
│  │   ☑ Newsletter Subscribers (8,234)                      ││
│  │   ☐ VIP Customers (456)                                 ││
│  │   ☐ Product Updates (3,102)                             ││
│  │ ○ Segment                                               ││
│  │   [Select segment ▾]                                    ││
│  │ ○ Tags                                                  ││
│  │   [Select tags ▾]                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Exclude (optional):                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Select lists or segments to exclude ▾]                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Estimated recipients: 8,234                                 │
│  ⚠ 123 contacts excluded (unsubscribed, bounced)            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
Brevo API Mapping:

Lists: Use listIds parameter in campaign creation
Segments: Use segmentIds parameter
Exclusion lists: Use exclusionListIds parameter
Step 3: From (Sender)

Field	Type	Details
Sender Name	Text input	Pre-filled from account settings. E.g., "Acme Corp"
Sender Email	Dropdown	Shows all verified sender emails from Brevo. Option to "+ Add new sender" (opens verification flow)
Reply-to Email	Text input	Defaults to sender email. Can be different.
Brevo API:

text

GET /senders → List verified senders
POST /senders → Add new sender
Step 4: Subject

text

┌─────────────────────────────────────────────────────────────┐
│  SUBJECT LINE                                                │
│                                                              │
│  Subject:                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🎉 Summer Sale — 50% off everything!                    ││
│  └─────────────────────────────────────────────────────────┘│
│  Character count: 43/150 (recommended < 60)                  │
│  [Add Personalization ▾] → inserts {{contact.FIRSTNAME}}     │
│  [Add Emoji 😀]                                              │
│                                                              │
│  Preview Text (optional):                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Don't miss our biggest sale of the year. Shop now...     ││
│  └─────────────────────────────────────────────────────────┘│
│  Character count: 58/200                                     │
│                                                              │
│  PREVIEW:                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📱 Mobile Inbox Preview                                 ││
│  │                                                         ││
│  │  Acme Corp                                    10:30 AM  ││
│  │  🎉 Summer Sale — 50% off everything!                   ││
│  │  Don't miss our biggest sale of the year. Shop now...   ││
│  │─────────────────────────────────────────────────────────││
│  │  Other Sender                                  9:15 AM  ││
│  │  Another email subject...                               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  A/B Test Subject (Phase 2):                                 │
│  [Enable A/B Testing] toggle                                 │
└─────────────────────────────────────────────────────────────┘
Personalization Dropdown Menu:

Token	Inserts
First Name	{{contact.FIRSTNAME}}
Last Name	{{contact.LASTNAME}}
Email	{{contact.EMAIL}}
Company	{{contact.COMPANY}}
Custom Fields	Dynamic list from account's custom attributes
Fallback	Each token can have fallback: {{contact.FIRSTNAME | default: "there"}}
Inbox Preview:

Mimics a mobile inbox (iPhone-style)
Shows sender name, subject, and preview text in context
Updates in real-time as user types
Dark mode toggle for preview
Step 5: Content (Email Body)

This step presents the Template Selection & Editor (see section 5.5 for full email builder details).

text

┌─────────────────────────────────────────────────────────────┐
│  DESIGN YOUR EMAIL                                           │
│                                                              │
│  Choose how to create your email:                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 🎨           │  │ 📋           │  │ </>           │      │
│  │ Drag & Drop  │  │ My Templates │  │ HTML Editor   │      │
│  │ Editor       │  │              │  │               │      │
│  │              │  │ Choose from  │  │ Paste or code │      │
│  │ Build with   │  │ your saved   │  │ your own HTML │      │
│  │ visual blocks│  │ templates    │  │               │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ 🖼️           │  │ ✉️           │                         │
│  │ Pre-built    │  │ Plain Text   │                         │
│  │ Templates    │  │              │                         │
│  │              │  │ Simple text  │                         │
│  │ Start from   │  │ only email   │                         │
│  │ a template   │  │              │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
After selection, the full email builder opens (see Section 5.5).

Step 6: Review & Send

text

┌─────────────────────────────────────────────────────────────┐
│  REVIEW YOUR CAMPAIGN                                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✅ Setup           Campaign: Summer Sale          │ [Edit]│
│  │  ✅ Recipients       Newsletter (8,234 contacts)   │ [Edit]│
│  │  ✅ Sender          Acme Corp <hi@acme.com>        │ [Edit]│
│  │  ✅ Subject          🎉 Summer Sale — 50% off...   │ [Edit]│
│  │  ✅ Content          Designed with drag & drop      │ [Edit]│
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ── SEND TEST EMAIL ──────────────────────────────────      │
│  [test@example.com        ] [Send Test]                      │
│  Enter up to 5 comma-separated emails                        │
│                                                              │
│  ── DELIVERY OPTIONS ─────────────────────────────────      │
│                                                              │
│  ● Send now                                                  │
│  ○ Schedule for later                                        │
│    ┌──────────────────┐ ┌──────────────┐                    │
│    │ Jun 15, 2025     │ │ 10:00 AM     │                    │
│    │ 📅               │ │ 🕐           │                    │
│    └──────────────────┘ └──────────────┘                    │
│    Timezone: [Eastern Time (ET) ▾]                           │
│                                                              │
│  ○ Use Smart Send (Brevo's Send Time Optimization)           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⚠️ CHECKLIST                                       │    │
│  │  ✅ Subject line is set                              │    │
│  │  ✅ Sender is verified                               │    │
│  │  ✅ Unsubscribe link included                        │    │
│  │  ✅ Content passes spam check                        │    │
│  │  ⚠️ No preview text set (optional)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [← Back]                  [Schedule Campaign] / [Send Now]  │
│                                                              │
│  (Confirmation modal on "Send Now":                          │
│   "You're about to send to 8,234 contacts. Continue?")      │
└─────────────────────────────────────────────────────────────┘
Pre-send Checklist (auto-validated):

Check	Rule	Status
Subject line	Not empty, < 150 chars	✅/❌
Sender verified	Sender email verified in Brevo	✅/❌
Unsubscribe link	{{ unsubscribe }} token present in HTML	✅/⚠️
Recipient list	At least 1 list/segment selected with > 0 contacts	✅/❌
Content	Email body is not empty	✅/❌
Spam check	Run content through spam word checker	✅/⚠️
Broken links	Validate all URLs in email body	✅/⚠️
Send Test Email:

Input accepts up to 5 comma-separated emails
"Send Test" button triggers Brevo POST /smtp/email to send a transactional test
Toast notification on success: "Test email sent!"
Brevo API Mapping for Campaign Creation:

text

POST /emailCampaigns → Create campaign
PUT /emailCampaigns/{campaignId} → Update campaign
POST /emailCampaigns/{campaignId}/sendNow → Send immediately
POST /emailCampaigns/{campaignId}/schedule → Schedule campaign
POST /emailCampaigns/{campaignId}/sendTest → Send test
5.4.3 A/B Testing (Phase 2)
Configuration in Subject Step:

Toggle "Enable A/B Test"
Shows two subject line inputs: Variant A and Variant B
Configuration:
Test size: Slider (10-50% of audience receives test variants)
Winner criteria: Radio — Open rate / Click rate
Test duration: Dropdown — 1 hour / 2 hours / 4 hours / 24 hours
After test: Winning variant sent to remaining audience automatically
Brevo API:

text

POST /emailCampaigns → with `abTesting` parameter
5.5 Email Template Builder
The drag-and-drop email editor — the most complex UI component.

5.5.1 Builder Layout
text

┌──────────────────────────────────────────────────────────────────┐
│  TOOLBAR                                                          │
│  [← Back] Campaign: Summer Sale  [Preview] [Test] [Save] [Done]  │
│  Device toggles: [🖥️ Desktop] [📱 Mobile]                        │
├──────────┬───────────────────────────────────┬───────────────────┤
│          │                                   │                   │
│  BLOCKS  │     CANVAS / PREVIEW              │   PROPERTIES     │
│  PANEL   │                                   │   PANEL          │
│ (280px)  │     (flex, centered)              │   (320px)        │
│          │                                   │                   │
│ LAYOUT   │  ┌─────────────────────────┐     │  (Shows when a   │
│ ├ 1 col  │  │                         │     │   block is       │
│ ├ 2 col  │  │    [Header Image]       │     │   selected)      │
│ ├ 3 col  │  │                         │     │                   │
│ ├ 4 col  │  │    [Text Block]         │     │  STYLE           │
│          │  │    "Hello {{NAME}}"     │     │  Font: [Inter ▾] │
│ CONTENT  │  │                         │     │  Size: [16px ▾]  │
│ ├ Text   │  │    [Image Block]        │     │  Color: [■ #333] │
│ ├ Image  │  │    [hero-image.jpg]     │     │  Align: [L C R]  │
│ ├ Button │  │                         │     │  Bold Italic Und │
│ ├ Divider│  │    [Button Block]       │     │                   │
│ ├ Spacer │  │    [ Shop Now → ]       │     │  SPACING         │
│ ├ Social │  │                         │     │  Padding: [T R B L│]
│ ├ Video  │  │    [Footer Block]       │     │  Margin: [T R B L]│
│ ├ HTML   │  │    Unsubscribe link     │     │                   │
│ ├ Menu   │  │                         │     │  BACKGROUND      │
│          │  └─────────────────────────┘     │  Color: [■ #FFF] │
│ SAVED    │                                   │  Image: [Upload] │
│ ├ Block1 │                                   │                   │
│ ├ Block2 │                                   │                   │
│          │                                   │                   │
└──────────┴───────────────────────────────────┴───────────────────┘
5.5.2 Block Types — Detailed Specifications
Layout Blocks:

Block	Description	Properties
1 Column	Full-width single column	Width (px or %), padding, background color, background image, border
2 Columns	Side-by-side columns	Column ratio: 50/50, 33/67, 67/33, 25/75, 75/25. Individual column padding, background
3 Columns	Three columns	Equal or custom ratios. Individual column styling
4 Columns	Four columns	Equal widths only. Best for icon grids
Content Blocks:

Block	Drag Label	Canvas Appearance	Properties Panel
Text	"Aa" icon + "Text"	WYSIWYG editable area. Click to type.	Font family (15 web-safe fonts), size (10-72px), color picker, line height, letter spacing, alignment (L/C/R/J), bold, italic, underline, strikethrough, link insertion, ordered/unordered list, personalization token insertion
Image	🖼️ icon + "Image"	Image placeholder (gray dashed box with upload icon). After upload: shows image with resize handles.	Image source (upload or URL), alt text, width (auto/px/%/), alignment, link URL, border radius, padding
Button	🔘 icon + "Button"	Rendered button with text	Button text, URL, font (family, size, color), background color, border (color, width, radius), padding (inner), width (auto/full), alignment, hover color (for supported clients)
Divider	"—" icon + "Divider"	Horizontal line	Style (solid, dashed, dotted), color, width, thickness, padding above/below
Spacer	"↕" icon + "Spacer"	Transparent space	Height (px): slider 10-100px
Social	Share icon + "Social"	Row of social media icons	Platforms to show (toggle each): Facebook, Twitter/X, Instagram, LinkedIn, YouTube, TikTok, Pinterest. For each: URL, icon style (color, outlined, filled, rounded, square), icon size (S/M/L), spacing, alignment
Video	▶️ icon + "Video"	Video thumbnail with play button overlay	Video URL (YouTube/Vimeo), thumbnail image (auto-fetched or custom upload), play button style, alt text, link to video
HTML	</> icon + "HTML"	Rendered HTML output	Code editor (with syntax highlighting) for custom HTML. Warning: "Custom HTML may render differently across email clients"
Menu/Nav	≡ icon + "Menu"	Horizontal menu links	Add menu items (text + URL), separator style, font, alignment, color
Footer	Footer icon + "Footer"	Pre-configured footer block	Company address (text), unsubscribe link (auto-inserted {{ unsubscribe }}), update preferences link, copyright text
Product (Phase 2)	🛍️ icon + "Product"	Product card with image, name, price, CTA	Manual input or API integration for product data
5.5.3 Drag-and-Drop Interactions
Interaction	Behavior
Drag from panel	Block ghost follows cursor. Canvas shows blue drop indicator line between existing blocks. Drop zone highlights on hover.
Reorder on canvas	Click and hold any block → drag up/down. Other blocks smoothly animate to make space. Blue line indicator shows drop position.
Select block	Click any block on canvas. Blue border appears (2px solid #6366F1). Properties panel populates on right.
Delete block	Select block → Delete key, or click trash icon that appears on block hover (top-right corner). Confirmation: "Delete this block?" with Undo option (5 second toast).
Duplicate block	Copy icon on block hover (top-right, next to trash). Duplicate inserted directly below.
Move block	Drag handle (⋮⋮ grip dots) appears on block hover (top-left).
Hover state	Block gets light dashed border. Action icons appear (drag, duplicate, delete).
5.5.4 Properties Panel Details
When no block is selected — Show "Email Settings":

Setting	Control
Email width	Slider: 480-800px (default: 600px)
Background color	Color picker (entire email background)
Content area background	Color picker (content column background)
Default font	Font family dropdown
Default text color	Color picker
Link color	Color picker
Border	Color, width, radius for content area
When block is selected — Show block-specific properties (see table above)

Color Picker Component:

Square color area (saturation/brightness) + vertical hue slider
Hex input field
RGB input fields (collapsible)
Opacity slider
Recent colors row (last 8 used)
Brand colors row (set in account settings)
Preset color swatches (16 common colors)
5.5.5 WYSIWYG Text Editor Toolbar
Appears above text block when editing:

text

[B] [I] [U] [S] | [H1] [H2] [H3] [P] | [≡L] [≡C] [≡R] | [🔗] [🖼️] | [{}] | [⋮]
Button	Function
B/I/U/S	Bold, Italic, Underline, Strikethrough
H1/H2/H3/P	Heading levels and paragraph
≡ L/C/R	Text alignment
🔗	Insert/edit link (modal: URL, display text, open in new tab checkbox, button style toggle)
🖼️	Insert inline image
{}	Insert personalization token (dropdown of available merge tags)
⋮	More: Text color, highlight color, ordered list, unordered list, blockquote, clear formatting
5.5.6 Image Upload & Management
Upload Modal (triggered from Image block or text editor):

text

┌─────────────────────────────────────────────────────────┐
│  INSERT IMAGE                                [✕ Close]  │
│                                                         │
│  TABS: [Upload] [My Images] [Stock Photos] [URL]        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │    📁 Drag & drop image here                    │   │
│  │    or click to browse                           │   │
│  │                                                 │   │
│  │    Max 10MB · JPG, PNG, GIF, WebP               │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  "My Images" tab: Grid of previously uploaded images    │
│  with search and pagination                             │
│                                                         │
│  "Stock Photos" tab: Integration with Unsplash/Pexels   │
│  Search bar + results grid                              │
│                                                         │
│  "URL" tab: Direct URL input + preview                  │
│                                                         │
│  [Cancel]                              [Insert Image]   │
└─────────────────────────────────────────────────────────┘
Storage: Images uploaded to our CDN (e.g., Cloudflare R2 or AWS S3 + CloudFront). URL stored in template HTML.

5.5.7 Preview Mode
Trigger: "Preview" button in builder toolbar

text

┌────────────────────────────────────────────────────────┐
│  PREVIEW MODE           [Desktop 🖥️] [Mobile 📱] [✕]  │
│                                                        │
│  Personalization: [Sarah Lee ▾] (select test contact)  │
│                                                        │
│  ┌──────────────────────────────────────┐             │
│  │                                      │             │
│  │   (Full rendered email preview)      │             │
│  │                                      │             │
│  │   Desktop: 100% width               │             │
│  │   Mobile: 375px centered wrapper     │             │
│  │                                      │             │
│  └──────────────────────────────────────┘             │
│                                                        │
│  [Send Test Email]  [Edit]                             │
└────────────────────────────────────────────────────────┘
Desktop preview: Full-width rendering
Mobile preview: 375px iframe wrapper, centered, with phone-frame visual (optional)
Personalization dropdown: Select a contact from audience to preview with their real data merged in
5.5.8 Template Library
Page: /templates

text

┌──────────────────────────────────────────────────────────────┐
│  "Templates" (H1)                                            │
│  [+ Create Template]                                         │
│                                                              │
│  TABS: [My Templates (12)] [Pre-built (50+)]                 │
│                                                              │
│  FILTER BAR: [All Categories ▾] [Sort: Newest ▾]            │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │            │ │            │ │            │ │            ││
│  │ [Preview]  │ │ [Preview]  │ │ [Preview]  │ │ [Preview]  ││
│  │            │ │            │ │            │ │            ││
│  │ Template 1 │ │ Template 2 │ │ Template 3 │ │ Template 4 ││
│  │ Newsletter │ │ Promo Sale │ │ Welcome    │ │ Product    ││
│  │ Modified:  │ │ Modified:  │ │ Modified:  │ │ Modified:  ││
│  │ Jun 10     │ │ Jun 8      │ │ Jun 5      │ │ Jun 1      ││
│  │ [Use] [⋮] │ │ [Use] [⋮] │ │ [Use] [⋮] │ │ [Use] [⋮] ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
Template Card:

Size: 280px wide, auto height
Preview: Thumbnail screenshot of template (320px height, overflow hidden)
On hover: Overlay with "Preview" and "Use Template" buttons
Below preview: Template name (16px bold), category tag, last modified date
Three-dot menu: Edit, Duplicate, Rename, Delete, Export HTML
Pre-built Template Categories:

Category	Count	Examples
Newsletter	8	Classic newsletter, Modern digest, Minimal update
Promotional	10	Sale announcement, Flash sale, Seasonal promo
Welcome	5	Welcome series, Onboarding, Getting started
Product	6	Product launch, Feature update, Product showcase
Event	5	Event invitation, Webinar, Conference
E-commerce	8	Order confirmation, Abandoned cart, Review request
Transactional	4	Password reset, Account verification, Receipt
Minimal	4	Plain text style, Simple CTA, Basic announcement
Brevo API Mapping:

text

GET /smtp/templates → List templates
POST /smtp/templates → Create template
PUT /smtp/templates/{templateId} → Update template
DELETE /smtp/templates/{templateId} → Delete template
Note: We store template JSON (builder state) in our database and the compiled HTML in Brevo. This ensures we can reconstruct the builder view for editing.

5.5.9 Saved Blocks
Users can save reusable blocks (e.g., a branded header, a standard footer):

"Save Block" option in block's three-dot menu on canvas
Prompts for name and optional category
Saved blocks appear in left panel under "Saved" section
Drag from "Saved" to canvas like any other block
Manage saved blocks: Rename, update, delete
5.6 Automation Module
5.6.1 Automations List
Page: /automations

text

┌──────────────────────────────────────────────────────────────┐
│  "Automations" (H1)                                          │
│  [+ Create Automation]                                       │
│                                                              │
│  TABS: [My Automations (5)] [Pre-built Recipes (15)]         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ⚡ Welcome Series                           🟢 Active   ││
│  │  Trigger: When contact subscribes to Newsletter list      ││
│  │  3 steps · 2,345 contacts entered · 89% completion        ││
│  │                                     [Edit] [Pause] [⋮]   ││
│  │──────────────────────────────────────────────────────────││
│  │  ⚡ Re-engagement Campaign                   🟡 Paused   ││
│  │  Trigger: No open in 90 days                              ││
│  │  2 steps · 567 contacts entered · 34% completion          ││
│  │                                     [Edit] [Resume] [⋮]  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  PRE-BUILT RECIPES:                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 👋       │ │ 🛒       │ │ 🎂       │ │ 📊       │       │
│  │ Welcome  │ │ Abandoned│ │ Birthday │ │ Follow-up│        │
│  │ Series   │ │ Cart     │ │ Email    │ │ Sequence │        │
│  │ [Use →]  │ │ [Use →]  │ │ [Use →]  │ │ [Use →]  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────────────────────────────────────────────┘
5.6.2 Automation Builder (Visual Workflow)
Page: /automations/:id/edit

text

┌──────────────────────────────────────────────────────────────┐
│  TOOLBAR: [← Back] "Welcome Series" [Save] [Activate/Pause] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CANVAS (full screen, pannable, zoomable):                   │
│                                                              │
│         ┌──────────────────┐                                │
│         │ 🎯 TRIGGER       │                                │
│         │ Contact added to │                                │
│         │ "Newsletter" list│                                │
│         └────────┬─────────┘                                │
│                  │                                           │
│                  ▼                                           │
│         ┌──────────────────┐                                │
│         │ ⏱️ DELAY          │                                │
│         │ Wait 1 hour      │                                │
│         └────────┬─────────┘                                │
│                  │                                           │
│                  ▼                                           │
│         ┌──────────────────┐                                │
│         │ 📧 SEND EMAIL    │                                │
│         │ "Welcome Email"  │                                │
│         │ Open: 45% | Cl: 8│%                               │
│         └────────┬─────────┘                                │
│                  │                                           │
│                  ▼                                           │
│         ┌──────────────────┐                                │
│         │ ⏱️ DELAY          │                                │
│         │ Wait 3 days      │                                │
│         └────────┬─────────┘                                │
│                  │                                           │
│                  ▼                                           │
│         ┌──────────────────┐                                │
│         │ ❓ CONDITION      │                                │
│         │ Opened Welcome?  │                                │
│         └───┬─────────┬────┘                                │
│          Yes│         │No                                    │
│             ▼         ▼                                      │
│         ┌──────┐ ┌──────┐                                   │
│         │ 📧   │ │ 📧   │                                   │
│         │Send  │ │Send  │                                    │
│         │Tip 1 │ │Nudge │                                    │
│         └──────┘ └──────┘                                   │
│                                                              │
│         [+ Add Step] (appears at bottom of flow)             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
5.6.3 Automation Node Types
Node Type	Icon	Configuration	Brevo Mapping
Trigger	🎯	- Contact added to list<br>- Contact submits form<br>- Tag added<br>- Date-based (birthday, anniversary)<br>- Custom event (via API/webhook)	Automation trigger in Brevo
Send Email	📧	Select/create email template. Configure sender, subject. Shows live stats once active.	POST /smtp/email or Brevo automation action
Delay	⏱️	Duration: Number + unit (minutes, hours, days, weeks). Or "Wait until" specific day/time.	Brevo automation delay
Condition (If/Else)	❓	Condition types: Opened previous email, clicked link, has tag, is in list, custom field value, date comparison. Creates two branches: Yes/No.	Brevo automation condition
Add Tag	🏷️	Select or create tag to add to contact	Update contact attributes
Remove Tag	🏷️✕	Select tag to remove	Update contact attributes
Add to List	📋+	Select list	POST /contacts/lists/{id}/contacts/add
Remove from List	📋-	Select list	POST /contacts/lists/{id}/contacts/remove
Update Contact	✏️	Set field value (any contact attribute)	PUT /contacts/{email}
Webhook	🔗	URL, method (POST/GET), headers, body template	Custom implementation
End	🔴	Terminal node. Optional: mark contact with completion tag.	—
5.6.4 Automation Node UI Details
Node Card:

Width: 280px
Border-radius: 12px
Border: 2px solid color-coded (trigger=indigo, email=blue, delay=yellow, condition=purple, action=green)
Padding: 16px
Top-left: Icon (24px)
Title: 14px bold
Description/config: 13px gray
Stats (if active): Small text showing "2,345 processed" or open/click rates
Click to select → Properties panel opens on right
Hover: Shadow increase, edit icon appears
Connection Lines:

SVG path lines between nodes
Animated dashed line for active automations (shows "flow")
Condition branches: Yes labeled in green, No in red
Curved bezier connections
Add Step:

"+" button appears between nodes on hover
Click opens: Quick-add menu with all node types as icon buttons
5.6.5 Automation Recipes (Pre-built)
Recipe	Trigger	Steps
Welcome Series	List subscription	Delay 1h → Welcome email → Delay 3d → Getting started email → Delay 7d → Feature highlight
Re-engagement	No opens 60 days	"We miss you" email → Delay 7d → Condition (opened?) → Yes: tag "re-engaged" / No: "Last chance" email
Birthday	Date field match	Birthday email with special offer
Post-Purchase	Tag "purchased" added	Thank you email → Delay 14d → Review request → Delay 30d → Cross-sell
Lead Nurture	Form submission	Delay 1d → Educational email 1 → Delay 3d → Email 2 → Delay 3d → CTA email
5.7 Forms & Signup Pages
5.7.1 Forms List
Page: /forms

List of signup/subscription forms with:

Form name, type (embedded, popup, landing page), submissions count, status (active/inactive)
Actions: Edit, get embed code, duplicate, delete, view submissions
5.7.2 Form Builder
Simple form builder with:

Form fields: Add/remove fields (email required, name, custom fields)
Design: Background color, font, button color/text, border radius, padding
Success message: Custom text or redirect URL
Double opt-in: Toggle to require email confirmation
List assignment: Which list(s) to add subscribers to
Tags: Auto-apply tags to new subscribers
Embed code: Generated <form> HTML or JavaScript snippet
GDPR: Consent checkbox configuration
Brevo API:
Forms will POST to our backend, which then calls Brevo's POST /contacts to create the subscriber.

5.7.3 Popup/Embedded Form Display Options
Type	Description	Configuration
Embedded	Inline form for website	Width, height, styling. Generates <div> + <script>
Popup	Modal overlay	Trigger: on load, on scroll %, on exit intent, after X seconds. Frequency: once per session/day/week.
Slide-in	Bottom corner slide-up	Position: bottom-left/bottom-right. Same trigger options.
Top Bar	Fixed banner at top of page	Show/hide toggle, dismiss button, background color
5.8 Analytics & Reporting
5.8.1 Campaign Report Page
Page: /campaigns/:id/report

text

┌──────────────────────────────────────────────────────────────┐
│  ← Back to Campaigns                                         │
│                                                              │
│  "Summer Sale Announcement" — REPORT                         │
│  Sent Jun 10, 2025 at 2:30 PM · To: Newsletter (8,234)      │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Delivered│ │ Opened   │ │ Clicked  │ │ Unsub    │        │
│  │ 8,112    │ │ 1,972    │ │ 312      │ │ 8        │        │
│  │ 98.5%    │ │ 24.3%    │ │ 3.8%     │ │ 0.1%     │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Bounced  │ │ Spam     │ │ Unique   │ │ Revenue  │        │
│  │ 122      │ │ Complaints│ │ Opens   │ │ (Phase 2)│        │
│  │ 1.5%     │ │ 2        │ │ 1,654    │ │ $12,345  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ── ENGAGEMENT OVER TIME ─────────────────────────────       │
│  [Line chart: Opens & Clicks over first 72 hours]            │
│  X-axis: Hours since send (0, 1, 2, 4, 8, 12, 24, 48, 72)  │
│  Y-axis: Cumulative count                                    │
│                                                              │
│  ── CLICK MAP ────────────────────────────────────────       │
│  [Email preview with heatmap overlay showing click           │
│   density on each link]                                      │
│                                                              │
│  ── TOP LINKS CLICKED ───────────────────────────────        │
│  1. https://shop.acme.com/sale      — 187 clicks (60%)      │
│  2. https://shop.acme.com/new       — 89 clicks (28.5%)     │
│  3. https://acme.com/blog           — 36 clicks (11.5%)     │
│                                                              │
│  ── SUBSCRIBER ACTIVITY ─────────────────────────────        │
│  [Tabs: Opened | Clicked | Bounced | Unsubscribed]           │
│  [Searchable table of contacts with activity details]        │
│                                                              │
│  ── GEOGRAPHIC DATA (Phase 2) ───────────────────────        │
│  [World map with open density]                               │
│                                                              │
│  ── DEVICE & CLIENT STATS ───────────────────────────        │
│  Desktop: 45% | Mobile: 50% | Tablet: 5%                    │
│  Top clients: Apple Mail (35%), Gmail (28%), Outlook (20%)   │
│                                                              │
│  [Export Report PDF]  [Share Report Link]                     │
└──────────────────────────────────────────────────────────────┘
5.8.2 KPI Card Details (Report Page)
Metric	Calculation	Display
Delivered	Sent - Bounced	Count + percentage of sent
Opened	Unique opens	Count + percentage of delivered
Clicked	Unique clicks	Count + percentage of delivered
Unsubscribed	Unsubscribe events	Count + percentage of delivered
Bounced	Hard + soft bounces	Count + percentage of sent. Breakdown on hover.
Spam Complaints	Complaint events	Count + percentage. Red highlight if > 0.1%
Brevo API:

text

GET /emailCampaigns/{campaignId} → Campaign details with stats
GET /emailCampaigns/{campaignId}/statistics/links → Click details
GET /emailCampaigns/{campaignId}/statistics/events → Event log
5.8.3 Engagement Over Time Chart
Type: Area chart with two series
Series 1: Cumulative opens (blue area)
Series 2: Cumulative clicks (green area, overlaid)
Time range: First 72 hours, with data points at 0, 1, 2, 4, 8, 12, 24, 48, 72 hours
Tooltip: Shows exact count at each time point
5.8.4 Click Map
Rendered email preview with colored overlay bars on each clickable element
Each link shows a bar with click count and percentage
Color intensity corresponds to click volume (darker = more clicks)
Scrollable within container
Toggle: Show/hide overlay
5.8.5 Audience-Level Analytics
Page: /analytics

Overview dashboard for all campaigns and audience:

Section	Charts/Data
Performance Overview	KPI cards: Total emails sent (all time, this month), avg open rate, avg click rate, list growth rate
Campaign Comparison	Bar chart comparing last 10 campaigns by open rate or click rate
Engagement Trends	Line chart of open/click rates over last 6 months
List Growth	Area chart of subscriber count over time, with new subscribers and unsubscribes
Best Performing	Table of top 5 campaigns by open rate and by click rate
Send Time Analysis	Heatmap (day of week × hour) showing best open rates by send time
5.9 Settings & Account Management
Page: /settings

5.9.1 Settings Navigation (Left Sidebar within Settings)
text

Settings
├── General
├── Brevo Connection
├── Sender Identities
├── Custom Fields
├── Team Members
├── Billing (Phase 2)
├── API Keys
├── Webhooks
├── Notifications
└── Danger Zone
5.9.2 Settings Sections Detail
General Settings (/settings/general):

Setting	Control
Organization name	Text input
Organization logo	Image upload (used in app header)
Timezone	Searchable dropdown (all IANA timezones)
Date format	Radio: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
Language	Dropdown: English, Spanish, French, German, Portuguese (Phase 2)
Default "From" name	Text input
Default reply-to email	Email input
Company address	Textarea (used in email footers, required for CAN-SPAM)
Brand colors	3 color pickers: Primary, Secondary, Accent (used in template builder defaults)
Brevo Connection (/settings/brevo):

Element	Details
API Key	Masked input showing last 4 chars. "Change" button to update. "Test Connection" button.
Account info	Display Brevo account name, plan, email credits remaining, IP info
Connection status	Green "Connected" or red "Disconnected" badge
Sync status	Last sync timestamp. "Sync Now" button.
Webhook URL	Our webhook endpoint URL for Brevo to send events to. With "Copy" button.
Sender Identities (/settings/senders):

Column	Details
Sender name	Text
Sender email	Email
Status	Verified (green) / Pending (yellow) / Failed (red)
Actions	Set as default, resend verification, delete
Add new	Button → modal with name + email fields
Custom Fields (/settings/fields):

Column	Details
Field name	Text (auto-generates API name)
Type	Text, Number, Date, Boolean, Dropdown (with options)
Required	Toggle
Actions	Edit, delete
Add new	Button → modal
These map to Brevo contact attributes:

text

GET /contacts/attributes → List attributes
POST /contacts/attributes/{attributeCategory}/{attributeName} → Create
DELETE /contacts/attributes/{attributeCategory}/{attributeName} → Delete
Team Members (/settings/team):

Column	Details
Name	Text
Email	Email
Role	Dropdown: Owner, Admin, Editor, Viewer
Status	Active / Pending invitation
Actions	Change role, remove, resend invite
Role Permissions:

Permission	Owner	Admin	Editor	Viewer
Manage team	✅	✅	❌	❌
Manage billing	✅	❌	❌	❌
Manage settings	✅	✅	❌	❌
Create/edit campaigns	✅	✅	✅	❌
Send campaigns	✅	✅	✅	❌
Manage contacts	✅	✅	✅	❌
View reports	✅	✅	✅	✅
Delete campaigns	✅	✅	❌	❌
Manage automations	✅	✅	✅	❌
API Keys (/settings/api):

Generate API keys for external integrations
Table: Key name, created date, last used, masked key
Actions: Copy, regenerate, revoke
Webhooks (/settings/webhooks):

Configure outgoing webhooks from our app
Events: Contact created, campaign sent, campaign opened, link clicked
URL, secret, active/inactive toggle
6. UI/UX Specifications
6.1 Design System
Color Palette
Token	Hex	Usage
--primary-50	#EEF2FF	Primary tint backgrounds
--primary-100	#E0E7FF	Hover states
--primary-500	#6366F1	Primary brand color — buttons, links, active states
--primary-600	#4F46E5	Button hover
--primary-700	#4338CA	Button active/pressed
--gray-50	#F9FAFB	Page backgrounds, table row hover
--gray-100	#F3F4F6	Card backgrounds, input backgrounds
--gray-200	#E5E7EB	Borders, dividers
--gray-300	#D1D5DB	Disabled state borders
--gray-400	#9CA3AF	Placeholder text
--gray-500	#6B7280	Secondary text, labels
--gray-700	#374151	Body text
--gray-900	#111827	Headings, primary text
--success	#10B981	Success states, positive metrics
--warning	#F59E0B	Warning states, pending
--error	#EF4444	Error states, negative metrics, destructive actions
--info	#3B82F6	Informational states
--white	#FFFFFF	Card backgrounds, text on dark
Typography
Element	Font	Size	Weight	Line Height	Color
H1 (Page title)	Inter	28px	700 (Bold)	36px	--gray-900
H2 (Section title)	Inter	22px	600 (Semibold)	28px	--gray-900
H3 (Card title)	Inter	18px	600	24px	--gray-900
Body	Inter	14px	400 (Regular)	20px	--gray-700
Body Small	Inter	13px	400	18px	--gray-500
Label	Inter	14px	500 (Medium)	20px	--gray-700
Caption	Inter	12px	400	16px	--gray-500
Button	Inter	14px	600	20px	White or --primary-500
Nav Link	Inter	14px	500	20px	--gray-700
Monospace (code)	JetBrains Mono	13px	400	18px	--gray-700
Spacing Scale (using 4px base)
Token	Value	Usage
--space-1	4px	Minimal spacing
--space-2	8px	Inline element spacing
--space-3	12px	Tight component spacing
--space-4	16px	Standard component padding
--space-5	20px	Form field spacing
--space-6	24px	Card padding
--space-8	32px	Section spacing
--space-10	40px	Large section spacing
--space-12	48px	Page-level spacing
--space-16	64px	Major section breaks
Border Radius
Token	Value	Usage
--radius-sm	4px	Small pills, tags
--radius-md	8px	Inputs, small cards
--radius-lg	12px	Cards, modals
--radius-xl	16px	Large cards
--radius-full	9999px	Circular avatars, round buttons
Shadows
Token	Value	Usage
--shadow-sm	0 1px 2px rgba(0,0,0,0.05)	Subtle card elevation
--shadow-md	0 4px 6px -1px rgba(0,0,0,0.1)	Cards, dropdowns
--shadow-lg	0 10px 15px -3px rgba(0,0,0,0.1)	Modals, popovers
--shadow-xl	0 20px 25px -5px rgba(0,0,0,0.1)	Slide-in panels
6.2 Component Library
Buttons
Variant	Styles	Usage
Primary	BG: --primary-500, Text: white, Height: 40px, Padding: 0 16px, Radius: --radius-md, Hover: --primary-600, Active: --primary-700, Disabled: opacity 50%	Main CTAs, form submits
Secondary	BG: white, Border: 1px solid --gray-300, Text: --gray-700, Hover: --gray-50 bg	Secondary actions, cancel
Ghost	BG: transparent, Text: --gray-700, Hover: --gray-100 bg	Tertiary actions, toolbar buttons
Danger	BG: --error, Text: white, Hover: darker red	Delete, destructive actions
Icon	40x40px, rounded, ghost variant, centered icon	Toolbar icons, action icons
Button sizes: sm (32px height), md (40px height, default), lg (48px height)

Input Fields
State	Styles
Default	BG: white, Border: 1px solid --gray-300, Radius: --radius-md, Height: 40px, Padding: 0 12px, Font: 14px
Focus	Border: 2px solid --primary-500, Box-shadow: 0 0 0 3px rgba(99,102,241,0.1)
Error	Border: 2px solid --error, Error message below in red 12px
Disabled	BG: --gray-100, Border: --gray-200, Text: --gray-400, cursor: not-allowed
With icon	Left padding: 40px, Icon: 20px, positioned left 12px, --gray-400 color
Label: Above input, 14px medium, --gray-700, margin-bottom 6px
Helper text: Below input, 12px, --gray-500, margin-top 4px
Error text: Below input, 12px, --error, margin-top 4px, with ⚠️ icon

Modals
Element	Specification
Overlay	rgba(0,0,0,0.5), backdrop-blur: 2px
Container	White, --radius-lg, --shadow-xl, max-width varies (sm: 400px, md: 560px, lg: 720px, xl: 900px)
Header	Padding: 24px 24px 0. Title: H3. Close button: top-right, 32x32 icon button
Body	Padding: 24px. Scrollable if exceeds max-height (70vh)
Footer	Padding: 16px 24px. Right-aligned buttons. Border-top: 1px solid --gray-200
Animation	Fade in overlay (200ms) + slide up modal (300ms, ease-out)
Toast Notifications
Type	Icon	Color	Duration
Success	✅	Green left border	4 seconds
Error	❌	Red left border	6 seconds (or persistent)
Warning	⚠️	Yellow left border	5 seconds
Info	ℹ️	Blue left border	4 seconds
Position: Top-right, stacked. Width: 380px. Shadow: --shadow-lg. Slide in from right, fade out.
Structure: Left color bar (4px) + icon + message text + optional action link + close button.

Tables
Element	Styles
Header row	BG: --gray-50, Font: 12px uppercase --gray-500 font-weight 600, Padding: 12px 16px, sticky top
Body row	BG: white, Font: 14px --gray-700, Padding: 12px 16px, border-bottom: 1px solid --gray-100
Hover row	BG: --gray-50
Selected row	BG: --primary-50, left border: 2px solid --primary-500
Sort indicator	Arrow icon next to sortable column header, --gray-400 (inactive), --gray-900 (active)
Status Badges/Pills
Status	Background	Text	Icon
Active / Subscribed	#D1FAE5	#065F46	Green dot
Inactive / Unsubscribed	#FEE2E2	#991B1B	Red dot
Pending / Scheduled	#DBEAFE	#1E40AF	Blue dot
Draft	#F3F4F6	#374151	Gray dot
Warning / Bounced	#FEF3C7	#92400E	Yellow dot
Sending	#FEF3C7	#92400E	Animated spinner
Size: Height 24px, Padding: 0 10px, Font: 12px medium, Radius: --radius-full

7. Information Architecture & Navigation
7.1 Top Navigation Bar
text

┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Audience  Campaigns  Automations  Templates  │
│                                        Forms  Analytics  [👤 ▾] │
└──────────────────────────────────────────────────────────────────┘
Element	Specification
Height	64px
Background	White (#FFFFFF)
Border-bottom	1px solid --gray-200
Position	Fixed top (sticky)
Z-index	50
Logo	Left-aligned, 32px height, 16px left margin
Nav links	Horizontal, 14px medium, --gray-700, 24px horizontal spacing
Active link	--primary-500 color, 2px bottom border (indigo)
Hover link	--primary-500 color
User menu (right)	Avatar circle (32px) + dropdown arrow. Dropdown: Account settings, team, help, logout
Mobile (< 768px)	Hamburger menu → slide-in drawer from left
7.2 User Menu Dropdown
text

┌─────────────────────────┐
│ Sarah Lee                │
│ sarah@acme.com           │
│ Acme Corp                │
│─────────────────────────│
│ ⚙️ Settings              │
│ 👥 Team                  │
│ 🔑 API Keys              │
│ ❓ Help & Support         │
│ 📄 Documentation          │
│─────────────────────────│
│ 🚪 Log out               │
└─────────────────────────┘
7.3 Complete Route Map
text

/                          → Redirect to /dashboard
/login                     → Login page
/signup                    → Registration page
/forgot-password           → Password reset request
/reset-password            → Password reset form
/onboarding                → Post-signup wizard (4 steps)
/onboarding/company        → Step 1
/onboarding/brevo          → Step 2
/onboarding/sender         → Step 3
/onboarding/import         → Step 4

/dashboard                 → Main dashboard

/audience                  → Contacts list (default tab: All Contacts)
/audience?tab=lists        → Lists management
/audience?tab=segments     → Segments management
/audience?tab=tags         → Tags management
/audience/import           → Import contacts wizard
/audience/export           → Export contacts
/audience/contact/:id      → Contact detail page (or side panel)

/campaigns                 → Campaigns list
/campaigns/new             → Campaign creation wizard
/campaigns/:id/edit        → Edit campaign (same wizard)
/campaigns/:id/report      → Campaign analytics report

/templates                 → Template library
/templates/new             → Template builder (blank)
/templates/:id/edit        → Edit template in builder
/templates/gallery         → Pre-built template gallery

/automations               → Automations list
/automations/new           → Create automation (or choose recipe)
/automations/:id/edit      → Automation workflow builder
/automations/:id/report    → Automation analytics

/forms                     → Forms list
/forms/new                 → Form builder
/forms/:id/edit            → Edit form
/forms/:id/submissions     → View form submissions

/analytics                 → Overall analytics dashboard
/analytics/campaigns       → Campaign comparison
/analytics/audience        → Audience growth analytics

/settings                  → Redirect to /settings/general
/settings/general          → General settings
/settings/brevo            → Brevo API connection
/settings/senders          → Sender identity management
/settings/fields           → Custom contact fields
/settings/team             → Team member management
/settings/billing          → Billing & plan (Phase 2)
/settings/api              → API key management
/settings/webhooks         → Webhook configuration
/settings/notifications    → Notification preferences
/settings/danger           → Delete account, export all data
8. Database Schema
8.1 Core Tables
SQL

-- Users & Authentication
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  avatar_url      VARCHAR(500),
  email_verified  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  last_login_at   TIMESTAMP
);

-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  industry        VARCHAR(100),
  company_size    VARCHAR(20),
  website         VARCHAR(500),
  address         TEXT,
  logo_url        VARCHAR(500),
  timezone        VARCHAR(50) DEFAULT 'UTC',
  date_format     VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  primary_color   VARCHAR(7) DEFAULT '#6366F1',
  secondary_color VARCHAR(7),
  accent_color    VARCHAR(7),
  brevo_api_key   TEXT, -- encrypted (AES-256)
  brevo_account_name VARCHAR(200),
  brevo_connected BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Organization Memberships
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
  invited_by      UUID REFERENCES users(id),
  invitation_token VARCHAR(255),
  invitation_status VARCHAR(20) DEFAULT 'accepted' CHECK (invitation_status IN ('pending','accepted','declined')),
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Campaigns (our metadata — source of truth is Brevo for sent campaigns)
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  brevo_campaign_id BIGINT, -- Brevo's campaign ID after creation
  name            VARCHAR(200) NOT NULL,
  type            VARCHAR(20) DEFAULT 'regular' CHECK (type IN ('regular','ab_test','automated')),
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','paused','archived')),
  
  -- Sender info
  sender_name     VARCHAR(200),
  sender_email    VARCHAR(255),
  reply_to        VARCHAR(255),
  
  -- Content
  subject         VARCHAR(500),
  preview_text    VARCHAR(500),
  html_content    TEXT,
  json_content    JSONB, -- drag-and-drop builder state
  template_id     UUID REFERENCES templates(id),
  
  -- Recipients
  recipient_type  VARCHAR(20) CHECK (recipient_type IN ('all','lists','segment','tags')),
  list_ids        JSONB, -- array of Brevo list IDs
  segment_ids     JSONB, -- array of segment IDs
  tag_filters     JSONB,
  exclusion_list_ids JSONB,
  estimated_recipients INTEGER,
  
  -- Schedule
  scheduled_at    TIMESTAMP,
  sent_at         TIMESTAMP,
  
  -- A/B Test config
  ab_test_enabled BOOLEAN DEFAULT FALSE,
  ab_subject_b    VARCHAR(500),
  ab_test_size    INTEGER, -- percentage
  ab_winner_criteria VARCHAR(20),
  ab_test_duration INTEGER, -- hours
  
  -- Internal
  tags            JSONB, -- internal campaign tags/labels
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Campaign Stats Cache (synced from Brevo periodically)
CREATE TABLE campaign_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  sent            INTEGER DEFAULT 0,
  delivered       INTEGER DEFAULT 0,
  unique_opens    INTEGER DEFAULT 0,
  total_opens     INTEGER DEFAULT 0,
  unique_clicks   INTEGER DEFAULT 0,
  total_clicks    INTEGER DEFAULT 0,
  unsubscribes    INTEGER DEFAULT 0,
  hard_bounces    INTEGER DEFAULT 0,
  soft_bounces    INTEGER DEFAULT 0,
  spam_complaints INTEGER DEFAULT 0,
  open_rate       DECIMAL(5,2),
  click_rate      DECIMAL(5,2),
  click_data      JSONB, -- per-link click details
  device_data     JSONB, -- device/client breakdown
  last_synced_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id)
);

-- Templates
CREATE TABLE templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  brevo_template_id BIGINT,
  name            VARCHAR(200) NOT NULL,
  category        VARCHAR(50),
  html_content    TEXT,
  json_content    JSONB, -- builder state
  thumbnail_url   VARCHAR(500),
  is_prebuilt     BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Saved Blocks (reusable email components)
CREATE TABLE saved_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  category        VARCHAR(50),
  json_content    JSONB NOT NULL,
  html_content    TEXT,
  thumbnail_url   VARCHAR(500),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Automations
CREATE TABLE automations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  brevo_automation_id BIGINT,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  trigger_type    VARCHAR(50) NOT NULL,
  trigger_config  JSONB NOT NULL,
  workflow_json   JSONB NOT NULL, -- entire workflow graph
  stats           JSONB, -- { entered: N, completed: N, active: N }
  is_recipe       BOOLEAN DEFAULT FALSE,
  recipe_id       VARCHAR(50),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Forms
CREATE TABLE forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  type            VARCHAR(20) CHECK (type IN ('embedded','popup','slide_in','top_bar','landing_page')),
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
  fields_config   JSONB NOT NULL, -- field definitions
  design_config   JSONB, -- styling
  success_config  JSONB, -- { type: 'message'|'redirect', message: '...', redirect_url: '...' }
  target_list_ids JSONB, -- Brevo list IDs to add subscribers to
  tags            JSONB, -- tags to apply
  double_optin    BOOLEAN DEFAULT FALSE,
  gdpr_enabled    BOOLEAN DEFAULT FALSE,
  gdpr_text       TEXT,
  display_config  JSONB, -- popup trigger, frequency, etc.
  embed_code      TEXT,
  submission_count INTEGER DEFAULT 0,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE form_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID REFERENCES forms(id) ON DELETE CASCADE,
  data            JSONB NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  referrer_url    VARCHAR(500),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Image Library
CREATE TABLE images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  filename        VARCHAR(255) NOT NULL,
  original_name   VARCHAR(255),
  url             VARCHAR(500) NOT NULL,
  thumbnail_url   VARCHAR(500),
  size_bytes      INTEGER,
  mime_type       VARCHAR(50),
  width           INTEGER,
  height          INTEGER,
  alt_text        VARCHAR(500),
  folder          VARCHAR(200),
  uploaded_by     UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Contact Cache (local cache of Brevo contacts for fast search/display)
CREATE TABLE contacts_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  brevo_contact_id BIGINT,
  email           VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  phone           VARCHAR(50),
  company         VARCHAR(200),
  attributes      JSONB,
  list_ids        JSONB,
  tags            JSONB,
  status          VARCHAR(20), -- subscribed, unsubscribed, bounced, blacklisted
  created_at_brevo TIMESTAMP,
  modified_at_brevo TIMESTAMP,
  last_synced_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Segments (our definition - may not map 1:1 to Brevo)
CREATE TABLE segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  brevo_segment_id BIGINT,
  name            VARCHAR(200) NOT NULL,
  conditions      JSONB NOT NULL, -- filter rules
  logic           VARCHAR(3) DEFAULT 'AND' CHECK (logic IN ('AND', 'OR')),
  contact_count   INTEGER DEFAULT 0,
  last_computed_at TIMESTAMP,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(50) NOT NULL, -- 'campaign.created', 'contact.imported', etc.
  resource_type   VARCHAR(50),
  resource_id     UUID,
  details         JSONB,
  ip_address      INET,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(organization_id, status);
CREATE INDEX idx_contacts_cache_org ON contacts_cache(organization_id);
CREATE INDEX idx_contacts_cache_email ON contacts_cache(organization_id, email);
CREATE INDEX idx_templates_org ON templates(organization_id);
CREATE INDEX idx_automations_org ON automations(organization_id);
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at);
9. API Mapping — Our App ↔ Brevo
9.1 Complete API Endpoint Mapping
Contacts / Audience
Our App Action	Our API Endpoint	Brevo API Call	Notes
List contacts	GET /api/contacts	GET /contacts?limit={n}&offset={n}	Cache locally, paginate
Get contact	GET /api/contacts/:email	GET /contacts/{identifier}	identifier = email
Create contact	POST /api/contacts	POST /contacts	Body: { email, attributes, listIds }
Update contact	PUT /api/contacts/:email	PUT /contacts/{identifier}	
Delete contact	DELETE /api/contacts/:email	DELETE /contacts/{identifier}	
Search contacts	GET /api/contacts/search?q=	GET /contacts?email={q}	Supplement with local cache search
Import contacts	POST /api/contacts/import	POST /contacts/import	Async, poll for status
Export contacts	POST /api/contacts/export	POST /contacts/export	Returns download URL
Lists
Our App Action	Our API Endpoint	Brevo API Call
Get all lists	GET /api/lists	GET /contacts/lists
Create list	POST /api/lists	POST /contacts/lists
Update list	PUT /api/lists/:id	PUT /contacts/lists/{listId}
Delete list	DELETE /api/lists/:id	DELETE /contacts/lists/{listId}
Add contacts to list	POST /api/lists/:id/contacts	POST /contacts/lists/{listId}/contacts/add
Remove contacts from list	DELETE /api/lists/:id/contacts	POST /contacts/lists/{listId}/contacts/remove
Campaigns
Our App Action	Our API Endpoint	Brevo API Call
List campaigns	GET /api/campaigns	GET /emailCampaigns?status={s}&limit={n}&offset={n}
Get campaign	GET /api/campaigns/:id	GET /emailCampaigns/{campaignId}
Create campaign	POST /api/campaigns	POST /emailCampaigns
Update campaign	PUT /api/campaigns/:id	PUT /emailCampaigns/{campaignId}
Delete campaign	DELETE /api/campaigns/:id	DELETE /emailCampaigns/{campaignId}
Send now	POST /api/campaigns/:id/send	POST /emailCampaigns/{campaignId}/sendNow
Schedule	POST /api/campaigns/:id/schedule	POST /emailCampaigns/{campaignId}/schedule
Send test	POST /api/campaigns/:id/test	POST /emailCampaigns/{campaignId}/sendTest
Get report	GET /api/campaigns/:id/stats	GET /emailCampaigns/{campaignId}/statistics
Campaign Creation — Brevo Payload
JSON

{
  "sender": {
    "name": "Acme Corp",
    "email": "hello@acme.com"
  },
  "name": "Summer Sale Announcement",
  "subject": "🎉 Summer Sale — 50% off everything!",
  "htmlContent": "<html>...</html>",
  "recipients": {
    "listIds": [2, 7],
    "exclusionListIds": [15]
  },
  "scheduledAt": "2025-06-15T14:00:00.000Z",
  "replyTo": "hello@acme.com",
  "toField": "{{contact.FIRSTNAME}} {{contact.LASTNAME}}",
  "previewText": "Don't miss our biggest sale of the year",
  "header": "If you cannot view this email, {mirror}",
  "footer": "If you wish to unsubscribe, {unsubscribe}"
}
Templates
Our App Action	Our API Endpoint	Brevo API Call
List templates	GET /api/templates	GET /smtp/templates
Create template	POST /api/templates	POST /smtp/templates
Update template	PUT /api/templates/:id	PUT /smtp/templates/{templateId}
Delete template	DELETE /api/templates/:id	DELETE /smtp/templates/{templateId}
Senders
Our App Action	Our API Endpoint	Brevo API Call
List senders	GET /api/senders	GET /senders
Create sender	POST /api/senders	POST /senders
Delete sender	DELETE /api/senders/:id	DELETE /senders/{senderId}
Validate sender	PUT /api/senders/:id/validate	PUT /senders/{senderId}/validate
Account & Statistics
Our App Action	Our API Endpoint	Brevo API Call
Get account info	GET /api/brevo/account	GET /account
Get aggregate stats	GET /api/stats/aggregate	GET /emailCampaigns (aggregate locally)
Get SMTP stats	GET /api/stats/smtp	GET /smtp/statistics/aggregatedReport
9.2 Webhook Events (Brevo → Our App)
Webhook endpoint: POST /api/webhooks/brevo

Brevo Event	Our Processing
delivered	Update campaign stats cache
opened / uniqueOpened	Update campaign stats cache, contact activity log
click	Update campaign stats cache, contact activity log, link click data
hardBounce / softBounce	Update campaign stats, update contact status
unsubscribed	Update campaign stats, update contact status
spam	Update campaign stats, flag campaign
listAddition	Update local contact cache
Webhook Payload Processing:

JavaScript

// Example webhook handler
async function handleBrevoWebhook(req, res) {
  const { event, email, date, 'campaign-id': campaignId, link, tag } = req.body;
  
  // Verify webhook signature
  if (!verifyBrevoSignature(req)) return res.status(401).send();
  
  switch(event) {
    case 'opened':
      await updateCampaignStats(campaignId, 'opens');
      await logContactActivity(email, 'opened', campaignId);
      break;
    case 'click':
      await updateCampaignStats(campaignId, 'clicks');
      await logContactActivity(email, 'clicked', campaignId, link);
      await updateLinkClickData(campaignId, link);
      break;
    // ... etc
  }
  
  res.status(200).send('OK');
}
10. Technical Architecture
10.1 Technology Stack
Layer	Technology	Justification
Frontend	Next.js 14+ (App Router)	SSR/SSG, file-based routing, React Server Components
UI Framework	React 18+	Component-based, large ecosystem
Styling	Tailwind CSS + shadcn/ui	Utility-first, consistent design system, accessible components
State Management	Zustand + TanStack Query (React Query)	Lightweight global state + server state caching
Email Builder	Custom built with react-dnd + craft.js or GrapesJS	Drag-and-drop, extensible, real-time preview
Charts	Recharts	React-native, composable, responsive
Rich Text	TipTap (ProseMirror-based)	Extensible, collaborative-ready
Backend	Next.js API Routes or separate Express.js	API endpoints, Brevo service layer
Database	PostgreSQL 15+	Relational, JSONB support, robust
ORM	Prisma or Drizzle ORM	Type-safe, migrations, good DX
Auth	NextAuth.js (Auth.js)	OAuth, credentials, session management
File Storage	AWS S3 / Cloudflare R2	Image uploads, template assets
CDN	Cloudflare	Global edge, image optimization
Job Queue	BullMQ (Redis-backed)	Background jobs: imports, syncs, scheduled tasks
Cache	Redis	API response caching, rate limiting, sessions
Deployment	Vercel (frontend) + Railway/Render (backend) or full Vercel	Easy deployment, edge functions
Monitoring	Sentry	Error tracking, performance monitoring
Analytics	PostHog or Mixpanel	Product analytics (our own usage)
10.2 System Architecture Diagram
text

                    ┌──────────────┐
                    │   CDN        │
                    │ (Cloudflare) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Next.js    │
                    │   Frontend   │
                    │   (Vercel)   │
                    └──────┬───────┘
                           │
               ┌───────────▼────────────┐
               │     API Layer          │
               │  (Next.js API Routes   │
               │   or Express.js)       │
               │                        │
               │  ┌──────────────────┐  │
               │  │ Services:        │  │
               │  │ - Auth Service   │  │
               │  │ - Contact Svc    │  │
               │  │ - Campaign Svc   │  │
               │  │ - Template Svc   │  │
               │  │ - Analytics Svc  │  │
               │  │ - Brevo Client   │  │
               │  └──────────────────┘  │
               └───┬──────┬──────┬──────┘
                   │      │      │
          ┌────────▼──┐ ┌─▼────┐ ├──────────────┐
          │PostgreSQL │ │Redis │ │              │
          │           │ │      │ │  Brevo API   │
          │- Users    │ │-Cache│ │  v3          │
          │- Campaigns│ │-Queue│ │              │
          │- Templates│ │-Rate │ │  - Contacts  │
          │- Metadata │ │ Limit│ │  - Campaigns │
          └───────────┘ └──┬───┘ │  - Templates │
                           │     │  - SMTP      │
                     ┌─────▼───┐ │  - Webhooks  │
                     │ BullMQ  │ │  - Stats     │
                     │ Workers │ │              │
                     │         │ └──────────────┘
                     │-Sync    │
                     │-Import  │        ┌──────────┐
                     │-Reports │        │ S3 / R2  │
                     └─────────┘        │ (Images) │
                                        └──────────┘
10.3 Brevo Service Layer (Abstraction)
TypeScript

// services/brevo/brevoClient.ts
class BrevoClient {
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  private async request(method: string, path: string, body?: any) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new BrevoApiError(response.status, await response.json());
    }
    
    return response.json();
  }
  
  // Contacts
  async getContacts(params: ContactListParams) { ... }
  async getContact(identifier: string) { ... }
  async createContact(data: CreateContactData) { ... }
  async updateContact(identifier: string, data: UpdateContactData) { ... }
  async deleteContact(identifier: string) { ... }
  async importContacts(data: ImportContactsData) { ... }
  
  // Lists
  async getLists() { ... }
  async createList(data: CreateListData) { ... }
  async addContactsToList(listId: number, emails: string[]) { ... }
  async removeContactsFromList(listId: number, emails: string[]) { ... }
  
  // Campaigns
  async getCampaigns(params: CampaignListParams) { ... }
  async getCampaign(campaignId: number) { ... }
  async createCampaign(data: CreateCampaignData) { ... }
  async updateCampaign(campaignId: number, data: UpdateCampaignData) { ... }
  async sendCampaign(campaignId: number) { ... }
  async scheduleCampaign(campaignId: number, scheduledAt: string) { ... }
  async sendTestEmail(campaignId: number, emails: string[]) { ... }
  async getCampaignStats(campaignId: number) { ... }
  
  // Templates
  async getTemplates() { ... }
  async createTemplate(data: CreateTemplateData) { ... }
  async updateTemplate(templateId: number, data: UpdateTemplateData) { ... }
  
  // Senders
  async getSenders() { ... }
  async createSender(data: CreateSenderData) { ... }
  
  // Account
  async getAccount() { ... }
}
10.4 Background Jobs
Job	Schedule/Trigger	Purpose
sync-contacts	Every 15 minutes	Sync contact cache from Brevo
sync-campaign-stats	Every 5 minutes (for recent campaigns)	Update campaign stats cache
process-import	On import trigger	Handle large CSV imports in chunks
generate-thumbnail	On template save	Screenshot template for thumbnail
compute-segment	On segment create/update	Calculate segment contact counts
cleanup-drafts	Daily at 3 AM	Remove orphaned draft data older than 90 days
aggregate-analytics	Hourly	Aggregate stats for dashboard charts
11. Non-Functional Requirements
11.1 Performance
Metric	Target
Time to Interactive (TTI)	< 2 seconds on 4G
First Contentful Paint (FCP)	< 1.2 seconds
Largest Contentful Paint (LCP)	< 2.5 seconds
API response time (p95)	< 500ms for reads, < 1s for writes
Email builder load time	< 3 seconds
Contact table load (1000 rows)	< 1 second
Dashboard load	< 2 seconds
Search results	< 500ms
Image upload	< 3 seconds for 5MB image
11.2 Scalability
Dimension	Target
Concurrent users per org	Up to 50
Contacts per organization	Up to 500,000
Campaigns per organization	Unlimited
Templates per organization	Up to 500
Images per organization	Up to 10,000 (10GB)
API requests (our API)	1000 req/min per org
11.3 Security
Requirement	Implementation
Authentication	JWT tokens (access + refresh), HttpOnly secure cookies
Password storage	bcrypt with cost factor 12
API key encryption	AES-256-GCM at rest
Data in transit	TLS 1.3 everywhere
CORS	Whitelist specific origins
Rate limiting	Redis-based, per user and per org
Input validation	Zod schemas on all API inputs
XSS prevention	DOMPurify for user HTML content, CSP headers
CSRF protection	SameSite cookies + CSRF tokens
SQL injection	Parameterized queries via ORM
File upload	Type validation, size limits, virus scanning (ClamAV)
Audit logging	All sensitive actions logged
GDPR compliance	Data export, data deletion, consent management
11.4 Reliability
Requirement	Target
Uptime	99.9% (excluding planned maintenance)
Database backups	Daily automated, 30-day retention
Disaster recovery	RTO: 4 hours, RPO: 1 hour
Error monitoring	Sentry with alerting on error spikes
Health checks	/api/health endpoint, monitored every 60s
11.5 Accessibility
Standard	Details
WCAG 2.1 AA	Full compliance
Keyboard navigation	All interactive elements focusable and operable
Screen reader	ARIA labels, roles, live regions
Color contrast	Minimum 4.5:1 for normal text, 3:1 for large text
Focus indicators	Visible focus ring on all interactive elements
Motion	Respects prefers-reduced-motion
Forms	Associated labels, error announcements, required field indicators
11.6 Browser Support
Browser	Version
Chrome	Last 2 versions
Firefox	Last 2 versions
Safari	Last 2 versions
Edge	Last 2 versions
Mobile Safari (iOS)	iOS 15+
Chrome Android	Last 2 versions
12. Phased Rollout Plan
Phase 1: Foundation (Weeks 1-6) — MVP
Goal: Core campaign and contact management

Week	Deliverables
1-2	Project setup, auth (signup/login/forgot password), database schema, Brevo client library, settings (Brevo connection)
3	Dashboard (KPI cards, recent campaigns, quick actions), navigation shell
4	Audience module: Contact list, add/edit/delete contact, contact detail panel, import CSV
5	Campaign module: Campaign list, creation wizard (steps 1-4: setup, to, from, subject)
6	Campaign module: Basic HTML/plain text content editor (no drag-and-drop yet), review & send, campaign report page
MVP Outcome: Users can import contacts, create email campaigns with HTML content, send them via Brevo, and view basic reports.

Phase 2: Email Builder (Weeks 7-10)
Week	Deliverables
7-8	Drag-and-drop email builder: Layout blocks (1-4 columns), content blocks (text, image, button, divider, spacer)
9	Email builder: Social block, footer block, properties panel, preview mode (desktop/mobile)
10	Template library: Save as template, pre-built templates (10+), saved blocks
Phase 3: Advanced CRM (Weeks 11-13)
Week	Deliverables
11	Lists management, tags management, contact detail activity timeline
12	Segment builder with visual filter interface, contact export
13	Custom fields management, bulk actions on contacts, search improvements
Phase 4: Automation (Weeks 14-17)
Week	Deliverables
14-15	Automation builder UI: Visual workflow canvas, trigger nodes, email nodes, delay nodes
16	Condition/branch nodes, action nodes (add tag, update contact, add to list)
17	Pre-built automation recipes (5), automation analytics, testing
Phase 5: Forms & Advanced Features (Weeks 18-20)
Week	Deliverables
18	Form builder: Embedded forms, popup forms, embed code generation
19	Advanced analytics: Engagement over time charts, click maps, audience-level analytics
20	A/B testing for campaigns, send time optimization integration
Phase 6: Polish & Scale (Weeks 21-24)
Week	Deliverables
21	Team management (invite members, roles, permissions)
22	Onboarding wizard polish, empty states, loading states, error states
23	Performance optimization, caching strategy, comprehensive testing
24	Documentation, API keys for external access, launch preparation
Post-Launch Roadmap
Feature	Timeline
Billing & subscription management	Month 7
Multi-language support (i18n)	Month 7
Advanced A/B testing (content variations)	Month 8
SMS campaigns (via Brevo SMS API)	Month 8
Landing page builder	Month 9
Integration marketplace (Shopify, WordPress, Zapier)	Month 9-10
AI subject line generator	Month 10
AI content assistant	Month 10
White-label / custom branding	Month 11
Revenue tracking & e-commerce analytics	Month 11
Mobile app (React Native)	Month 12+
13. Risk Assessment
Risk	Probability	Impact	Mitigation
Brevo API rate limits causing delays	Medium	High	Implement request queuing, caching, exponential backoff. Monitor usage. Consider Brevo enterprise plan.
Brevo API changes breaking integration	Low	High	Abstract Brevo calls behind service layer. Pin API version. Monitor Brevo changelog.
Brevo downtime affecting our app	Low	Critical	Implement graceful degradation (show cached data, queue sends). Display Brevo status indicator.
Complex segment limitations in Brevo API	High	Medium	Build segment computation in our backend. Materialize segments as lists in Brevo.
Email builder complexity causing delays	High	High	Consider using/extending open-source builder (GrapesJS). Start with simpler builder, iterate.
Large contact imports timing out	Medium	Medium	Chunk imports, use background jobs, progress reporting.
Data sync inconsistency (Brevo ↔ our DB)	Medium	Medium	Use Brevo as source of truth. Implement reconciliation job. Show "last synced" timestamp.
GDPR compliance gaps	Medium	High	Legal review. Implement data export/deletion. Consent tracking. DPA with Brevo.
Email deliverability issues blamed on us	Medium	High	Educate users on best practices. Show deliverability score. Pre-send checklist. This is Brevo's domain.
Scaling beyond Brevo free/starter plan	Medium	Medium	Design for multi-plan support. Surface Brevo plan limits in our UI.
14. Success Metrics
14.1 Product Metrics
Metric	Target (Month 3)	Target (Month 6)	Target (Month 12)
Registered users	500	2,000	10,000
Active orgs (weekly)	100	500	2,500
Campaigns sent (total)	1,000	10,000	100,000
Contacts managed (total)	500K	5M	50M
Avg campaigns/org/month	3	4	5
Templates created	200	1,500	10,000
Automations active	50	500	5,000
14.2 Engagement Metrics
Metric	Target
Time to first campaign sent	< 30 minutes from signup
Campaign creation time (avg)	< 10 minutes
Weekly active rate	> 40% of registered users
Feature adoption (template builder)	> 60% of campaigns use drag-and-drop
Feature adoption (automation)	>
