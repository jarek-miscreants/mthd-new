// Shared SEO type used across all pages
export interface SeoData {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
}

// Card used across multiple pages
export interface CardData {
  eyebrow: string;
  title: string;
  href: string;
  target?: "_self" | "_blank";
}

// Home Page
export interface HomePageData {
  title?: string;
  hero?: {
    videoSrc?: string;
    videoSrcMobile?: string;
  };
  mission?: {
    eyebrow?: string;
    title?: string;
    leadParagraph?: string;
  };
  partners?: {
    eyebrow?: string;
    logos?: Array<{
      src: string;
      alt: string;
    }>;
  };
  architecture?: {
    eyebrow?: string;
    title?: string;
    items?: Array<{
      title: string;
      subtext: string;
    }>;
  };
  deploy?: {
    eyebrow?: string;
    title?: string;
    leadParagraph?: string;
    videoSrc?: string;
    items?: Array<{
      indexDeco: string;
      title: string;
      text?: string;
    }>;
    deployCTATitle?: string;
    deployCTAButtonText?: string;
    deployCTALink?: string;
  };
  cards?: CardData[];
  seo?: SeoData;
}

// Product (used for both collection and single product)
export interface ProductData {
  name: string;
  description: string;
  slug?: string; // derived from filename
  sortOrder?: number;
  productSymbolUrl?: string;
  hero?: {
    videoSrc?: string;
    videoSrcMobile?: string;
  };
  tagline?: {
    eyebrow?: string;
    text?: string;
  };
  highlight?: {
    eyebrow?: string;
    title?: string;
    leadParagraph?: string;
    showcaseSrc?: string;
  };
  solutions?: {
    eyebrow?: string;
    items?: Array<{
      eyebrow: string;
      title: string;
      text: string;
      mediaSrc: string;
    }>;
  };
  cta?: {
    ctaTitle?: string;
    ctaButtonText?: string;
    ctaLink?: string;
  };
  cards?: CardData[];
  seo?: SeoData;
  /** Bespoke /products/reaper page copy (see ReaperPageData). */
  reaperPage?: ReaperPageData;
  /** Bespoke /products/bastion page copy (see BastionPageData). */
  bastionPage?: BastionPageData;
}

/**
 * All editorial copy for the bespoke /products/reaper page, sourced from the
 * `reaperPage:` block in content/products/reaper.mdx. Written there in page
 * order as the single source of truth the client edits; section components
 * receive their slice as props.
 *
 * NOTE (by-index coupling): the `howItWorks.tabs[].secondary` lists (agent
 * types / rules / hosts) are rendered as tab labels AND consumed *by index* by
 * the in-code SVG vizzes (ReaperAgentsViz / ReaperRulesViz / ReaperScaleViz).
 * The viz arrays stay in code — keep the YAML order in sync with them.
 * Text rendered inside the SVGs is intentionally NOT in here.
 */
export interface ReaperPageData {
  hero?: {
    title?: string;
    tagline?: string;
    tabs?: { label?: string; video?: string; poster?: string }[];
  };
  intro?: {
    paragraph?: string;
  };
  howItWorks?: {
    heading?: string;
    body?: string;
    tabs?: Array<{
      n: string;
      title: string;
      desc: string;
      secondaryEyebrow: string;
      secondary: string[];
    }>;
  };
  toolkit?: {
    heading?: string;
    body?: string | string[];
    tabs?: Array<{
      label: string;
      items: Array<{ title: string; desc: string }>;
    }>;
  };
  useCases?: {
    heading?: string;
    intro?: string;
    items?: Array<{ title: string; desc: string }>;
  };
  byot?: {
    heading?: string;
    body?: string;
    items?: Array<{ title: string; desc: string; comingSoon?: boolean }>;
  };
  frontier?: {
    heading?: string;
    body?: string;
    buttonLabel?: string;
    layers?: Array<{ title: string; meta: string }>;
  };
  cta?: {
    title?: string;
    tagline?: string;
    onboarding?: string;
    buttons?: Array<{ label: string; href: string }>;
  };
}

/**
 * All editorial copy for the bespoke /products/bastion page, sourced from the
 * `bastionPage:` block in content/products/bastion.mdx. Same pattern as
 * ReaperPageData: written there in page order as the single source of truth
 * the client edits; each section component receives its slice as props. Text
 * rendered INSIDE the canvas vizzes / SVG animations is NOT here — it lives in
 * code (e.g. BastionServeViz DEFENSE/OFFENSE badges, BastionScaleViz labels).
 */
