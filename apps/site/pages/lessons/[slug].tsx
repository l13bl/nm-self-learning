import { cmsTypes, getNanomoduleBySlug } from "@self-learning/cms-api";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

type Nanomodule = Exclude<Awaited<ReturnType<typeof getNanomoduleBySlug>>, null | undefined>;

type NanomoduleProps = {
	nanomodule: Nanomodule;
};

export const getStaticProps: GetStaticProps<NanomoduleProps> = async ({ params }) => {
	const slug = params?.slug as string;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	const nanomodule = (await getNanomoduleBySlug(slug)) as Nanomodule;

	return {
		props: { nanomodule },
		revalidate: 60,
		notFound: !nanomodule
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

export default function Nanomodule({ nanomodule }: NanomoduleProps) {
	const { title, subtitle, description } = nanomodule;
	const imgUrl = `http://localhost:1337${nanomodule.image?.data?.attributes?.url}`;
	const imgAlt = nanomodule.image?.data?.attributes?.alternativeText ?? "";

	console.log(nanomodule);

	const { url } = nanomodule.content[0] as cmsTypes.ComponentNanomoduleYoutubeVideo;

	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>
			<div className="mx-auto flex flex-col py-16 px-2 md:px-0 lg:max-w-screen-lg">
				<div className="flex flex-col gap-8">
					<h1 className="text-5xl">{title}</h1>
					{subtitle && <span className="text-2xl tracking-tight">{subtitle}</span>}
					<div className="flex flex-col">
						{nanomodule.authors?.data.map(author => (
							<div key={author.attributes?.slug} className="flex items-center gap-2">
								<Image
									className="rounded-full"
									height="36"
									width="36"
									src={
										`http://localhost:1337${author.attributes?.image?.data?.attributes?.url}` ??
										""
									}
									alt={
										author.attributes?.image?.data?.attributes
											?.alternativeText ?? ""
									}
								></Image>
								<Link href={`/authors/${author.attributes?.slug}`}>
									<a className="hover:underline">{author.attributes?.name}</a>
								</Link>
							</div>
						))}
					</div>
					{description && <span className="">{description}</span>}
					<div className="h-[728px] w-full">{url && <YoutubeEmbed url={url} />}</div>
				</div>
			</div>
		</>
	);
}

function YoutubeEmbed({ url }: { url: string }) {
	const videoId = useMemo(() => url.match(/\?v=(.+)$/)?.at(1), [url]);

	return (
		<iframe
			height="100%"
			width="100%"
			src={`https://www.youtube-nocookie.com//embed/${videoId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
	);
}

// function VideoPlayer({ url }: { url: string}) {
// 	<video controls src={url} type={}></video>;
// }

// export function NanomoduleDynamicZone(content: NanomoduleContentDynamicZone) {
// 	if (content.__typename === "ComponentNanomoduleYoutubeVideo") {
// 		return <YoutubeEmbed url={content.url as string} />;
// 	}

// 	if (content.__typename === "ComponentNanomoduleVideo") {
// 		return
// 	}
// }
