# LeadFlow

A lightweight lead manager for sales reps to track prospective customers through their pipeline.

Live demo: [Live Demo Link Placeholder]

## What it is

LeadFlow is a small full-stack web application designed for individual sales reps. It lets you capture leads, organize them across pipeline stages (New, Contacted, Qualified, Lost), filter and search through them quickly, and monitor conversion metrics on an overview dashboard. Each user gets their own private workspace so their leads remain isolated from others.

## Tech stack and why I chose it

- Frontend: React with TypeScript, Vite, and Tailwind CSS. React and Vite give fast build times and straightforward state handling without configuration overhead. Tailwind keeps styling direct and maintainable without context switching to separate stylesheet files.
- UI components: Handcrafted lightweight shadcn-style primitives (Sheet, Dialog, Button, Table, Input). I kept them minimal so there are no bloated component library abstractions.
- Backend: Node.js with Express and TypeScript. Express is simple, reliable, and has virtually zero magic, making routing, error handling, and validation easy to follow.
- Database: PostgreSQL with Prisma ORM. Prisma gives type-safe database queries, simple migrations, and schema definitions that match our TypeScript interfaces.
- Validation: Zod on both client and server. Writing the validation rules on both ends ensures inputs are validated before sending network requests and guarded securely on the API.
- Testing: Vitest and Supertest for fast, clear HTTP endpoint assertions.
- State: Plain React useState and useEffect. For an app of this size, adding Redux or Zustand would just add unnecessary boilerplate.

## How to run it locally

### Prerequisites
- Node.js (v18 or newer)
- PostgreSQL running locally or in Docker

### 1. Clone and install dependencies
```bash
git clone https://github.com/Keshav1903k/LeadFlow.git
cd LeadFlow

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure environment variables
Create a `.env` file in the `server` directory (or use `.env.example` in the root):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadflow"
JWT_SECRET="your_jwt_secret_key_here"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### 3. Setup database and seed
From the `server` directory:
```bash
npx prisma db push
npm run db:seed
```

### 4. Start the application
Run the backend server (from `server/`):
```bash
npm run dev
```

In a separate terminal, run the frontend client (from `client/`):
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.
You can log in using the pre-seeded demo user:
- Email: `keshav@leadflow.app`
- Password: `password123`

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| DATABASE_URL | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/leadflow` |
| JWT_SECRET | Secret key for signing auth tokens | `super_secret_jwt_key_change_in_production` |
| PORT | Port for the backend API | `5000` |
| CLIENT_URL | Frontend origin allowed by CORS | `http://localhost:5173` |

## Seeding

The seed script (`server/prisma/seed.ts`) reads `leads.seed.json` from the root directory. It creates a demo sales rep account (`keshav@leadflow.app` / `password123`) and inserts all 36 sample leads. To reflect realistic pipeline metrics, it computes `createdAt` timestamps relative to the current execution date using the `daysAgo` offsets from the seed file.

Run it anytime with:
```bash
cd server
npm run db:seed
```

## Running tests

The test suite runs 7 integration tests covering authentication, lead creation, input validation, status updates, deletion, filtering, and user data isolation.

Run the tests from the `server` directory:
```bash
npm test
```

## API endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Create a new user account | No |
| POST | `/api/auth/login` | Authenticate user and receive JWT | No |
| GET | `/api/auth/me` | Fetch currently logged-in user profile | Yes |
| GET | `/api/leads` | List user leads (supports search, status, source, page, sort) | Yes |
| GET | `/api/leads/stats` | Get pipeline counts, conversion rate, and 7-day volume | Yes |
| POST | `/api/leads` | Create a new lead | Yes |
| PUT | `/api/leads/:id` | Update an existing lead or its status | Yes |
| DELETE | `/api/leads/:id` | Remove a lead from the pipeline | Yes |

## Assumptions I made

- Email addresses are unique per user rather than globally across all users. This allows two different sales reps to have the same prospective company lead without collisions.
- Company name is optional, as early-stage inbound leads or direct website signups often do not provide an organization upfront. When absent, it is rendered as a clean muted dash.
- Phone numbers follow standard international or national formats with digits, spaces, and hyphens.

## What I left out or cut and why

- No complex role-based access control (RBAC): The assignment describes a tool for a sales user. Simple per-user JWT ownership was sufficient and kept the auth layer clean.
- No heavy third-party UI component libraries: Instead of adding large UI libraries that bring excess CSS and opinionated markup, I built small, focused components directly with Tailwind.
- No client-side caching library (like React Query): Plain fetch with useEffect and a local state updater kept dependencies low and made data flow easy to reason about.

## What I would improve with more time

1. Add optimistic UI updates for inline status changes so status badges toggle immediately on slow network connections.
2. Add CSV export and import capabilities to make bulk lead migration easy for sales reps.
3. Introduce automated end-to-end testing with Playwright to verify drawer interactions and dialog flows across desktop and mobile screen viewports.
4. Add activity logs or notes per lead so reps can write down meeting summaries and call history.

## What was tricky or what I am proud of

The trickiest part was building the shared drawer form so that it handles both creating a new lead and editing an existing one cleanly. It had to properly reset validation errors between modes, handle server-side 409 duplicate email responses, and update the lead table and status tabs immediately without requiring a full page refresh. I am proud of how responsive and snappy the table and status tabs feel while keeping the codebase small and readable.
