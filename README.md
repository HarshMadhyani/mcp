# FOCA WhatsApp Admission Support Bot

A monolithic Node.js + Express.js application acting as a WhatsApp-based admission support chatbot and an admin dashboard for the Faculty of Computer Applications (FOCA) at Marwadi University.

## Features

- **WhatsApp Bot**: Powered by Baileys, allows students to register, view courses, get admission info, read FAQs, and raise support tickets via WhatsApp.
- **Admin Dashboard**: Server-rendered EJS dashboard with a clean, shadcn/ui-inspired black and white design.
- **Google Sheets Database**: Uses Google Sheets as the persistent datastore for students, courses, FAQs, tickets, enquiries, and conversations. No traditional SQL/NoSQL database needed for the MVP.
- **State Machine**: Built-in bot state machine to manage user conversation flow seamlessly, with session persistence.

## Prerequisites

1. **Node.js** (v18+)
2. **Google Cloud Service Account** with **Google Sheets API** enabled.
3. A newly created Google Spreadsheet.
4. A phone with WhatsApp to scan the connection QR code.

## Setup Instructions

### 1. Google Sheets Setup
1. Create a new Google Spreadsheet.
2. Share the spreadsheet with your Google Cloud Service Account email (give it Editor access).
3. Copy the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`).

### 2. Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the `.env` variables:
   - `GOOGLE_PROJECT_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (ensure `\n` are literal backslash-n, or wrap in quotes)
   - `GOOGLE_SHEET_ID`
   - Set a strong `SESSION_SECRET`
   - Customize `ADMIN_EMAIL` and `ADMIN_PASSWORD`

### 3. Installation
```bash
npm install
```

### 4. Running the Application
To run in development mode (with auto-restart):
```bash
npm run dev
```

To run in production mode:
```bash
npm start
```

### 5. Initialization
On the first run, the app will:
1. Connect to Google Sheets.
2. Automatically create all necessary tabs (Students, Courses, Admission_Info, etc.) if they don't exist.
3. Create the default admin account using the credentials in your `.env` file.
4. (Optional) Run `npm run seed` to populate sample courses, FAQs, and admission info.

## Connecting WhatsApp

1. Start the server.
2. Go to `http://localhost:3000/admin/login` and log in.
3. Navigate to the **Settings** page in the sidebar.
4. A QR code will be displayed.
5. Open WhatsApp on your phone -> Settings -> Linked Devices -> Link a Device.
6. Scan the QR code. The status will change to CONNECTED.
7. Send a "Hi" message to the bot number from another phone to start the flow!

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: EJS, HTML, CSS (Custom B&W shadcn-inspired), Vanilla JS
- **WhatsApp**: @whiskeysockets/baileys
- **Database**: Google Sheets API (`googleapis`)
- **Security**: bcryptjs, helmet, cors, express-rate-limit

## Design System
The UI relies heavily on a custom CSS framework located in `public/css/app.css` that implements a modern, minimalistic, black-and-white theme mimicking shadcn/ui.
