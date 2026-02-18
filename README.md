# Method - Marketing Website

## Overview

Next.js 15 marketing site with local MDX content. All content lives in the repo as `.mdx` files with YAML frontmatter. Content is code: editable by developers and AI agents, versioned in git, deployed statically.

### Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS v4, CSS custom properties
- **Content:** Local MDX files parsed with `gray-matter` + `remark`
- **Animations:** GSAP (ScrollTrigger, SplitText), Lottie, Lenis smooth scroll
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics

### Repository Structure

```
/
├── app/                        # Next.js application
│   ├── content/                # All site content (MDX files)
│   │   ├── pages/              # Singleton pages (home, about, contact, etc.)
│   │   ├── products/           # Product pages (slug = filename)
│   │   ├── blog/               # Blog posts (slug = filename, has markdown body)
│   │   ├── legal/              # Legal pages (slug = filename, has markdown body)
│   │   ├── authors/            # Blog authors
│   │   └── settings/           # Site-wide settings (nav, footer, social)
│   ├── public/                 # Static assets
│   │   ├── content/            # Content images (blog, authors, careers, seo)
│   │   ├── product-symbols/    # Product SVG icons
│   │   └── product-solutions/  # Product solution videos
│   └── src/
│       ├── app/                # Next.js routes and pages
│       ├── components/         # React components (sections, elements, frame, util)
│       └── lib/                # Content loading, types, SEO, navigation
├── scripts/                    # Migration and utility scripts
└── package.json                # Workspace root
```

## Architecture

```
MDX File (content/)
    ↓
gray-matter (parse YAML frontmatter)
    ↓
Page component (app/src/app/**/page.tsx)
    ↓
Section components (props from frontmatter)
    ↓
Static HTML (built at deploy time)
```

Content loading is handled by `app/src/lib/content.ts`:

| Function | Purpose |
|----------|---------|
| `getContent<T>(path)` | Read frontmatter only (singleton pages, settings) |
| `getContentWithBody<T>(path)` | Read frontmatter + render markdown body to HTML (blog, legal) |
| `getCollection<T>(dir)` | List all files in a directory with `{ slug, frontmatter }` |
| `getCollectionSlugs(dir)` | Return slug array for `generateStaticParams()` |
| `getReadingTime(path)` | Calculate reading time from markdown body |

## Developer Setup

### Prerequisites

- Node.js >= 22

### Installation

```bash
npm install
```

### Environment Variables

Create `app/.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://www.method.security
```

### Run (Development)

```bash
npm run dev
```

URL: http://localhost:3000

### Build (Production)

```bash
npm run build
npm run start
```

### Adding a Dependency

```bash
npm install -w app <package-name>
```

## Deployment

Vercel hosts the site with automatic deploys from GitHub.

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | https://www.method.security |
| `development` | Staging | Vercel preview URL |
| Feature branches | Preview | Auto-generated Vercel preview link per PR |

**Workflow:**

1. Create a feature branch from `main`
2. Make changes (code and/or content)
3. Open a PR — Vercel generates a preview link automatically
4. Review the preview, get approval
5. Merge to `staging` for team-wide review (Vercel deploys a preview)
6. Merge to `main` to deploy to production

## Content Authoring

All content is in `app/content/` as `.mdx` files. Most pages use **frontmatter only** (structured YAML data). Blog posts and legal pages also have a **markdown body** below the frontmatter.

### Content Types

| Directory | Slug source | Body? | Description |
|-----------|-------------|-------|-------------|
| `pages/` | Fixed filenames | No | Singleton pages (home, about, contact, careers, etc.) |
| `products/` | Filename | No | Product pages — filename becomes `/products/{slug}` |
| `blog/` | Filename | Yes | Blog posts — filename becomes `/blog/{slug}` |
| `legal/` | Filename | Yes | Legal pages — filename becomes `/legal/{slug}` |
| `authors/` | Filename | No | Blog authors — referenced by slug from blog posts |
| `settings/` | Fixed | No | Site-wide config (navigation, footer, social preview) |

### Adding a Blog Post

1. Create a new file at `app/content/blog/your-post-slug.mdx`
2. Add frontmatter and markdown body:

```yaml
---
title: Your Post Title
excerpt: A short summary for the blog listing page.
author: sam-jones           # Must match a filename in content/authors/
publishedAt: "2026-02-16T12:00:00.000Z"
category: Engineering       # One of: Company, Product, Engineering, Customers, News
featuredImageUrl: /content/blog/your-post-slug/hero.png
featuredImageAlt: Description of the image
seo:
  title: Your Post Title | Method Security
  description: SEO description for search results
  ogImage: /content/seo/your-og-image.png
---

Your markdown content goes here.

## Subheadings work

So do **bold**, *italic*, [links](https://example.com), lists, and images:

![Alt text](/content/blog/your-post-slug/inline-image.png)
```

3. Add images to `app/public/content/blog/your-post-slug/`
4. Commit and push — the post will appear on the blog page

### Adding a Product

1. Create `app/content/products/your-product.mdx` with the product frontmatter
2. Add the product symbol SVG to `app/public/product-symbols/your-product.svg`
3. The product automatically appears in navigation dropdowns, the products overview page, and the homepage highlights

### Adding an Author

Create `app/content/authors/author-slug.mdx`:

```yaml
---
name: Full Name
role: Title
company: Method Security
avatarUrl: /content/authors/avatar.jpg
bio: Short bio text.
socialLinks:
  twitter: https://twitter.com/handle
  linkedin: https://linkedin.com/in/handle
---
```

### Editing Site Navigation & Footer

Edit `app/content/settings/site.mdx`. This controls:

- Header navigation items and dropdowns
- Footer link groups, CTAs, and tagline
- Mobile menu cards
- Social link preview metadata (OG defaults)

Product links in the nav dropdown and footer are auto-generated from product files.

The `target` field on links controls how the link opens:

- `_self` (default) — opens in the same tab (use for internal pages)
- `_blank` — opens in a new tab (use for external URLs like docs, social media, mailto links)

### Editing Singleton Pages

Edit the corresponding file in `app/content/pages/`. For example:

- Home page: `app/content/pages/home.mdx`
- About page: `app/content/pages/about.mdx`
- Contact page: `app/content/pages/contact.mdx`

The frontmatter fields map directly to component props. Look at the corresponding `page.tsx` to see which fields are used.

### SEO

Every content file can include an `seo` block in its frontmatter:

```yaml
seo:
  title: Page Title
  description: Meta description for search engines
  ogTitle: Open Graph title (defaults to seo.title)
  ogDescription: Open Graph description (defaults to seo.description)
  ogImage: /content/seo/og-image.png
```

OG images should be placed in `app/public/content/seo/` at 1200x628px.
