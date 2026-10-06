import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer | Method Security",
  alternates: { canonical: "/developer" },
};

export default function DeveloperPage() {
  return (
    <section className="bg-theme-bg text-theme-text min-h-[70vh] pt-[160px] pb-main">
      <div className="u-container">
        <h1 className="text-h1">Developer</h1>
      </div>
    </section>
  );
}
