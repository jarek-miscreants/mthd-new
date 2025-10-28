import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/frame/Header";
import Footer from "@/components/frame/Footer";
import Lenis from "@/components/util/Lenis";
import ThemeHandler from "@/components/util/ThemeHandler";
import GlobalEyebrowInteraction from "@/components/elements/EyebrowInteraction";
import { getNavigationData } from "@/lib/navigation";
import { client } from "@/lib/sanity";
import { siteSettingsQuery } from "@/lib/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    const settings = await client.fetch<{
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
    }>(siteSettingsQuery);

    const imageWidth = settings?.socialLinkPreviewImageMetadata?.dimensions?.width;
    const imageHeight = settings?.socialLinkPreviewImageMetadata?.dimensions?.height;

    return {
        openGraph: {
            type: "website",
            title: settings?.socialLinkPreviewTitle,
            description: settings?.socialLinkPreviewDescription,
            url: settings?.socialLinkPreviewUrl,
            images: settings?.socialLinkPreviewImageUrl
                ? [
                      {
                          url: settings.socialLinkPreviewImageUrl,
                          width: imageWidth,
                          height: imageHeight,
                      },
                  ]
                : [],
        },
        twitter: {
            card: "summary_large_image",
            title: settings?.socialLinkPreviewTitle,
            description: settings?.socialLinkPreviewDescription,
            images: settings?.socialLinkPreviewImageUrl ? [settings.socialLinkPreviewImageUrl] : [],
        },
    };
}

const untitledSans = localFont({
    variable: "--font-untitled-sans",
    src: [
        {
            path: "./fonts/UntitledSans/UntitledSans-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/UntitledSans/UntitledSans-RegularItalic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/UntitledSans/UntitledSans-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/UntitledSans/UntitledSans-MediumItalic.woff2",
            weight: "500",
            style: "italic",
        },
    ],
});

const romMono = localFont({
    variable: "--font-rom-mono",
    src: [
        {
            path: "./fonts/RomMono/RomMono-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/RomMono/RomMono-RegularItalic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/RomMono/RomMono-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/RomMono/RomMono-MediumItalic.woff2",
            weight: "500",
            style: "italic",
        },
        {
            path: "./fonts/RomMono/RomMono-Bold.woff2",
            weight: "700",
            style: "italic",
        },
        {
            path: "./fonts/RomMono/RomMono-BoldItalic.woff2",
            weight: "700",
            style: "italic",
        },
    ],
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const {
        headerNavItems,
        footerNavGroups,
        footerName,
        footerTagline,
        copyrightTag,
        footerCtas,
        productLinks,
        legalLinks,
        mobileMenuCards,
    } = await getNavigationData();

    return (
        <html lang="en">
            <body data-theme="" className={`${untitledSans.variable} ${romMono.variable} antialiased`}>
                <ThemeHandler />
                {/* Global interactions */}
                <GlobalEyebrowInteraction />
                {/* Global interactions */}
                <Lenis>
                    <Header navItems={headerNavItems} mobileMenuCards={mobileMenuCards} />
                    <main>{children}</main>
                    <Footer
                        name={footerName}
                        tagline={footerTagline}
                        ctas={footerCtas}
                        copyrightTag={copyrightTag}
                        footerNavGroups={footerNavGroups}
                        productLinks={productLinks}
                        legalLinks={legalLinks}
                    />
                </Lenis>
                <Analytics />
            </body>
        </html>
    );
}
