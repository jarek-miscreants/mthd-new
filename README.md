# Method - Marketing Website

Project Handover — Monorepo (Next.js app + Sanity Studio)

## Overview

- This repository is a monorepo containing:
  - /app → Next.js application (frontend)
  - /studio → Sanity Studio (CMS)
  - Root-level package.json manages scripts and dependencies for both.

## Installation

- In repository root run `npm install`

## Run (development)

- Next.js app:
  - npm run dev:app
    - URL: http://localhost:3000
- Sanity Studio:
  - npm run dev:studio
  - at http://localhost:3333

## Build (production)

- Next.js app:
  - npm run build:app
  - npm run start
- Sanity Studio:
  - npm run build:studio

## Environment Variables

- app/env.local
  NEXT_PUBLIC_SANITY_PROJECT_ID=stmwtpl3
  NEXT_PUBLIC_SANITY_DATASET=production
  NEXT_PUBLIC_SITE_URL=https://www.method.security

---

## SEO taks before going live

- Ensure index/follow are true in `mapSeoToMetadata()`
- Change `robots.ts` to allow crawlers (+ uncomment sitemap)

## Open points

    - Final animation/video files (provide sources and exported formats)
        - MP4/WebM/Lottie
    - Stylistic & Interaction refinements
    - Provide video urls via CDN to keep away from builds
