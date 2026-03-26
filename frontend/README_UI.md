# UI Dashboard Notes

## Pages
- `/login`: Google OAuth login (Google Identity Services) + dev fallback.
- `/dashboard`: Add expense, AI insights, AI chatbot, and account-restored expense table.
- `/transactions`: Full expense history with delete controls.

## Auth behavior
- Access token stored in localStorage (`aifc_token`) after login.
- Token is attached as Bearer auth to protected API calls.
- Logout removes token and local session access immediately.
- Re-login restores account data from backend APIs.

## Run locally
```bash
npm install
npm run dev
```


Set `VITE_ALLOW_DEV_AUTH_FALLBACK=true` only for local testing when Google OAuth is unavailable.
