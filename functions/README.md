# ProMan-AI Email Notifications (Cloud Functions)

Cloud Functions that automatically send email notifications when tasks or comments are updated in ProMan.

## Features

| Trigger | Event | Recipients |
|---------|-------|------------|
| `onTaskUpdate` | Task status/priority/due-date changed | All assignees (except the person who made the change) |
| `onTaskUpdate` | New assignee added to a task | Newly assigned users |
| `onCommentCreate` | New comment on a task | All assignees (except the comment author) |
| `checkDeadlines` | Daily schedule (08:00 WIB) | Assignees of tasks due within 2 days |

## Prerequisites

1. **Firebase CLI** (v12+):
   ```bash
   npm install -g firebase-tools
   ```

2. **Gmail App Password** (not your normal password):
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create an app password for "Mail"
   - Store it — you'll need it in the deploy step

## Deploy

```bash
# 1. Authenticate (once per machine)
firebase login

# 2. Set Gmail credentials as encrypted runtime config
firebase functions:config:set gmail.user="youraddress@gmail.com" \
  gmail.app_password="xxxx-xxxx-xxxx-xxxx"

# 3. Deploy functions
firebase deploy --only functions
```

### Setting config in non-interactive environments

```powershell
firebase functions:config:set gmail.user="youraddress@gmail.com" gmail.app_password="xxxx-xxxx-xxxx-xxxx"
```

## Local Development (Emulator)

```bash
npm run serve
```

This builds TS → `lib/` and starts the Firebase Functions emulator.

## Structure

```
functions/
├── package.json          # deps & scripts
├── tsconfig.json         # TS build config
├── src/
│   ├── config.ts         # app constants + email config
│   ├── index.ts          # Cloud Function triggers (main entry)
│   ├── services/
│   │   └── emailService.ts   # Nodemailer SMTP transport
│   └── templates/
│       ├── baseLayout.ts       # shared HTML email shell
│       ├── taskUpdate.ts       # status/priority/due-date change
│       ├── newComment.ts       # new comment notification
│       ├── taskAssigned.ts     # new assignee notification
│       └── deadlineReminder.ts # upcoming due-date reminder
```

## Troubleshooting

- **"Gmail credentials not configured"** — Run the `functions:config:set` command above.
- **Email not arriving** — Check Firebase console → Functions → Logs for errors.
- **403 auth error** — Your Gmail app password may be wrong; regenerate it.
- **Free tier limits** — Gmail SMTP allows ~500 emails/day for free accounts. For higher volume, consider a dedicated provider (SendGrid, Mailgun, etc.).
