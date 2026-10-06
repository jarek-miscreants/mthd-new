import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Missions | Method Security",
  alternates: { canonical: "/missions" },
};

export default function MissionsPage() {
  return (
    <section className="bg-theme-bg text-theme-text min-h-[70vh] pt-[160px] pb-main">
      <div className="u-container">
        <h1 className="text-h1">Missions</h1>
      </div>
    </section>
  );
}
