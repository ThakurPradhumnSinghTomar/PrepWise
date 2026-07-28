# PrepWise

PrepWise is an AI-powered interview preparation platform built with **Next.js 16**, **React 19**, **TypeScript**, and **Firebase**. It helps users practice realistic interview sessions, review generated insights, and track preparation progress through a modern web interface.

> Repository: https://github.com/ThakurPradhumnSinghTomar/PrepWise

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Repository Structure](#repository-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run Locally](#run-locally)
  - [Build for Production](#build-for-production)
  - [Run with Docker](#run-with-docker)
- [Scripts](#scripts)
- [API & Integrations](#api--integrations)
- [Styling and UI System](#styling-and-ui-system)
- [Authentication and Authorization](#authentication-and-authorization)
- [Code Quality](#code-quality)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Performance & Security Notes](#performance--security-notes)
- [Roadmap Ideas](#roadmap-ideas)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

**PrepWise** is designed for candidates who want structured, repeatable, and AI-assisted interview practice. The application combines:

- a modern App Router architecture,
- voice/AI tooling integration,
- cloud-backed user/auth flows,
- and reusable UI primitives.

The project is ideal for preparing technical and behavioral interviews by simulating interview experiences and organizing practice outputs.

---

## Key Features

- **AI-assisted interview preparation** workflows.
- **Structured app routing** using Next.js App Router (`app/` directory).
- **Authentication-focused route groups** (e.g., `(auth)` and `(root)`).
- **Firebase integration** for client and admin responsibilities.
- **Reusable component architecture** under `components/`.
- **Utility and middleware layers** in `lib/`.
- **Type-safe development** with TypeScript and Zod.
- **Modern UX stack** with Tailwind CSS and Radix UI.
- **Container support** using Docker.

---

## Tech Stack

### Core Framework
- **Next.js 16** (`next`)
- **React 19** / **React DOM 19**
- **TypeScript 5**

### Styling & UI
- **Tailwind CSS 4**
- **Radix UI** primitives
- **Lucide React** icons
- **next-themes** for theming
- **class-variance-authority**, **clsx**, **tailwind-merge** for component class composition

### Forms & Validation
- **react-hook-form**
- **@hookform/resolvers**
- **zod**

### AI / Voice Integrations
- **ai** SDK
- **@ai-sdk/google**
- **openai**
- **@vapi-ai/web**

### Backend/Infra Utilities
- **firebase**
- **firebase-admin**
- **next-connect**
- **multer**
- **dayjs**

### Tooling
- **ESLint 9** + Next config
- **PostCSS** via `@tailwindcss/postcss`
- **Dockerfile** for containerized runs

---

## Architecture at a Glance

PrepWise follows a modular full-stack frontend architecture:

1. **Presentation layer** in `app/` and `components/`.
2. **Business/action layer** in `lib/actions/`.
3. **Infrastructure adapters** in `firebase/` and `lib/` (SDK wrappers, middleware, utilities).
4. **Shared constants/types** in `constants/` and `types/`.
5. **Static assets** under `public/`.

This separation improves maintainability and makes feature evolution easier (new interview flows, additional providers, analytics, etc.).

---

## Repository Structure

```text
PrepWise/
├── app/                       # Next.js App Router pages, route groups, and API routes
│   ├── (auth)/                # Authentication-related pages/routes
│   ├── (root)/                # Main application routes
│   ├── Notes/                 # Notes-related route section
│   └── api/                   # Route handlers / API endpoints
├── components/                # Reusable UI components
├── constants/                 # Static constants and app configuration values
├── firebase/                  # Firebase client/admin initialization and helpers
│   ├── admin.ts
│   └── client.ts
├── lib/                       # Utilities, middleware, action layer, integrations
│   ├── actions/
│   ├── auth-middleware.ts
│   ├── utils.ts
│   └── vapi.sdk.ts
├── public/                    # Static assets
├── types/                     # Shared TypeScript types/interfaces
├── Dockerfile                 # Container image definition
├── components.json            # UI components configuration
├── next.config.ts             # Next.js configuration
├── eslint.config.mjs          # ESLint configuration
├── postcss.config.mjs         # PostCSS/Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

> Note: There are additional directories such as `pythagora-core` and test artifacts that appear tool-related.

---

## How It Works

At a high level:

1. Users access interview prep workflows through the Next.js UI.
2. Auth-protected experiences are handled through route grouping and middleware.
3. AI/voice interactions are orchestrated via integrated SDKs.
4. Firebase services provide authentication/data capabilities.
5. Practice data and generated outputs are rendered back to the user through reusable components.

---

## Getting Started

### Prerequisites

Install the following on your machine:

- **Node.js 20+** (recommended latest LTS)
- **npm** (comes with Node)
- Optional: **Docker** (for containerized execution)

### Installation

```bash
git clone https://github.com/ThakurPradhumnSinghTomar/PrepWise.git
cd PrepWise
npm install
```

### Environment Variables

Create a `.env.local` file in the repository root.

Because the project integrates Firebase and AI providers, you will typically need values similar to:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI providers (example placeholders)
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Vapi / voice integration (if used)
NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
```

> Important:
> - Keep secrets out of Git.
> - Ensure server-only keys are never exposed to the browser.
> - Use your deployment platform secret manager in production.

### Run Locally

```bash
npm run dev
```

Then open: `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

### Run with Docker

Build image:

```bash
docker build -t prepwise .
```

Run container:

```bash
docker run -p 3000:3000 --env-file .env.local prepwise
```

---

## Scripts

From `package.json`:

- `npm run dev` → starts development server using Turbopack.
- `npm run build` → production build using Turbopack.
- `npm run start` → serves the production build.
- `npm run lint` → runs ESLint checks.

---

## API & Integrations

The project appears to integrate with:

- **Firebase client/admin SDKs** for auth/data operations.
- **AI SDK ecosystem** (`ai`, `@ai-sdk/google`, `openai`) for generation flows.
- **Vapi Web SDK** for voice-based experiences.
- Route handlers under `app/api` for server-side endpoints.

For production reliability, consider adding:

- request validation with Zod on all API entry points,
- standardized error envelopes,
- retry/backoff where external APIs are called,
- observability (request IDs + centralized logs).

---

## Styling and UI System

PrepWise uses Tailwind CSS with utility-first styling and component composition helpers:

- `class-variance-authority` for variant-driven component APIs,
- `clsx` and `tailwind-merge` for class management,
- Radix primitives for accessible UI building blocks.

Recommended conventions:

- Keep design tokens centralized.
- Co-locate component styles with component logic where practical.
- Build atomic, composable, strongly-typed UI components.

---

## Authentication and Authorization

The repository includes auth-focused route groups and middleware (`lib/auth-middleware.ts`).

Best practices for this architecture:

- enforce auth checks server-side for protected routes,
- avoid trusting only client-side guards,
- perform role/permission checks in API handlers,
- use secure cookie/session handling where applicable.

---

## Code Quality

Current quality baseline includes TypeScript + ESLint.

To further professionalize the project, consider adding:

- **Prettier** with a shared config,
- **Husky + lint-staged** pre-commit checks,
- **unit/integration tests** (e.g., Vitest/Jest + Testing Library),
- CI workflows for lint/build/test checks on pull requests.

---

## Deployment

You can deploy PrepWise to platforms like **Vercel**, **Netlify**, or container-based infrastructure.

General production checklist:

1. Set all required environment variables.
2. Ensure Firebase project config matches production domain.
3. Restrict API keys and configure least privilege.
4. Validate CORS/origin policy where relevant.
5. Enable monitoring and error tracking.
6. Smoke-test critical interview flows before release.

---

## Troubleshooting

### `Firebase app already initialized`
- Ensure Firebase initialization is singleton-based in both client and admin setup.

### `Missing environment variables`
- Verify `.env.local` names exactly match code usage.
- Restart dev server after env changes.

### AI responses failing
- Confirm provider API keys are valid and billing/quota is active.
- Add explicit timeout and error handling around provider calls.

### Build issues with Next.js / TypeScript
- Clear artifacts and reinstall:
  ```bash
  rm -rf .next node_modules package-lock.json
  npm install
  npm run build
  ```

---

## Performance & Security Notes

- Prefer server-side invocation for sensitive AI operations.
- Avoid exposing raw provider keys in client code.
- Add rate limiting for public API endpoints.
- Use lazy loading and route-level splitting for heavy views.
- Optimize image/static assets and enforce caching headers.

---

## Roadmap Ideas

- Interview set management by role/seniority.
- AI feedback scoring rubric with trend dashboards.
- Session transcripts with action-point extraction.
- Mock interview sharing and peer review.
- Resume-linked question generation.
- Multi-provider AI fallback strategy.

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused, well-tested changes.
4. Run lint/build checks locally.
5. Open a pull request with:
   - clear summary,
   - screenshots (if UI changes),
   - testing notes.

Recommended commit style:

- `feat: add interview summary cards`
- `fix: handle firebase token refresh edge case`
- `refactor: split interview action handlers`

---

## License

No license file is currently present in the repository.

If you intend this project to be open source, add a license (e.g., MIT, Apache-2.0) to clarify usage rights.

---

## Acknowledgements

Built with excellent open-source tools and ecosystems:

- Next.js
- React
- TypeScript
- Firebase
- Tailwind CSS
- Radix UI
- AI SDK ecosystem

---

If you maintain this repository, consider adding screenshots/GIF demos and a short architecture diagram to further improve onboarding for new contributors.