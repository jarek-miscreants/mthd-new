import { getContent } from "@/lib/content";

export interface NavigationPrototypeLink {
  label: string;
  href: string;
  target?: "_self" | "_blank";
}

export interface NavigationPrototypeGroup {
  label: string;
  links: NavigationPrototypeLink[];
}

export interface NavigationPrototypeMenu {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  groups: NavigationPrototypeGroup[];
  details?: NavigationPrototypeGroup[];
}

export interface NavigationPrototypeDirectLink extends NavigationPrototypeLink {
  id: string;
}

export type NavigationPrototypeItem = NavigationPrototypeMenu | NavigationPrototypeDirectLink;

export interface NavigationPrototypeData {
  background: string;
  homeLabel: string;
  mobile: {
    openLabel: string;
    closeLabel: string;
    backLabel: string;
    homeLabel: string;
  };
  primary: NavigationPrototypeItem[];
  company: NavigationPrototypeMenu;
}

export function getNavigationPrototype() {
  return getContent<NavigationPrototypeData>("settings/navigation-prototype");
}
