import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import PlatformExplorer, { type PlatformExplorerData } from "@/components/platform/PlatformExplorer";

export const metadata: Metadata = { title: "Platform Preview | Method Security", robots: { index: false, follow: false } };

export default async function PlatformNewPage() {
  const data = await getContent<PlatformExplorerData>("pages/platform-new");
  return <PlatformExplorer data={data} />;
}
