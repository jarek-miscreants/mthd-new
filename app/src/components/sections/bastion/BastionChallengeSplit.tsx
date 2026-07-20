"use client";

import { useState } from "react";
import Image from "next/image";
import BastionChallengeTabs, { type ChallengeTab } from "./BastionChallengeTabs";

/**
 * Bastion "Challenge every asset" — two-column split (Figma 471:17367).
 *
 * Owns the active tab index shared by the accordion (left) and the console
 * image panel (right): all feature images are stacked with `fill` and the
 * active one crossfades in as tabs are clicked.
 */

export default function BastionChallengeSplit({
  items,
}: {
  items: ChallengeTab[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-main d:grid d:grid-cols-12 d:gap-4">
      {/* Feature accordion tabs */}
      <div className="d:col-span-5">
        <BastionChallengeTabs items={items} active={active} onSelect={setActive} />
      </div>

      {/* Bastion console image, crossfading with the active tab. The panel
          keeps the images' native 3:2 aspect so object-cover never crops. */}
      <div className="relative aspect-[3/2] overflow-hidden rounded-main d:col-span-7">
        {items.map(
          (item, i) =>
            item.image && (
              <Image
                key={item.title}
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 62rem) 56vw, 100vw"
                className={`object-cover transition-opacity duration-500 ease-out ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ),
        )}
      </div>
    </div>
  );
}
