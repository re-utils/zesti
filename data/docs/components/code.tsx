import type { BundledLanguage } from "shiki/bundle/web";
import { codeToHtml } from "shiki/bundle/web";

import {
  type CodeBlockProps,
  CodeBlock,
  Pre,
} from "fumadocs-ui/components/codeblock";

export async function highlight(code: string, lang: BundledLanguage) {
  return codeToHtml(code, {
    themes: {
      light: "catppuccin-latte",
      dark: "catppuccin-mocha",
    },
    mergeWhitespaces: true,
    defaultColor: false,
    lang,
  });
}

export interface CodeProps {
  code: string;
  lang: BundledLanguage;
}

export default async function Code(props: CodeProps) {
  const code = (await highlight(props.code.trim(), props.lang)).replace(
    /<span class="line">(.*)<\/span>/g,
    (_, b) => (b === "" ? "<span> </span>" : `<span>${b}</span>`),
  );

  return (
    <CodeBlock allowCopy>
      <Pre dangerouslySetInnerHTML={{ __html: code }} />
    </CodeBlock>
  );
}
