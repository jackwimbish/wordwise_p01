# WordWise - Writing Assistant Project

## Project Overview

This project is a web-based writing assistant that offers grammar, spelling, and clarity suggestions in real time. Authenticated users can create, edit, and manage documents while applying AI-powered suggestions based on LanguageTool.

## UI Description

### Pages & Components

1. **Landing Page** – Introduces the app, allows unauthenticated users to test a demo editor.
2. **Sign Up Page** – Enables new users to register with email and password.
3. **Sign In Page** – Allows existing users to log in securely.
4. **Dashboard (My Documents)** – Displays the user's saved documents with options to open, rename, duplicate, or delete them.
5. **Document Editor** – Rich text editor with inline highlights, a suggestions sidebar, and tools to apply or reject writing suggestions.
6. **Account Settings** – Allows password changes and account deletion.
7. **Error/Not Found Page** – Displays appropriate messages for bad URLs or failed operations.

## Technical Foundation

### Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, TipTap editor, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth), LanguageTool API (hosted), optional FastAPI middleware for suggestion normalization
- **Hosting:** Vercel (frontend), Supabase (backend and Edge Functions)
- **Monitoring:** Sentry for error logging and alerting
- **Email:** Resend (transactional emails for signup, password reset, and account deletion)
- **Rate Limiting:** Supabase Edge Functions (per-user limits on document analysis requests)

## Data Models

### Database Schema

- **User** – `id`, `email`, `created_at`
- **Document** – `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`
- **Suggestion** – `id`, `document_id`, `start_offset`, `end_offset`, `replacement_text`, `message`, `category`, `applied`, `rejected`
- **DocumentVersion** – `id`, `document_id`, `content`, `version_number`, `created_at`

## API Endpoints

### Core APIs

- `POST /api/suggestions` – Analyze document content using LanguageTool and return structured suggestions
- `POST /api/documents` – Create a new document
- `GET /api/documents` – List user's saved documents
- `GET /api/documents/:id` – Retrieve a specific document
- `PUT /api/documents/:id` – Update content or metadata of a document
- `DELETE /api/documents/:id` – Delete a document

### User Management

- `PUT /api/account/password` – Change user password
- `DELETE /api/account` – Delete user account
- `POST /api/email/send` – Trigger emails via Resend for confirmations and password resets (Edge Function)

## Key Components

### Frontend Components

- **EditorComponent** – Rich text editor with formatting and inline error annotations
- **SuggestionSidebar** – List of LanguageTool suggestions with accept/reject actions
- **DocumentList** – Displays saved documents with options to rename, duplicate, or delete
- **AuthForms** – Signup, login, password update interfaces
- **DocumentToolbar** – Save, rename, refresh, and download actions
- **AccountSettingsPanel** – Password change and account deletion controls

### Backend Components

- **RateLimitGuard** – Supabase Edge Function enforcing daily or per-minute analysis caps

## MVP Launch Requirements

### Core Features

- [ ] Implement user registration, login, and logout via Supabase Auth
- [ ] Create a dashboard displaying user documents with options to open, rename, duplicate, and delete
- [ ] Develop a rich text editor with formatting and text input capability
- [ ] Integrate LanguageTool API for grammar, spelling, and clarity suggestions
- [ ] Display inline highlights and a suggestion sidebar with explanation and apply/reject buttons
- [ ] Enable saving, versioning, and persistent storage of user documents
- [ ] Provide a download button to export documents in .txt format

### User Management

- [ ] Allow users to change passwords and delete their accounts from a settings page
- [ ] Use Resend to send transactional emails (signup confirmation, password reset, deletion notices)

### Production Ready

- [ ] Handle all frontend and backend errors with fallback error messaging
- [ ] Enforce request rate limiting using Supabase Edge Functions
- [ ] Deploy production-ready services via Vercel and Supabase with Git-based CI/CD
