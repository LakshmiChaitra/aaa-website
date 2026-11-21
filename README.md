# Anusha Art Academy

Live website: https://anusha-art-academy.onrender.com/
Phone preview: https://anusha-art-academy.onrender.com/phone-preview.html

Render Free deploys the `codex/deploy-academy-render` branch of LakshmiChaitra/aaa-website. Build: `pip install -r requirements.txt`. Start: `gunicorn production_app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 30 --access-logfile -`. Health check: `/healthz`.

Set `PYTHON_VERSION=3.13.5`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in Render only. Both hosting and Redis use Free plans. The counter is durable; the service sleeps when idle.

Registration uses one styled form and `/api/registrations`. The server validates required fields and available learning modes, maps all details to the academy Google Form, and only returns success after Google displays its recorded-response confirmation. Google receives address, class, online/offline mode, guardian and batch notes. A reference is included in the response notes. Redis stores only a temporary reference, payload hash and status for retry protection, with no learner details. An uncertain submission is not resent automatically. The new intake form belongs to the user and is linked to their private registration Sheet. Summary, master, 15 course views and Tests tabs categorize incoming responses automatically. Historical responses in the former academy form still require its owner's export.

The Google Forms web submission endpoint is not a versioned API; if the form fields, confirmation message, access or submission behavior change, recheck the integration. A rejected or unconfirmed response shows an error instead of success. Unit tests: `python3 -m unittest discover -s tests -v`.

Album slides load newest first with the original collection retained, four desktop columns and a 12-photo preview. Upcoming events load from the public Google Doc. Carnatic Music and Yoga support online/offline selection. Phone timetables rotate 90 degrees and fit the viewport. Video sources remain pending.

Run the production app locally with `python3 -m flask --app production_app run --port 4188`. Without Redis credentials, submissions are safely unavailable. The older `preview_server.py` previews static content and local view counts; it does not handle registration submissions.
