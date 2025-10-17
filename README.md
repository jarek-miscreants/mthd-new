# Method - Marketing Website

Website Monorepo (Next.js app + Sanity Studio)

## Overview

- This repository is a monorepo containing:
  - /app → Next.js application (frontend)
  - /studio → Sanity Studio (CMS)
  - Root-level package.json manages scripts and dependencies for both.

## Developer Setup

### CLI Dependencies

Install the Sanity CLI:

```bash
npm install --global sanity@latest
```

### Environment Variables Setup

Create a new file for the app at `app/.env.local` with the following contents:

```yaml
NEXT_PUBLIC_SANITY_PROJECT_ID=<our project ID>
NEXT_PUBLIC_SANITY_DATASET=development
NEXT_PUBLIC_SITE_URL=https://www.method.security
NEXT_PUBLIC_SANITY_API_READ_TOKEN=<get from Marketing/Sanity Method-Website Project Dev Read Only Token in Bitwarden>
```

Create a new file for the studio at `studio/.env.local` with the following contents:

```yaml
SANITY_STUDIO_PROJECT_ID=<our project ID>
SANITY_STUDIO_DATASET=development
```

### Package Installation

In repository root run `npm install`. This installs everything across the `app` and `sutdio` projects.

### Adding A New Dependency To App

```bash
cd app
npm install <your package>
```

### Run (Development)

Open two CLIs in your IDE:

1. Next.js app:

```bash
npm run dev:app
```
URL: http://localhost:3000

2. Sanity Studio:

```bash
source studio/.env.local
npm run dev:studio
```

URL: http://localhost:3333

Note: If you want to see exactly what is in production, for the two `DATASET` env vars, change that to `production`.

### Build (Production)

1. Next.js app:

```bash
npm run build:app
npm run start
```

2. Sanity Studio:

```bash
npm run build:studio
```

## Workflows

### Making Content (CMS) Edits Only

TODO: should use content release

### Making Content (CMS) Schema Edits

1. Clone the production dataset into a new development dataset in Sanity

If a `development` branch already exists and you won't conflict, delete it in Santity. In the future, we can do more complicated dataset management.

```bash
cd studio
sanity login
sanity dataset export production production-backup.tar.gz
sanity dataset create development --visibility private
sanity dataset import production-backup.tar.gz development
```

2. Run the Next.js app and Sanity studio locally

3. Make your content edits

4. Ahead of deploying into production, ensure that any CMS additions needed before going live are put into Sanity with the new schema
- This would be improved in the future if there is a an explicit staging process



## To figure out
- how to setup a studio directly in the online portal so people can make content changes without opening the repo? How can this be pushed to a stanging env to view it live?

- security - is this the proper use of NEXT_PUBLIC env vars? doesn't this expose them to the browser?

- whether to use the CDN or not?

- get CI in a better place with vercel to create previews

---

### SEO taks before going live

- Ensure index/follow are true in `mapSeoToMetadata()`
- Change `robots.ts` to allow crawlers (+ uncomment sitemap)

## Open points

    - Final animation/video files (provide sources and exported formats)
        - MP4/WebM/Lottie
    - Stylistic & Interaction refinements
    - Provide video urls via CDN to keep away from builds
