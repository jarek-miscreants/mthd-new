import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform | Method Security",
  alternates: { canonical: "/platform" },
};

export default function PlatformPage() {
  return (
    <section className="bg-theme-bg text-theme-text min-h-[70vh] pt-[160px] pb-main">
      <div className="u-container">
        <h1 className="text-h1">Platform</h1>
      </div>
    </section>
  );
}
