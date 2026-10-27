# UniSphere

A university community and academic platform built with React, Vite, Express and MongoDB. The app includes student profiles, a social feed, discovery and following, courses and resources, assignment submissions and grading, campus events, clubs, notifications and optional Razorpay test checkout.

The Campus Observatory interface combines a UniSphere globe, interactive stars, dark ocean blue surfaces, and pale blue accents. The backend uses a straightforward models/routes/controllers structure, with `server/index.js` as its entry point.

## Project demo video

**[Watch the UniSphere demo on Google Drive](https://drive.google.com/file/d/1-Ef4gs58XdXCOWbjk75B__Ot6uxsasW3/view?usp=sharing)**

A **5-minute 51-second silent, full-screen walkthrough** with 15 chapters covering registration, profiles, course discovery/enrollment, social posts and comments, assignment submission, campus events, clubs, notifications, faculty publishing/grading, and student feedback.

The recording uses fictional showcase accounts in an isolated database. It does not modify Atlas or perform a payment; paid checkout is clearly shown as unavailable. To explore the populated showcase locally, run `npm run demo` inside `server` and start the frontend separately.

## Run with your database

### Hosting configuration

The frontend deploys from `client` on Vercel. `client/vercel.json` routes `/api/*` to the Render backend and serves React routes through `index.html`, including on refresh. Leave `VITE_API_URL` unset so authentication cookies stay on the website's origin.

The Render backend uses root directory `server`, build command `npm ci --omit=dev`, and start command `npm start`. Set `NODE_ENV=production`, `NODE_VERSION=22`, `MONGO_URI`, a private `JWT_SECRET`, `CLIENT_URL` matching the frontend URL, and the Razorpay test keys in Render's private environment settings. Allow the service's documented outbound IP ranges in Atlas. Demo seeding stays disabled in production. Free Render instances sleep when idle, so the first API request can take longer.

Requires Node.js 22.12+ or a current compatible Node release, npm, and a reachable MongoDB database.

1. In `server`, run `npm install`.
2. Keep your existing `server/.env`. If setting up a new checkout, copy `.env.example` to `.env` and replace its placeholders. Never commit this file.
3. In `client`, run `npm install`.
4. Run the following in two separate terminals:

Backend:
```powershell
cd server
npm run dev
```

Frontend:
```powershell
cd client
npm run dev
```

Open http://localhost:5173. The frontend proxies `/api` requests to port 8080. An optional `VITE_API_URL` can point the frontend to a separately hosted API. Configure `CLIENT_URL` to the frontend origin. Production cookies require HTTPS. Production cross-origin hosting should use a same-site domain or reverse proxy with the API; unrelated domains require an intentional cookie/CORS configuration.

Required server variables:
```dotenv
PORT=8080
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/unisphere
JWT_SECRET=<long-random-secret>
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SEED_DEMO=false
```

The server starts only after MongoDB connects and does not silently fall back to temporary storage. Configure your own Atlas connection string, database user, and network access list in `server/.env`. Atlas connectivity was verified during development; credentials are intentionally excluded from this repository.

## Disposable demonstration

To explore without a configured Atlas connection, explicitly start the separate demo instead of the normal backend:
```powershell
cd server
npm run demo
```

Then start the frontend normally. This uses a separate temporary MongoDB process, seeds sample content and disables payments. It never connects to the configured Atlas database. All demo changes disappear when the process stops. The first run may download MongoDB; the process needs permission to run local executables.

The isolated launcher generates a fresh random showcase password each time. Local access details are written to `server/.demo-access.json`, which is ignored by Git. No demonstration credentials or autofill are displayed in the login page.

To test Razorpay with the same disposable data, run `npm run demo:payments`. This opt-in reads only the Razorpay test keys from `server/.env`; it never connects to Atlas. Real payments remain disabled. The ordinary `npm run demo` continues to disable checkout.

For an intentionally seeded persistent development database, set `SEED_DEMO=true` before normal startup. Seeding only happens when there are no users and never in production. Treat all generated records as demonstration fixtures. Leave the flag false for real use. Do not use the demo accounts in production.

## Using the app

- Register a student account, edit its profile in Settings, and discover peers by name, department or skill.
- Create posts with optional image URLs. Authors can edit/delete their posts; students can like and comment. Profile pages show followers/following lists and the author's posts.
- Browse and enroll in courses. Faculty/admins can create courses and publish announcements or learning resource links from course details.
- Filter assignments by course, deadline and status. Submit written answers or HTTP(S) document/repository links. There is no file upload; submitting a link does not upload a file.
- Faculty/admins can create assignments and review/grade submitted work in assignment details. Students receive grade notifications and see only their own submissions.
- Browse upcoming/past campus events, register for free events, and view registration status. Faculty/admins publish events.
- Create clubs, join/leave them and read their announcements. A club creator or faculty/admin can publish club announcements.
- Open Notifications to mark individual or all notifications read. The navbar polls notifications every 15 seconds; this is not a real-time socket service.
- View payment history in Settings.

New registrations always receive the student role. An existing database administrator must assign a faculty/admin role to an authorized account through MongoDB; there is no public role-upgrade endpoint. Do not grant staff roles to untrusted students.

## Razorpay test payments

Set a valid `rzp_test_...` key and its secret in `server/.env`. Live keys are intentionally disabled. Configure payment auto-capture in the Razorpay test dashboard. Missing credentials disable checkout gracefully.

Orders are created server-side and linked to the authenticated student and event. Verification checks ownership, event/order association, a timing-safe HMAC comparison, and Razorpay's captured payment status, amount and currency. Event membership is inserted conditionally so repeated verification does not add duplicate attendees. Unknown or mismatched orders cannot register another student. Pending capture returns a pending response rather than claiming success; the order remains visible in payment history. Cancellation/failure is displayed without claiming registration.

A Razorpay test checkout for INR 299 was completed through the mock bank on October 27, 2026. Server verification succeeded, the event registration was confirmed, and Payment Receipts showed VERIFIED. No real money was charged. Automated webhook reconciliation, refunds and reserved capacity for simultaneous paid checkout are outside this student implementation. For a payment that remains pending, inspect its status in Razorpay before retrying; contact the event organizer to reconcile a captured payment if verification could not complete.

## Verification

```powershell
cd server
npm test
```

The integration test runs against a disposable database, never Atlas. It covers authentication, cookie sessions, role restrictions, ownership checks, profiles, following, posts, likes/comments, courses/enrollment/resources/announcements, assignment submissions/grading, clubs, free event registration, notifications, malformed IDs, unsafe resource URLs, origin rejection and disabled payment configuration.

```powershell
cd client
npm run build
npm run lint
```

The production build and disposable database integration workflow pass. Lint exits successfully but reports existing warnings, mostly unused imports and hook dependencies; these are not a claim of a warning-free codebase. Browser verification covered the desktop landing page, student login/dashboard and mobile navigation. Atlas connectivity was verified. The recorded student/faculty interactions use the isolated showcase database; a full live-Atlas workflow and an actual Razorpay checkout remain unverified. Dependency audits after the targeted body-parser patch reported zero vulnerabilities.

## API summary

All paths below start with `/api`. Except registration/login/logout/health/about, requests require the HTTP-only session cookie. Faculty actions additionally require a `faculty` or `admin` role.

| Area | Endpoints |
| --- | --- |
| Health | `GET /health`, `GET /about` |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout` |
| Profiles | `GET/PUT /users/profile`, `GET /users/all?search=&department=&year=`, `GET /users/:id`, `POST /users/:id/follow` |
| Feed | `GET /posts/feed?category=&search=&author=&page=&limit=` |
| Posts | `POST /posts`, `GET/PUT/DELETE /posts/:id`, `POST /posts/:id/like`, `GET /posts/:id/comments`, `POST /posts/:id/comment` |
| Courses | `GET/POST /courses`, `GET /courses/:id`, `POST /courses/:id/enroll`, `/courses/:id/announcement`, `/courses/:id/resource` |
| Assignments | `GET/POST /assignments`, `GET /assignments/:id`, `POST /assignments/:id/submit`, `/assignments/:id/grade`; list accepts `courseId`, `status`, `dueBefore` |
| Events | `GET/POST /events`, `GET /events/:id`, `POST /events/:id/register`; list accepts `type=upcoming/past/all`, `category`, `search` |
| Clubs | `GET/POST /clubs`, `GET /clubs/:id`, `POST /clubs/:id/join`, `/clubs/:id/announcement` |
| Notifications | `GET /notifications`, `PUT /notifications/read-all`, `PUT /notifications/:id/read` |
| Payments | `GET /payments/key`, `POST /payments/order`, `POST /payments/verify`, `GET /payments/history` |

Source is intentionally straightforward: `server/models`, `server/routes`, `server/controllers`, `server/middlewares`, and React pages/components with Axios calls. No Redux or service/repository layer is introduced. The app provides a dark theme; a separate light theme is not implemented.

## Space theme and motion

Every route shares a canvas starfield with a responsive, restrained number of stars, slow drifting motion, twinkling highlights, occasional shooting stars, and blue/violet nebula gradients. The background does not intercept clicks. Its density scales with viewport area and its rendering resolution is capped at 2×. Animation stops when the browser tab is hidden, and listeners and animation frames are cleaned up when the component unmounts.

The corner motion button pauses/resumes the background and saves the preference locally. System reduced-motion preferences render a still starfield and disable decorative page animation. Shared glass surfaces, page fades, navigation highlights and hover effects apply throughout the application. No animation library or image assets are required.

The starfield also responds to mouse movement: nearby stars brighten and gently converge, a local constellation connects up to fourteen nearby stars, and depth-based parallax follows the pointer with smoothing. Clicking empty space sends an expanding ripple through the sky. Form controls, links and dialogs do not trigger ripples. Touch devices retain the ambient starfield and can tap empty space for a ripple. Pause and reduced-motion settings disable these effects; pointer listeners are removed on cleanup.
