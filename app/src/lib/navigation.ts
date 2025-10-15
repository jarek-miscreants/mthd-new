import { client } from "@/lib/sanity";
import {
  siteSettingsQuery,
  allProductsQuery,
  allLegalPagesQuery,
} from "@/lib/queries";

interface SanityProduct {
  productSymbolUrl: string;
  name: string;
  slug: string;
}

interface FooterNavLink {
  label: string;
  href: string;
  target?: "_self" | "_blank";
}

interface FooterNavGroup {
  groupLabel: string;
  links: FooterNavLink[];
}

interface HeaderDropdownItem {
  productSymbol?: string;
  label: string;
  href: string;
  target?: "_self" | "_blank";
  arrowIndicator?: boolean;
}

interface HeaderNavItem {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  btnStyle?: boolean;
  dropdown?: HeaderDropdownItem[];
}

interface SanitySettings {
  headerNavItems?: HeaderNavItem[];
  footerNavGroups?: FooterNavGroup[];
  footerName?: string;
  footerTagline?: string;
  copyrightTag?: string;
  footerCtas?: { label: string; href: string; target?: "_self" | "_blank" }[];
  mobileMenuCards?: Array<{
    eyebrow: string;
    title: string;
    href: string;
    target?: "_self" | "_blank";
  }>;
}

interface LegalPage {
  title: string;
  slug: string;
}

export async function getNavigationData() {
  const [settings, products, legalPages] = await Promise.all([
    client.fetch<SanitySettings>(siteSettingsQuery),
    client.fetch<SanityProduct[]>(allProductsQuery),
    client.fetch<LegalPage[]>(allLegalPagesQuery),
  ]);

  const headerNavItems = [
    {
      label: "Products",
      href: "/products",
      dropdown: products.map((product: SanityProduct) => ({
        productSymbol: product.productSymbolUrl,
        label: product.name,
        href: `/products/${product.slug}`,
      })),
    },
    ...(settings?.headerNavItems || []),
  ];

  const productLinks: FooterNavLink[] = products.map(
    (product: SanityProduct) => ({
      label: product.name,
      href: `/products/${product.slug}`,
    }),
  );

  const legalLinks: FooterNavLink[] = legalPages.map((lp) => ({
    label: lp.title,
    href: `/legal/${lp.slug}`,
  }));

  return {
    headerNavItems,
    footerNavGroups: settings?.footerNavGroups || [],
    footerName: settings?.footerName || "",
    footerTagline: settings?.footerTagline || "",
    copyrightTag: settings?.copyrightTag || "",
    footerCtas: settings?.footerCtas || [],
    mobileMenuCards: settings?.mobileMenuCards || [],
    productLinks,
    legalLinks,
  };
}
