import Spacer from "@/components/util/Spacer";
import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <Spacer />
      <div className="u-container flex items-center flex-col gap-3">
        <h1 className="u-text-style-h4 flex flex-col items-center">
          Page not found
        </h1>
        <Link href="/" className="btn-main-wrap is-primary">
          Return Home
        </Link>
      </div>
      <Spacer />
    </section>
  );
}
