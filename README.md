# Momentum — Personal Task Tracker

A full-stack MERN todo app built to help me (and my friends) actually stay on top of tasks — with tags, drag-and-drop reordering, and email reminders so nothing slips through.

**Live app:** https://momentum-todo.onrender.com

## Why I built this

Most todo apps feel like a chore to use. I wanted something that made finishing tasks feel rewarding — clear stats, tag-based organization, and reminder emails so I stop relying on memory. It's genuinely the app I use daily to manage my own placement prep, coursework, and personal tasks.

## Features

- **Authentication** — secure signup/login with hashed passwords (bcrypt) and JWT sessions
- **Forgot password** — email-based OTP verification flow to reset password
- **Multiple todo lists** — organize tasks by project, subject, or context
- **Tags** — pick from preset tags or add custom ones; filter tasks by tag instantly
- **Stats dashboard** — live completed/pending/total counts per list, plus per-tag breakdown
- **Drag-and-drop reordering** — reorder tasks by priority, persisted to the database
- **Email reminders** — set a reminder time on any task; a background job checks every minute and emails you when it's due
- **Change password** — update your password from account settings
- **Fully responsive** — works on desktop and mobile browsers

## Tech stack

**Frontend:** HTML, CSS, JavaScript (vanilla — no framework)
**Backend:** Node.js, Express.js
**Database:** MongoDB with Mongoose (hosted on MongoDB Atlas)
**Auth:** JWT (jsonwebtoken) + bcryptjs for password hashing
**Email:** Nodemailer (Gmail SMTP)
**Scheduling:** node-cron for the reminder background job
**Hosting:** Render (free tier)

## Project structure

\`\`\`
backend/
├── models/          # Mongoose schemas (User, TodoList, Todo)
├── routes/          # Express route handlers (auth, lists, todos)
├── middleware/       # JWT auth middleware
├── jobs/            # Background cron job for email reminders
├── utils/           # Email sending helper
├── public/          # Frontend (HTML/CSS/JS) — served statically by Express
└── server.js        # App entry point
\`\`\`

## Running locally

1. Clone the repo:
   \`\`\`bash
   git clone https://github.com/Kiruba-BECSE/todo-fullstack.git
   cd todo-fullstack/backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a \`.env\` file in \`backend/\`:
   \`\`\`
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   PORT=5000
   \`\`\`

4. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open \`http://localhost:5000\` in your browser.

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Log in |
| POST | /api/auth/forgot-password | Request reset code |
| POST | /api/auth/verify-reset-code | Verify OTP |
| POST | /api/auth/reset-password | Set new password |
| PUT | /api/auth/change-password | Update password (logged in) |
| GET/POST | /api/lists | Get / create todo lists |
| PUT/DELETE | /api/lists/:id | Rename / delete a list |
| GET/POST | /api/todos/:listId | Get / create tasks in a list |
| PUT/DELETE | /api/todos/item/:id | Update / delete a task |
| PUT | /api/todos/reorder/:listId | Persist drag-and-drop order |
| GET | /api/lists/:id/stats | Completed/pending/tag stats |

## What I learned building this

This was my introduction to full-stack development — going from a beginner CRUD app to a production-style app with authentication, background jobs, email integration, and deployment. Key things I picked up: JWT-based auth flows, MongoDB relationships (Mongoose refs), scheduled background tasks with node-cron, and deploying a Node app with a live database to a free host.

## Author

Kiruba K — [GitHub](https://github.com/Kiruba-BECSE)