export interface BastionPageData {
  hero?: {
    title?: string;
    tagline?: string;
    tabs?: { label?: string; video?: string; poster?: string }[];
  };
  intro?: {
    paragraph?: string;
  };
  scale?: {
    heading?: string;
    body?: string;
    columns?: Array<{ title: string; desc: string }>;
  };
  inventory?: {
    heading?: string;
    body?: string;
    columns?: Array<{ title: string; desc: string }>;
  };
  challenge?: {
    heading?: string;
    body?: string;
    features?: Array<{ title: string; desc: string; image?: string }>;
  };
  reaper?: {
    eyebrow?: string;
    text?: string;
  };
  serve?: {
    heading?: string;
    body?: string;
    rows?: Array<{ title: string; desc: string }>;
  };
  cta?: {
    title?: string;
    tagline?: string;
    onboarding?: string;
    buttons?: Array<{ label: string; href: string }>;
  };
}

// Products Overview Page
export interface ProductsOverviewPageData {
  title?: string;
  cards?: CardData[];
  seo?: SeoData;
}

// Contact Page
export interface ContactPageData {
  title?: string;
  eyebrow?: string;
  text?: string;
  cards?: CardData[];
  seo?: SeoData;
}

// Careers Page
export interface CareersPageData {
  eyebrow?: string;
  text?: string;
  careersPageUrl?: string;
  section1Eyebrow?: string;
  section1Items?: Array<{
    title: string;
    description: string;
  }>;
  section2Eyebrow?: string;
  section2Items?: Array<{
    title: string;
    description: string;
  }>;
  mainImages?: Array<{
    src: string;
    alt: string;
    aspectRatio?: number | null;
    cutAngle?: number | null;
  }>;
  secondaryImages?: Array<{
    src: string;
    alt: string;
    aspectRatio?: number | null;
    cutAngle?: number | null;
  }>;
  seo?: SeoData;
}

// Blog Author
export interface AuthorData {
  name: string;
  slug?: string;
  bio?: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

// Blog Post (frontmatter)
export interface BlogPostData {
  title: string;
  slug?: string;
  excerpt: string;
  author: string; // slug reference to author file
  publishedAt: string;
  category: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  seo?: SeoData;
}

// Blog Post with resolved author (after joining)
export interface BlogPostWithAuthor {
  title: string;
  slug: string;
  excerpt: string;
  author: AuthorData;
  publishedAt: string;
  category: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  estimatedReadingTime?: number;
}

// Blog Page settings (also the basis for `MissionPageData` frontmatter)
export interface BlogPageData {
  title?: string;
  description?: string;
  eyebrow?: string;
  subscribeButtonText?: string;
  subscribeButtonLink?: string;
  seo?: SeoData;
}

/** Mission page: blog-style MDX frontmatter plus optional bottom cards */
export interface MissionPageData extends BlogPageData {
  cards?: CardData[];
}

// Legal Page
export interface LegalPageData {
  title: string;
  eyebrow?: string;
  seo?: SeoData;
}

// Site Settings
export interface SiteSettingsData {
  headerNavItems?: Array<{
    label: string;
    href: string;
    target?: "_self" | "_blank";
    btnStyle?: boolean;
    dropdown?: Array<{
      productSymbol?: string;
      label: string;
      href: string;
      target?: "_self" | "_blank";
      arrowIndicator?: boolean;
    }>;
  }>;
  footerNavGroups?: Array<{
    groupLabel: string;
    links: Array<{
      label: string;
      href: string;
      target?: "_self" | "_blank";
    }>;
  }>;
  footerName?: string;
  footerTagline?: string;
  copyrightTag?: string;
  footerCtas?: Array<{
    label: string;
    href: string;
    target?: "_self" | "_blank";
  }>;
  mobileMenuCards?: Array<{
    eyebrow: string;
    title: string;
    href: string;
    target?: "_self" | "_blank";
  }>;
  socialLinkPreviewTitle?: string;
  socialLinkPreviewDescription?: string;
  socialLinkPreviewUrl?: string;
  socialLinkPreviewImageUrl?: string;
  socialLinkPreviewImageMetadata?: {
    dimensions?: {
      width?: number;
      height?: number;
    };
  };
}

// Company Page
export interface CompanyPageData {
  companyItems?: Array<{
    label: string;
    href: string;
    target?: "_self" | "_blank";
  }>;
  seo?: SeoData;
}
