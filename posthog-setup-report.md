<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Ibra Global English Next.js App Router project. This run supplemented existing instrumentation with 10 new events across 7 files, covering admin operations (payments, attendance, reports, certificates), AI chat widget engagement, student registration approvals/rejections, and server-side online schedule creation. PostHog client initialization was added to `instrumentation-client.js` alongside Sentry, using the `/ingest` reverse proxy (already configured in `next.config.js`). User identification at registration was also added to match the existing identify call at login.

## Events added this session

| Event name | Description | File |
|---|---|---|
| `ai_chat_opened` | User opens the AI chat widget on the public site. | `src/components/AIChatWidget.jsx` |
| `student_registration_approved` | Admin approves an incoming student registration and the student is added to the system. | `src/app/admin/students/page.js` |
| `student_registration_rejected` | Admin rejects an incoming student registration with a reason. | `src/app/admin/students/page.js` |
| `admin_report_created` | Admin creates and publishes a student report card with scores. | `src/app/admin/reports/page.js` |
| `admin_certificate_issued` | Admin issues an official graduation certificate for a student. | `src/app/admin/reports/page.js` |
| `admin_ai_notes_generated` | Admin uses AI to auto-generate tutor notes for a student report card. | `src/app/admin/reports/page.js` |
| `admin_attendance_submitted` | Admin saves daily attendance records for all students. | `src/app/admin/attendance/page.js` |
| `admin_payment_recorded` | Admin saves a student SPP tuition payment record via the finance modal. | `src/app/admin/finance/hooks/useFinanceModal.js` |
| `admin_payment_quick_confirmed` | Admin quick-confirms a student payment as fully paid (lunas) from the finance table. | `src/app/admin/finance/hooks/useFinanceModal.js` |
| `online_schedule_created` | Admin creates a new online class schedule entry via the API. | `src/app/api/online-schedule/route.js` |

## Previously existing events

| Event name | File |
|---|---|
| `placement_test_started` / `placement_test_registered` / `placement_test_completed` | `src/app/placement-test/PlacementTestClient.jsx` |
| `user_logged_in` / `user_registered` | `src/app/login/page.js` |
| `cta_placement_test_clicked` / `cta_free_registration_clicked` | `src/components/CTA.jsx` |
| `hero_placement_test_clicked` | `src/components/Hero.jsx` |
| `offline_form_printed` | `src/app/formulir-offline/page.js` |
| `ai_chat_message_sent` | `src/app/api/ai-chat/route.js` |
| `admin_student_enrolled` | `src/app/admin/students/page.js` |
| `admin_logged_out` | `src/app/admin/page.js` |

## Infrastructure changes

- `src/instrumentation-client.js` — Added PostHog client init (`posthog.init`) alongside Sentry, using `/ingest` reverse proxy, `defaults: "2026-01-30"`, and `capture_exceptions: true`
- `src/app/login/page.js` — Added `posthog.identify()` at user registration (login already had it)
- `.env.local` — Confirmed and updated `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/487531/dashboard/1769034)
- [Placement Test Conversion Funnel (wizard)](https://us.posthog.com/project/487531/insights/RNFgsO7G)
- [User Registrations & Logins Over Time (wizard)](https://us.posthog.com/project/487531/insights/mCEZj43D)
- [AI Chat Engagement (wizard)](https://us.posthog.com/project/487531/insights/Q02yKZPP)
- [Student Registration Decisions (wizard)](https://us.posthog.com/project/487531/insights/TCHlhOlG)
- [Admin Operations Activity (wizard)](https://us.posthog.com/project/487531/insights/qADaHR5x)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the login handler identifies on fresh login; returning sessions that skip login will remain on anonymous distinct IDs until they log in again.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
