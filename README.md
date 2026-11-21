# Anusha Art Academy — recovered preview

Recovered on 20 November 2026 from the GitHub backup LakshmiChaitra/aaa-website (main, last pushed 3 November). Later changes from the current chat were reapplied: active Keyboard/Zumba timings, Keyboard in the kids filter, online/offline registration choices, Google Form review/submission, footer eye/count, public Doc events, newest-first Slides album, four desktop columns and twelve-photo preview. The older backup lacked later visual refinements; the kids styling and missing course icons were reconstructed. Review the screenshots and browser previews before deployment.

Start from this folder: `python3 preview_server.py`.

Desktop: http://127.0.0.1:4187/saved/1/
Phone: http://127.0.0.1:4187/phone-preview.html

Registration responses use the academy Google Form. Linking and organizing the owner's Google Sheet is pending owner access. No test responses have been submitted. Videos remain unconfigured.

This server binds only to localhost. Hosting must provide the /api/views and /api/album-image routes with persistent view-count storage; uploading only the HTML will not reproduce those features. The view database remains outside the served folder at ../tmp/academy-views.sqlite3. Google Doc and Slides must be publicly readable.


## Free deployment preparation — 21 November 2026

`render.yaml` selects Render's Free Python web service, builds `requirements.txt`, and starts the Flask app with Gunicorn. `production_app.py` serves the site and the Slides image route. The view counter uses an atomic Redis INCR command through Upstash REST, avoiding Render's ephemeral filesystem. Create an Upstash database on its Free plan and configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` privately in Render; do not put the token into browser code or Git. Health checks return 503 until those variables exist. Counter requests report unavailable on connection failures, without displaying invented counts.

Production setup is prepared and tested with a mocked counter store; it has not been deployed or connected to a live Upstash store. Render sign-in and repository authorization are pending. Free Render services sleep when idle and have usage limits. Keep both provider accounts on their free plans; no paid service has been created. Registration is still completed in Google Forms, with its owner-side Sheet connection pending.

The phone timetable is transposed: days are rows and classes are columns. Desktop retains the original layout. The footer FAQ shortcut is replaced by the eye/count in the same row. The Upcoming Events logo, title and document text fit the inner parchment border.

Latest phone layout: horizontal weekly table restored at user request; classes are rows, weekdays are columns. Footer FAQ shortcut remains replaced by eye/count.

Latest timetable preference: on phones, the actual table is rotated 90 degrees clockwise and scaled to fit the content width. Desktop remains unrotated.

Phone timetable fit: rotated view now scales against both available screen width and height below the navigation. Compact Sunday labels retain an enrolment footnote; full desktop labels are unchanged.
