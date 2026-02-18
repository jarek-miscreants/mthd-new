#!/usr/bin/env node

/**
 * One-time migration script: Sanity CMS → Local MDX files
 *
 * Usage: node scripts/migrate-sanity-to-mdx.mjs
 *
 * Requires env vars (reads from app/.env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_READ_TOKEN
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const appDir = path.join(rootDir, "app");
const contentDir = path.join(appDir, "content");
const publicDir = path.join(appDir, "public");

// Load env from app/.env.local
function loadEnv() {
  const envPath = path.join(appDir, ".env.local");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    process.env[key] = val;
  }
}

loadEnv();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-09-13",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published",
});

// ─── Helpers ───

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toYamlValue(val, indent = 0) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    // Multi-line or strings with special chars need quoting
    if (val.includes("\n") || val.includes('"') || val.includes(":") || val.includes("#") || val.includes("'") || val.startsWith("[") || val.startsWith("{") || val === "" || val === "true" || val === "false" || val === "null") {
      // Use double-quoted with escaping
      return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    const lines = val.map((item) => {
      if (typeof item === "object" && item !== null) {
        const objLines = Object.entries(item)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}: ${toYamlValue(v, indent + 4)}`);
        return `${"  ".repeat(indent / 2 + 1)}- ${objLines[0]}\n${objLines
          .slice(1)
          .map((l) => `${"  ".repeat(indent / 2 + 2)}${l}`)
          .join("\n")}`;
      }
      return `${"  ".repeat(indent / 2 + 1)}- ${toYamlValue(item)}`;
    });
    return `\n${lines.join("\n")}`;
  }
  if (typeof val === "object") {
    const entries = Object.entries(val).filter(
      ([, v]) => v !== undefined && v !== null
    );
    if (entries.length === 0) return "{}";
    const lines = entries.map(
      ([k, v]) => `${"  ".repeat(indent / 2 + 1)}${k}: ${toYamlValue(v, indent + 2)}`
    );
    return `\n${lines.join("\n")}`;
  }
  return String(val);
}

function buildFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    lines.push(`${key}: ${toYamlValue(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

// Remove Sanity internal fields (_key, _type, _ref, etc.) from objects recursively
function cleanSanityFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanSanityFields);
  }
  if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("_")) continue;
      cleaned[key] = cleanSanityFields(value);
    }
    return cleaned;
  }
  return obj;
}

function writeMdx(filePath, frontmatterData, body = "") {
  ensureDir(path.dirname(filePath));
  const cleanedData = cleanSanityFields(frontmatterData);
  const fm = buildFrontmatter(cleanedData);
  const content = body ? `${fm}\n\n${body}\n` : `${fm}\n`;
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  ✓ ${path.relative(rootDir, filePath)}`);
}

async function downloadImage(url, destPath) {
  if (!url) return null;
  ensureDir(path.dirname(destPath));

  // Skip if already downloaded
  if (fs.existsSync(destPath)) {
    return `/content/${path.relative(path.join(publicDir, "content"), destPath)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ Failed to download: ${url} (${res.status})`);
      return url; // fallback to CDN URL
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    const relativePath = path.relative(publicDir, destPath);
    console.log(`  ↓ ${relativePath}`);
    return `/${relativePath}`;
  } catch (err) {
    console.warn(`  ⚠ Failed to download: ${url} (${err.message})`);
    return url; // fallback to CDN URL
  }
}

// Extract image filename from Sanity CDN URL
function imageFilename(url) {
  if (!url) return null;
  const parts = url.split("/");
  return parts[parts.length - 1].split("?")[0];
}

// ─── Portable Text → Markdown ───

function portableTextToMarkdown(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block._type === "image") {
        const url = block.asset?.url || "";
        const alt = block.alt || block.caption || "";
        if (url) return `![${alt}](${url})`;
        return "";
      }

      if (block._type !== "block") return "";

      const style = block.style || "normal";
      const children = block.children || [];

      let text = "";
      for (const child of children) {
        let span = child.text || "";

        // Apply marks
        const marks = child.marks || [];
        for (const mark of marks) {
          if (mark === "strong") {
            span = `**${span}**`;
          } else if (mark === "em") {
            span = `*${span}*`;
          } else {
            // Check markDefs for links
            const markDef = (block.markDefs || []).find((m) => m._key === mark);
            if (markDef && markDef._type === "link") {
              span = `[${span}](${markDef.href})`;
            }
          }
        }

        text += span;
      }

      // Apply block styles
      switch (style) {
        case "h2":
          return `## ${text}`;
        case "h3":
          return `### ${text}`;
        case "h4":
          return `#### ${text}`;
        case "h5":
          return `##### ${text}`;
        case "h6":
          return `###### ${text}`;
        case "blockquote":
          return `> ${text}`;
        default:
          break;
      }

      // Handle lists
      if (block.listItem === "bullet") {
        const indent = "  ".repeat((block.level || 1) - 1);
        return `${indent}- ${text}`;
      }
      if (block.listItem === "number") {
        const indent = "  ".repeat((block.level || 1) - 1);
        return `${indent}1. ${text}`;
      }

      return text;
    })
    .join("\n\n");
}

// ─── Migration Functions ───

async function migrateHomePage() {
  console.log("\n📄 Home Page");
  const data = await client.fetch(`
    *[_type == "homePage" && _id == "homePage"][0] {
      title,
      hero,
      mission,
      architecture,
      deploy,
      cards,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No home page found");
    return;
  }

  // Download OG image
  if (data.seo?.ogImage) {
    const fname = imageFilename(data.seo.ogImage);
    const localPath = await downloadImage(
      data.seo.ogImage,
      path.join(publicDir, "content", "seo", fname)
    );
    data.seo.ogImage = localPath;
  }

  writeMdx(path.join(contentDir, "pages", "home.mdx"), data);
}

async function migrateAboutPage() {
  console.log("\n📄 About Page");
  const data = await client.fetch(`
    *[_type == "aboutPage" && _id == "aboutPage"][0] {
      title,
      highlightTexts,
      cards,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No about page found");
    return;
  }

  if (data.seo?.ogImage) {
    const fname = imageFilename(data.seo.ogImage);
    const localPath = await downloadImage(
      data.seo.ogImage,
      path.join(publicDir, "content", "seo", fname)
    );
    data.seo.ogImage = localPath;
  }

  writeMdx(path.join(contentDir, "pages", "about.mdx"), data);
}

async function migrateContactPage() {
  console.log("\n📄 Contact Page");
  const data = await client.fetch(`
    *[_type == "contactPage" && _id == "contactPage"][0] {
      title,
      eyebrow,
      text,
      cards,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No contact page found");
    return;
  }

  if (data.seo?.ogImage) {
    const fname = imageFilename(data.seo.ogImage);
    const localPath = await downloadImage(
      data.seo.ogImage,
      path.join(publicDir, "content", "seo", fname)
    );
    data.seo.ogImage = localPath;
  }

  writeMdx(path.join(contentDir, "pages", "contact.mdx"), data);
}

async function migrateCareersPage() {
  console.log("\n📄 Careers Page");
  const data = await client.fetch(`
    *[_type == "careersPage" && _id == "careersPage"][0] {
      eyebrow,
      text,
      careersPageUrl,
      section1Eyebrow,
      section1Items[] {
        title,
        description
      },
      section2Eyebrow,
      section2Items[] {
        title,
        description
      },
      mainImage {
        "src": asset->url,
        alt,
        aspectRatio,
        cutAngle
      },
      secondaryImages[] {
        "src": asset->url,
        alt,
        aspectRatio,
        cutAngle
      },
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No careers page found");
    return;
  }

  // Download careers images
  if (data.mainImage?.src) {
    const fname = imageFilename(data.mainImage.src);
    const localPath = await downloadImage(
      data.mainImage.src,
      path.join(publicDir, "content", "careers", fname)
    );
    data.mainImage.src = localPath;
  }

  if (data.secondaryImages) {
    for (let i = 0; i < data.secondaryImages.length; i++) {
      const img = data.secondaryImages[i];
      if (img.src) {
        const fname = imageFilename(img.src);
        const localPath = await downloadImage(
          img.src,
          path.join(publicDir, "content", "careers", fname)
        );
        data.secondaryImages[i].src = localPath;
      }
    }
  }

  if (data.seo?.ogImage) {
    const fname = imageFilename(data.seo.ogImage);
    const localPath = await downloadImage(
      data.seo.ogImage,
      path.join(publicDir, "content", "seo", fname)
    );
    data.seo.ogImage = localPath;
  }

  writeMdx(path.join(contentDir, "pages", "careers.mdx"), data);
}

async function migrateProductsOverviewPage() {
  console.log("\n📄 Products Overview Page");
  const data = await client.fetch(`
    *[_type == "productsOverviewPage" && _id == "productsOverviewPage"][0] {
      title,
      cards,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No products overview page found");
    return;
  }

  if (data.seo?.ogImage) {
    const fname = imageFilename(data.seo.ogImage);
    const localPath = await downloadImage(
      data.seo.ogImage,
      path.join(publicDir, "content", "seo", fname)
    );
    data.seo.ogImage = localPath;
  }

  writeMdx(path.join(contentDir, "pages", "products-overview.mdx"), data);
}

async function migrateProducts() {
  console.log("\n📦 Products");
  const products = await client.fetch(`
    *[_type == "product"] | order(sortOrder asc) {
      name,
      description,
      "slug": slug.current,
      sortOrder,
      "productSymbolUrl": productSymbol.asset->url,
      hero,
      tagline,
      highlight,
      solutions,
      cta,
      cards,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  for (const product of products) {
    const slug = product.slug;
    delete product.slug; // slug is the filename

    if (product.seo?.ogImage) {
      const fname = imageFilename(product.seo.ogImage);
      const localPath = await downloadImage(
        product.seo.ogImage,
        path.join(publicDir, "content", "seo", fname)
      );
      product.seo.ogImage = localPath;
    }

    writeMdx(path.join(contentDir, "products", `${slug}.mdx`), product);
  }
}

async function migrateBlogAuthors() {
  console.log("\n👤 Blog Authors");
  const authors = await client.fetch(`
    *[_type == "blogAuthor"] | order(name asc) {
      name,
      "slug": slug.current,
      bio,
      role,
      company,
      "avatarUrl": avatar.asset->url,
      socialLinks
    }
  `);

  for (const author of authors) {
    const slug = author.slug;
    delete author.slug;

    // Download avatar
    if (author.avatarUrl) {
      const fname = imageFilename(author.avatarUrl);
      const localPath = await downloadImage(
        author.avatarUrl,
        path.join(publicDir, "content", "authors", fname)
      );
      author.avatarUrl = localPath;
    }

    writeMdx(path.join(contentDir, "authors", `${slug}.mdx`), author);
  }
}

async function migrateBlogPosts() {
  console.log("\n📝 Blog Posts");
  const posts = await client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      excerpt,
      "authorSlug": author->slug.current,
      publishedAt,
      category,
      "featuredImageUrl": featuredImage.asset->url,
      "featuredImageAlt": featuredImage.alt,
      body[]{
        ...,
        _type == "image" => {
          ...,
          "asset": {
            "url": asset->url,
            "_id": asset->_id
          }
        }
      },
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  for (const post of posts) {
    const slug = post.slug;
    delete post.slug;

    // Download featured image
    if (post.featuredImageUrl) {
      const fname = imageFilename(post.featuredImageUrl);
      const localPath = await downloadImage(
        post.featuredImageUrl,
        path.join(publicDir, "content", "blog", slug, fname)
      );
      post.featuredImageUrl = localPath;
    }

    if (post.seo?.ogImage) {
      const fname = imageFilename(post.seo.ogImage);
      const localPath = await downloadImage(
        post.seo.ogImage,
        path.join(publicDir, "content", "seo", fname)
      );
      post.seo.ogImage = localPath;
    }

    // Convert body to markdown, downloading inline images
    let mdBody = "";
    if (post.body && Array.isArray(post.body)) {
      // First, download all inline images
      for (const block of post.body) {
        if (block._type === "image" && block.asset?.url) {
          const fname = imageFilename(block.asset.url);
          const localPath = await downloadImage(
            block.asset.url,
            path.join(publicDir, "content", "blog", slug, fname)
          );
          block.asset.url = localPath;
        }
      }
      mdBody = portableTextToMarkdown(post.body);
    }

    // Extract frontmatter fields (no body)
    const frontmatter = {
      title: post.title,
      excerpt: post.excerpt,
      author: post.authorSlug,
      publishedAt: post.publishedAt,
      category: post.category,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
      seo: post.seo,
    };

    writeMdx(
      path.join(contentDir, "blog", `${slug}.mdx`),
      frontmatter,
      mdBody
    );
  }
}

async function migrateBlogPage() {
  console.log("\n📄 Blog Page Settings");
  const data = await client.fetch(`
    *[_type == "blogPage" && _id == "blogPage"][0] {
      title,
      description,
      eyebrow,
      subscribeButtonText,
      subscribeButtonLink,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No blog page settings found");
    return;
  }

  if (data.seo?.ogImage) {
    const fname = imageFilename(data.seo.ogImage);
    const localPath = await downloadImage(
      data.seo.ogImage,
      path.join(publicDir, "content", "seo", fname)
    );
    data.seo.ogImage = localPath;
  }

  writeMdx(path.join(contentDir, "pages", "blog.mdx"), data);
}

async function migrateLegalPages() {
  console.log("\n⚖️  Legal Pages");
  const pages = await client.fetch(`
    *[_type == "legalPage"] | order(title asc) {
      title,
      "slug": slug.current,
      eyebrow,
      body,
      seo {
        title,
        description,
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->url
      }
    }
  `);

  for (const page of pages) {
    const slug = page.slug;
    delete page.slug;

    if (page.seo?.ogImage) {
      const fname = imageFilename(page.seo.ogImage);
      const localPath = await downloadImage(
        page.seo.ogImage,
        path.join(publicDir, "content", "seo", fname)
      );
      page.seo.ogImage = localPath;
    }

    const mdBody = portableTextToMarkdown(page.body);
    const frontmatter = {
      title: page.title,
      eyebrow: page.eyebrow,
      seo: page.seo,
    };

    writeMdx(
      path.join(contentDir, "legal", `${slug}.mdx`),
      frontmatter,
      mdBody
    );
  }
}

async function migrateSiteSettings() {
  console.log("\n⚙️  Site Settings");
  const data = await client.fetch(`
    *[_type == "siteSettings" && _id == "siteSettings"][0] {
      headerNavItems,
      footerNavGroups,
      footerName,
      footerTagline,
      copyrightTag,
      footerCtas,
      mobileMenuCards,
      socialLinkPreviewTitle,
      socialLinkPreviewDescription,
      socialLinkPreviewUrl,
      "socialLinkPreviewImageUrl": socialLinkPreviewImage.asset->url,
      "socialLinkPreviewImageMetadata": socialLinkPreviewImage.asset->metadata {
        dimensions {
          width,
          height
        }
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No site settings found");
    return;
  }

  // Download social preview image
  if (data.socialLinkPreviewImageUrl) {
    const fname = imageFilename(data.socialLinkPreviewImageUrl);
    const localPath = await downloadImage(
      data.socialLinkPreviewImageUrl,
      path.join(publicDir, "content", "seo", fname)
    );
    data.socialLinkPreviewImageUrl = localPath;
  }

  writeMdx(path.join(contentDir, "settings", "site.mdx"), data);
}

async function migrateCompanyPage() {
  console.log("\n📄 Company Page");
  const data = await client.fetch(`
    *[_type == "siteSettings" && _id == "siteSettings"][0] {
      "companyItems": headerNavItems[label == "Company"][0].dropdown[] {
        label,
        href,
        target
      }
    }
  `);

  if (!data) {
    console.log("  ⚠ No company page data found");
    return;
  }

  writeMdx(path.join(contentDir, "pages", "company.mdx"), data);
}

// ─── Main ───

async function main() {
  console.log("🚀 Starting Sanity → MDX migration\n");
  console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
  console.log(`Content dir: ${contentDir}`);
  console.log(`Public dir: ${publicDir}`);

  await migrateHomePage();
  await migrateAboutPage();
  await migrateContactPage();
  await migrateCareersPage();
  await migrateProductsOverviewPage();
  await migrateProducts();
  await migrateBlogAuthors();
  await migrateBlogPosts();
  await migrateBlogPage();
  await migrateLegalPages();
  await migrateSiteSettings();
  await migrateCompanyPage();

  console.log("\n✅ Migration complete!");
  console.log(
    "\nNext steps:\n1. Review generated MDX files in app/content/\n2. Review downloaded images in app/public/content/\n3. Fix any YAML formatting issues manually if needed"
  );
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
