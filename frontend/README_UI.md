# UI Dashboard Notes

## Pages
- `/login`: Google-style sign-in experience (email+name dev fallback).
- `/dashboard`: Add expense, AI insights, AI chatbot, and expense table.
- `/transactions`: Full expense history with delete controls.

## Auth behavior
- Access token stored in localStorage (`aifc_token`) after login.
- Logout removes token and prevents local data access.
- Re-login restores account data from backend APIs.

## Run locally
```bash
npm install
npm run dev
```
