import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import "./globals.css";
import GraphiteHeader from "@/components/frame/GraphiteHeader";
import GraphiteFooter, { type FooterPrototypeData } from "@/components/frame/GraphiteFooter";
import { getContent } from "@/lib/content";
import Lenis from "@/components/util/Lenis";
import ThemeHandler from "@/components/util/ThemeHandler";
import GlobalEyebrowInteraction from "@/components/elements/EyebrowInteraction";
import type { Metadata } from "next";
import { getNavigationData } from "@/lib/navigation";
import { getNavigationPrototype } from "@/lib/navigation-prototype";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://method.security"),
};

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
    const [navigationData, navigationPrototype, footerContact] = await Promise.all([
        getNavigationData(),
        getNavigationPrototype(),
        getContent<FooterPrototypeData>("settings/footer-prototype"),
    ]);
    const { copyrightTag } = navigationData;

    return (
        <html lang="en">
            <body data-theme="" className={`${untitledSans.variable} ${romMono.variable} antialiased`}>
                <ThemeHandler />
                {/* Global interactions */}
                <GlobalEyebrowInteraction />
                {/* Global interactions */}
                <Lenis>
                    <GraphiteHeader data={navigationPrototype} />
                    <main>{children}</main>
                    <GraphiteFooter copyrightTag={copyrightTag} data={footerContact} />
                </Lenis>
                <Analytics />
            </body>
        </html>
    );
}
