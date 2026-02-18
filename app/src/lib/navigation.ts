import { getContent, getCollection } from "@/lib/content";
import type { SiteSettingsData, ProductData, LegalPageData } from "@/lib/content-types";

interface FooterNavLink {
  label: string;
  href: string;
  target?: "_self" | "_blank";
}

export async function getNavigationData() {
  const [settings, productEntries, legalEntries] = await Promise.all([
    getContent<SiteSettingsData>("settings/site"),
    getCollection<ProductData>("products"),
    getCollection<LegalPageData>("legal"),
  ]);

  // Sort products by sortOrder
  const sortedProducts = productEntries.sort(
    (a, b) => (a.frontmatter.sortOrder ?? 99) - (b.frontmatter.sortOrder ?? 99)
  );

  const headerNavItems = [
    {
      label: "Products",
      href: "/products",
      dropdown: sortedProducts.map((p) => ({
        productSymbol: p.frontmatter.productSymbolUrl,
        label: p.frontmatter.name,
        href: `/products/${p.slug}`,
      })),
    },
    ...(settings?.headerNavItems || []),
  ];

  const productLinks: FooterNavLink[] = sortedProducts.map((p) => ({
    label: p.frontmatter.name,
    href: `/products/${p.slug}`,
  }));

  const legalLinks: FooterNavLink[] = legalEntries.map((l) => ({
    label: l.frontmatter.title,
    href: `/legal/${l.slug}`,
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
