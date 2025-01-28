import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SiDiscord, SiGithub, SiNpm } from "@icons-pack/react-simple-icons";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Zesti",
  },
  links: [
    {
      text: "Docs",
      url: "/docs",
      active: "nested-url",
    },
    {
      type: "icon",
      url: "https://github.com/re-utils/zesti",
      text: "Github",
      icon: <SiGithub />,
      external: true,
    },
    {
      type: "icon",
      url: "https://www.npmjs.com/package/zesti",
      text: "npm",
      icon: <SiNpm />,
      external: true,
    },
    {
      type: "icon",
      url: "https://discord.gg/eUFHe33Pre",
      text: "Discord",
      icon: <SiDiscord />,
      external: true,
    },
  ],
};
