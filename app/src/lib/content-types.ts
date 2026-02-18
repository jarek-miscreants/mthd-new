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
}

// Products Overview Page
export interface ProductsOverviewPageData {
  title?: string;
  cards?: CardData[];
  seo?: SeoData;
}

// About Page
export interface AboutPageData {
  title?: string;
  highlightTexts?: Array<{ eyebrow: string; text: string }>;
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
  mainImage?: {
    src: string;
    alt: string;
    aspectRatio?: number | null;
    cutAngle?: number | null;
  };
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

// Blog Page settings
export interface BlogPageData {
  title?: string;
  description?: string;
  eyebrow?: string;
  subscribeButtonText?: string;
  subscribeButtonLink?: string;
  seo?: SeoData;
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
