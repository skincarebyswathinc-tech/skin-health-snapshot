# Skin Health Snapshot

Build a premium micro-SaaS web app called "SkinPulse" that analyzes a user's face photo and returns a skin health dashboard.

This app must be fully vibe-codable inside Lovable with NO third-party dependencies beyond native Lovable capabilities, Supabase integration, and GitHub integration. Do not use external component libraries, chart libraries, image-processing libraries, AI SDKs, or other packages. Use clean native frontend implementation, simple custom components, and a modular code structure so advanced analysis can be added later.

PRIMARY GOAL:

Create a functional Phase 1 MVP foundation with:

1. landing page

2. authentication

3. user onboarding

4. dashboard shell

5. scan upload flow

6. results page shell

7. scan history

8. settings page

9. Supabase data structure and connections

10. beautiful premium wellness aesthetic

POSITIONING:

SkinPulse is a premium skin analytics and self-tracking platform. The app should feel like a blend of Apple Health, Oura, and a dermatology wellness dashboard. It should feel scientific, calming, elegant, modern, and trustworthy.

DESIGN DIRECTION:

Use a soft premium skin/wellness aesthetic:

- glassmorphism-inspired cards built with native CSS only

- clean whitespace

- rounded panels

- subtle gradients

- muted dermatology-inspired palette

- premium wellness look

- minimalist UI

- visually impressive but not cluttered

COLOR DIRECTION:

Use a soft luxurious palette such as:

- cream / off-white backgrounds

- warm beige

- soft rose

- muted lavender

- soft teal accents

- charcoal text

Avoid neon, harsh contrast, cartoonish colors, or overly playful aesthetics.

TYPOGRAPHY:

Use elegant modern sans-serif styling already available in-browser or default-safe fallback stacks. No external font dependencies.

APP STRUCTURE:

Create the following pages and routes:

1. Landing Page

- hero section

- product explanation

- value propositions

- CTA buttons

- "Scan Your Skin" primary CTA

- "View Demo Dashboard" secondary CTA

- premium wellness marketing section

- how-it-works section

- pricing placeholder section

- footer

2. Auth Page

- sign up

- sign in

- password reset placeholder if supported by native Supabase flow

- clean elegant layout

- error states

- success states

3. Onboarding Page

Collect:

- first name

- age range

- skin concern priorities (multi-select)

- skin type

- goals

- consent acknowledgment

Keep this lightweight and clean.

4. Dashboard Page

Main logged-in home.

Must include:

- welcome header

- quick skin score card placeholder

- latest scan summary placeholder

- upload new scan CTA

- scan history preview

- progress section placeholder

- recommendations placeholder

- premium upgrade placeholder

This page should work even before advanced analytics are built.

5. New Scan Page

- image upload area

- drag-and-drop area

- upload from device

- image preview

- instructions for taking a good selfie

- disclaimer that this is a wellness insight tool and not a medical diagnosis

- continue button after valid image upload

6. Analysis Loading Page

- polished loading interface

- reassuring copy

- staged progress states like:

  - preparing image

  - aligning facial region

  - reading visible skin markers

  - generating dashboard

No fake medical claims.

7. Results Page

Phase 1 results can use a structured placeholder scoring engine.

Must include:

- overall skin health score

- metric cards:

  - hydration

  - texture

  - pigmentation

  - inflammation

  - elasticity

- skin age estimate placeholder

- summary insights block

- uploaded scan preview

- save scan action

- return to dashboard action

8. Scan History Page

- list of prior scans

- date

- thumbnail

- overall score

- quick metric summary

- click into each scan

- empty state for first-time users

9. Scan Detail Page

- full saved result display

- metric breakdown

- summary text

- uploaded image preview

- created date

- simple trend comparison placeholder if prior scan exists

10. Settings Page

- profile basics

- skin goals

- preferred reminders placeholder

- account section

- subscription placeholder

- logout

TECHNICAL REQUIREMENTS:

Use a modular internal structure with reusable components and no external UI packages.

Build with:

- reusable layout shell

- reusable card component

- reusable metric tile

- reusable button variants

- reusable form sections

- reusable empty states

- reusable page headers

SUPABASE INTEGRATION:

Set up Supabase-backed data model and wire the app for real persistence.

Use these core entities:

1. profiles

Fields:

- id

- created_at

- first_name

- age_range

- skin_type

- goals

- skin_concerns

- consent_accepted

2. scans

Fields:

- id

- created_at

- user_id

- image_url

- overall_score

- skin_age_estimate

- hydration_score

- texture_score

- pigmentation_score

- inflammation_score

- elasticity_score

- summary_text

- status

3. app_preferences

Fields:

- id

- user_id

- reminder_pref

- theme_pref

- onboarding_complete

SUPABASE FEATURES TO IMPLEMENT:

- authentication

- protected routes for app pages

- profile creation after sign up

- image upload to storage bucket

- scan record creation

- fetch user scan history

- fetch scan detail

- update onboarding/profile data

PHASE 1 ANALYSIS ENGINE:

Since this app must avoid third-party dependencies, implement a simple internal MVP scoring layer for now.

For the uploaded image:

- accept image upload

- preview image

- simulate lightweight image analysis flow

- generate deterministic placeholder scores using internal logic so the app is fully testable end-to-end

Important:

Do NOT pretend to perform real dermatological diagnosis.

Instead, structure this as an MVP-friendly “visible skin wellness snapshot” engine.

Requirements for Phase 1 scoring engine:

- generate five metric scores from 0 to 100

- generate overall score from weighted average

- generate skin age estimate from score pattern

- generate summary text based on score ranges

- keep the logic modular and clearly marked as replaceable later

Example metric model:

- hydration

- texture

- pigmentation

- inflammation

- elasticity

The score generation can be based on a stable internal pseudo-analysis approach tied to upload/session data so results are reproducible enough for MVP demo/testing. Keep it clearly abstracted behind a service/module so it can be replaced in Phase 2 or later.

RESULTS LOGIC:

Create a clean internal function that:

- takes uploaded image reference

- returns metric scores

- computes overall score

- produces summary text

- saves results to Supabase

UX REQUIREMENTS:

- smooth transitions

- delightful empty states

- strong clarity

- simple navigation

- mobile responsive

- desktop polished

- premium CTA hierarchy

- clear labels

- frictionless onboarding

- trust-building tone

COPY STYLE:

Use language that is:

- calm

- intelligent

- helpful

- non-alarming

- wellness-oriented

Avoid dramatic medical language.

DISCLAIMERS:

Include gentle disclaimers where relevant:

- not a medical diagnosis

- intended for general wellness insights

- results are informational only

OUTPUT REQUIREMENT:

Generate the complete Phase 1 foundation of the app including:

1. app structure

2. route structure

3. reusable component structure

4. Supabase schema wiring

5. authentication flow

6. onboarding flow

7. upload flow

8. placeholder analysis engine

9. dashboard shell

10. polished UI implementation across all required pages

Also ensure the codebase is organized so future phases can add:

- real analysis logic

- habit tracking

- progress trends

- premium subscriptions

- downloadable reports

IMPORTANT CONSTRAINTS:

- no third-party dependencies

- no external charting packages

- no external AI/image packages

- no external UI libraries

- no fake claims of real diagnosis

- everything should be clean, modular, premium, and ready for iterative expansion

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a7a28d86-6978-4e4d-a739-c6bf7762499e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
