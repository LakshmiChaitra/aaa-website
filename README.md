# Anusha Art Academy

Live website: https://anusha-art-academy.onrender.com/
Phone preview: https://anusha-art-academy.onrender.com/phone-preview.html

Render Free deploys the `codex/deploy-academy-render` branch of LakshmiChaitra/aaa-website. Build: `pip install -r requirements.txt`. Start: `gunicorn production_app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 30 --access-logfile -`. Health check: `/healthz`.

Set `PYTHON_VERSION=3.13.5`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in Render only. Both hosting and Redis use Free plans. The counter is durable; the service sleeps when idle.

Registration uses one styled form and `/api/registrations`. The server validates required fields and available learning modes, maps all details to the academy Google Form, and only returns success after Google displays its recorded-response confirmation. Google receives address, class, online/offline mode, guardian and batch notes. A reference is included in the response notes. Redis stores only a temporary reference, payload hash and status for retry protection, with no learner details. An uncertain submission is not resent automatically. The new intake form belongs to the user and is linked to their private registration Sheet. Summary, master, 15 course views and Tests tabs categorize incoming responses automatically. Historical responses in the former academy form still require its owner's export.

The Google Forms web submission endpoint is not a versioned API; if the form fields, confirmation message, access or submission behavior change, recheck the integration. A rejected or unconfirmed response shows an error instead of success. Unit tests: `python3 -m unittest discover -s tests -v`.

Album slides load newest first with the original collection retained, four desktop columns and a 12-photo preview. Upcoming events load from the public Google Doc. Carnatic Music and Yoga support online/offline selection. Phone timetables rotate 90 degrees and fit the viewport. Video sources remain pending.

Run the production app locally with `python3 -m flask --app production_app run --port 4188`. Without Redis credentials, submissions are safely unavailable. The older `preview_server.py` previews static content and local view counts; it does not handle registration submissions.

## Reviewed website update — 22 November 2026

Run `python3 local_demo.py`, then review http://127.0.0.1:4190/ and http://127.0.0.1:4190/phone-preview.html. This entry point replaces Google submission and Redis with in-memory demo functions; no preview registrations reach the live Sheet. It also labels its confirmation as local-only. Never use `local_demo.py` as the production start command.

The reviewed update hides unconfigured videos, suppresses the known Events draft messages while preserving future Doc updates, adds course/fee/introductory-session guidance and a Google reviews link, shows upright day schedules on phones while retaining the rotated full week, and keeps registration entirely on the website with a payment-only WhatsApp reference link after confirmation. Little Artists uses a brighter seven-colour card palette and playful introduction; the duplicate hero shortcuts were removed on request. Real video URLs and approved testimonial quotes are still needed for their final media content. No fee amounts, minimum ages, free trials or response-time promises have been invented.

`python3 build_static.py` builds public frontend files in `dist/`; `render-static.yaml` prepares a separate free static site. For a separate static deployment, set the backend’s `PUBLIC_SITE_ORIGINS` to the static site's exact HTTPS origin. The static build defaults to the current Render API origin, configurable with `ACADEMY_API_BASE`. Public pages can then load from static hosting while the free API wakes in the background for views, registrations and remote album images. The existing Render service continues serving the website. The separate static frontend remains optional and has not been created.

## Approved update - 23 November 2026

Updated the supplied academy logo and guru tribute photographs, added the Telugu salutation and corrected founder/tutor wording. The album is titled AAA Album; Slides page `p` is excluded from website display while new Slides additions remain supported. Kuchipudi and Western Dance use the selected K2/W3 artwork. Keyboard, Handwriting, Martial Arts and Zumba detail panels use object silhouettes with readable text inside. Added Sona Kapoor to the Art tutor category using the supplied CV and classroom group photograph. Keyboard runs Monday and Wednesday only, 6-7 p.m., in the course details, web timetable and downloadable PDF. Registration and its private Sheet integration are unchanged.

Validation: seven backend tests, JavaScript syntax checks, SVG parsing, static build and local visual review. No live learner test submissions were sent for this update.
