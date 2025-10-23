import { groq } from "next-sanity";

//SEO Query
export const seoProjection = groq`
  seo{
    title,
    description,
    ogTitle,
    ogDescription,
    "ogImage": { "url": ogImage.asset->url }
  }
`;

// Home Page Query
export const homePageQuery = groq`
  *[_type == "homePage" && _id == "homePage"][0] {
    title,
    hero,
    mission,
    architecture,
    deploy,
    cards,
    ${seoProjection}
  }
`;

// All Products Query (for homepage ProductHighlight section); only products with a symbol uploaded will be displayed
export const allProductsQuery = groq`
  *[_type == "product" && defined(productSymbol.asset)] | order(_createdAt asc) {
    _id,
    name,
    nameAddition,
    "slug": slug.current,
    "productSymbolUrl": productSymbol.asset->url,
    highlight
  }
`;

// Products Overview Query (for /products page); only products with a symbol uploaded will be displayed
export const productsOverviewQuery = groq`
  *[_type == "product" && defined(productSymbol.asset)] | order(_createdAt asc) {
    _id,
    name,
    nameAddition,
    "slug": slug.current,
    "productSymbolUrl": productSymbol.asset->url,
    highlight {
          leadParagraph
        }
  }
`;

// Products Overview Page Query
export const productsOverviewPageQuery = groq`
  *[_type == "productsOverviewPage" && _id == "productsOverviewPage"][0] {
    title,
    cards,
    ${seoProjection}
  }
`;

// Single Product Query
export const productQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    name,
    nameAddition,
    "productSymbolUrl": productSymbol.asset->url,
    hero,
    tagline,
    solutions,
    cards,
    ${seoProjection}
  }
`;

// Company Page Query
export const companyPageQuery = groq`
  *[_type == "companyPage" && _id == "companyPage"][0] {
    title,
    highlightTexts,
    cards,
    ${seoProjection}
  }
`;

// Contact Page Query
export const contactPageQuery = groq`
  *[_type == "contactPage" && _id == "contactPage"][0] {
    title,
    eyebrow,
    text,
    cards,
    ${seoProjection}
  }
`;

// Careers Page Query
export const careersPageQuery = groq`
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
    ${seoProjection}
  }
`;

// Site Settings Query
export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    headerNavItems,
    footerNavGroups,
    footerName,
    footerTagline,
    copyrightTag,
    footerCtas,
    mobileMenuCards
  }
`;

// All Product Slugs
export const allProductSlugsQuery = groq`
  *[_type == "product"]{"slug": slug.current}
`;

// All Legal Slugs
export const allLegalSlugsQuery = groq`
  *[_type == "legalPage"]{"slug": slug.current}
`;

// All Legal Pages
export const allLegalPagesQuery = groq`
  *[_type == "legalPage"] | order(title asc) {
    title,
    "slug": slug.current
  }
`;

// Single Legal Page
export const legalPageQuery = groq`
  *[_type == "legalPage" && slug.current == $slug][0] {
    title,
    eyebrow,
    body,
    ${seoProjection}
  }
`;

// All Blog Posts Query
export const allBlogPostsQuery = groq`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "author": author->{
      name,
      "slug": slug.current,
      role,
      company,
      "avatarUrl": avatar.asset->url
    },
    publishedAt,
    category,
    "featuredImageUrl": featuredImage.asset->url,
    "featuredImageAlt": featuredImage.alt,
    "estimatedReadingTime": select(
      round(length(pt::text(body)) / 5 / 180) >= 1 => round(length(pt::text(body)) / 5 / 180),
      1
    )
  }
`;

// Single Blog Post Query
export const blogPostQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    excerpt,
    "author": author->{
      name,
      "slug": slug.current,
      bio,
      role,
      company,
      "avatarUrl": avatar.asset->url,
      socialLinks
    },
    publishedAt,
    category,
    "featuredImageUrl": featuredImage.asset->url,
    "featuredImageAlt": featuredImage.alt,
    "estimatedReadingTime": select(
      round(length(pt::text(body)) / 5 / 180) >= 1 => round(length(pt::text(body)) / 5 / 180),
      1
    ),
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
    ${seoProjection}
  }
`;

// All Blog Post Slugs
export const allBlogPostSlugsQuery = groq`
  *[_type == "blogPost"]{"slug": slug.current}
`;

// Blog Page Query
export const blogPageQuery = groq`
  *[_type == "blogPage" && _id == "blogPage"][0] {
    title,
    description,
    eyebrow,
    subscribeButtonText,
    subscribeButtonLink,
    ${seoProjection}
  }
`;

// All Blog Authors Query
export const allBlogAuthorsQuery = groq`
  *[_type == "blogAuthor"] | order(name asc) {
    name,
    "slug": slug.current,
    bio,
    role,
    company,
    "avatarUrl": avatar.asset->url,
    socialLinks
  }
`;

// Single Blog Author Query
export const blogAuthorQuery = groq`
  *[_type == "blogAuthor" && slug.current == $slug][0] {
    name,
    "slug": slug.current,
    bio,
    role,
    company,
    "avatarUrl": avatar.asset->url,
    socialLinks
  }
`;
