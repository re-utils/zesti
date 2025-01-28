import Link from "next/link";
import fs from "node:fs/promises";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Card, Cards } from "fumadocs-ui/components/card";
import { buttonVariants, cn } from "fumadocs-ui/components/api";

import { Library } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

export default async function HomePage() {
  const code = (await fs.readFile("./data/demo.ts", "utf8")).trim();

  return (
    <section className="container relative mt-16 mb-12 grid grid-cols-1 items-center justify-center gap-8 xl:h-[min(470px,calc(75vh))] xl:grid-cols-2 xl:flex-row">
      <aside className="my-8 flex flex-col items-center self-center xl:flex-1 xl:items-center">
        <h1 className="text-3xl md:text-4xl font-bold">Zesti</h1>

        <p className="my-8 text-center text-xl font-light">
          The modern, optimized web framework.
          <br />
          Support all JavaScript runtimes.
        </p>

        <nav className="flex flex-wrap gap-4">
          <Link
            href="/docs"
            className={cn(
              buttonVariants({
                size: "sm",
              }),
              "text-md w-full rounded-full sm:w-auto px-4 py-2",
            )}
          >
            <Library className="mr-2 inline-block" size={20} />
            Docs
          </Link>

          <a
            href="https://github.com/re-utils/zesti"
            className={cn(
              buttonVariants({
                size: "sm",
                color: "secondary",
              }),
              "text-md w-full rounded-full sm:w-auto px-4 py-2",
            )}
          >
            <SiGithub className="mr-2 inline-block" size={20} />
            GitHub
          </a>
        </nav>
      </aside>

      <aside className="relative my-4 xl:my-auto xl:flex-1 xl:pt-4">
        <div className="max-w-[450px] ml-auto mr-auto">
          <DynamicCodeBlock lang="ts" code={code} />
        </div>
      </aside>
    </section>
  );
}
