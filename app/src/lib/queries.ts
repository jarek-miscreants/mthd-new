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

// All Products Query (for homepage ProductHighlight section)
export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt asc) {
    _id,
    name,
    nameAddition,
    "slug": slug.current,
    "productSymbolUrl": productSymbol.asset->url,
    highlight
  }
`;

// Products Overview Query (for /products page)
export const productsOverviewQuery = groq`
  *[_type == "product"] | order(_createdAt asc) {
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

// Site Settings Query
export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    headerNavItems,
    footerNavGroups,
    footerName,
    footerTagline,
    copyrightTag,
    footerCtas
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
