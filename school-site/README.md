# Catherine Primary School

Responsive school website concept with a custom SVG star logo, compacting sticky header, school information, admissions call-to-action, responsive photo gallery/lightbox, and a teacher results-dashboard prototype.

## Run locally

From the `school-site` folder, serve the files (for example `python -m http.server 8000`) and open `http://localhost:8000`.

## Teacher dashboard demo

Use the Staff Space form with:

- Email: `teacher@catherine.school`
- Password: `Catherine2026!`

The prototype includes sample students, searchable class records, marks entry for Mathematics/English/Science, automatic averages, summary statistics, and adding students. Data is saved to this browser's local storage only.

## Important production note

This is a front-end demonstration, not a secure student information system. The sample login is visible in the JavaScript and provides no real authentication, authorization, audit trail, backups, or server-side data storage. Do not enter real student records. A production deployment must use a secure backend, per-user accounts/roles, encrypted transport and storage, access controls, backups, and appropriate child-data/privacy safeguards. Replace the sample contact email and all demo imagery/text with approved school information before launch. Photos load from Unsplash and need an internet connection.
