# Yanagaman
Carpooling across Sri Lanka: a public concept preview, not a live transport service.

## Run locally
Use Node 24 (Node 22.12+ is supported).
```sh
npm ci
npm run dev
```

## Verify
```sh
npm run build
npm test
npm run lint
npm run test:browser
```
Browser checks require Chrome/Chromium; set CHROME_PATH if it is not installed in a standard location. They run against a temporary server serving dist. Set BASE_URL to test the deployed preview.

## Preview behaviour
- Search upcoming sample rides by cities, Sri Lanka date, seats, and preferences.
- Try demo bookings, cancellations, and offers without accounts or payments.
- Offers and bookings use this tab's sessionStorage under yanagaman.preview.v1. Reset demo replaces them with fresh samples. Session restoration may preserve data after closing.
- No identity, phone, location, or payment information is collected. No API requests or analytics are used. Fonts and images are hosted locally.
- All fares and meeting points are illustrative. No verification, emergency response, or live tracking is provided.

The replaceable adapter in src/services/demoService.ts owns demo data and validation. The legacy server/ and Docker files are preserved for future development but are not used by the preview. They are not production-ready services and must not be exposed to passengers.

## Deployment
Deploy dist as a free Render Static Site. See DEPLOYMENT.md and render.yaml. Do not deploy the SQLite backend for this release.

## Visual assets
The hero image was generated using the built-in imagegen tool and optimized into:
- public/images/sri-lanka-road.webp (1920 × 800)
- public/images/sri-lanka-road-small.webp (960 × 400)

Prompt: Editorial photograph of a quiet curving two-lane road through lush Sri Lankan hill-country tea plantations, a small unbranded ivory passenger car driving away in the left lane, distant mist-softened green mountains, palms and tea bushes, early warm daylight, natural colours and realistic texture. Wide landscape with the road sweeping toward the valley. Understated premium travel photography. No text, logos, people, faces, or invented landmark. Illustrative scenery, not a real customer trip.

Replace these assets with original travel photography if desired. No testimonials, customer photographs, statistics, or partnerships are claimed.
