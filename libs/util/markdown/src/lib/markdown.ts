import { serialize } from "next-mdx-remote/serialize";

// Remark packages
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
// Rehype packages
import rehypeKatex from "rehype-katex";
import rehypeCitation from "rehype-citation";
import rehypePrismPlus from "rehype-prism-plus";
import rehypePresetMinify from "rehype-preset-minify";

/**
 * Converts a markdown document to an object that can be rendered in a {@link MDXRemote} component.
 * The given markdown string should not include front matter.
 *
 * @example
 * // i.e. in getStaticProps:
 * ```ts
 * const compiledMarkdown = compileMarkdown("#Hello World");
 * ```
 *
 * // In component:
 * ```tsx
 * <MDXRemote {...compiledMarkdown}></MDXRemote>
 * ```
 *
 */
export function compileMarkdown(markdown: string) {
	return serialize(markdown, {
		parseFrontmatter: true,
		mdxOptions: {
			format: "md",
			remarkPlugins: [remarkGfm, remarkMath],
			rehypePlugins: [rehypeKatex, rehypeCitation, rehypePrismPlus, rehypePresetMinify]
		}
	});
}

/**
 * Return type of the {@link compileMarkdown} function.
 * @example
 * type PageProps = {
 * 	markdownContent: CompiledMarkdown;
 * }
 *
 * export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
 * 	const markdownContent = await compileMarkdown(team.description);
 * 	return {
 * 		props: { markdownContent }
 * 	};
 * };
 */
export type CompiledMarkdown = Awaited<ReturnType<typeof compileMarkdown>>;

export type MdLookup = { [id: string]: CompiledMarkdown };
export type MdLookupArray = { [id: string]: CompiledMarkdown[] };
