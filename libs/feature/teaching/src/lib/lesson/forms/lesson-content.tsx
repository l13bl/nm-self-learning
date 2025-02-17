import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { LessonContent, LessonContentType, ValueByContentType } from "@self-learning/types";
import { RemovableTab, SectionHeader, Tabs } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { Reorder } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { ArticleInput } from "../content-types/article";
import { VideoInput } from "../content-types/video";

export type SetValueFn = <CType extends LessonContentType["type"]>(
	type: CType,
	value: ValueByContentType<CType> | undefined,
	index: number
) => void;

function useContentTypeUsage(content: LessonContent) {
	const typesWithUsage = useMemo(() => {
		const allTypes: { [contentType in LessonContentType["type"]]: boolean } = {
			video: false,
			article: false
		};

		for (const c of content) {
			allTypes[c.type] = true;
		}

		return allTypes;
	}, [content]);

	return typesWithUsage;
}

export function useLessonContentEditor(control: Control<{ content: LessonContent }>) {
	const {
		append,
		remove,
		replace: setContent,
		fields: content
	} = useFieldArray<{ content: LessonContent }>({
		name: "content",
		control
	});

	const [contentTabIndex, setContentTabIndex] = useState<number | undefined>(
		content.length > 0 ? 0 : undefined
	);

	useEffect(() => {
		if (content.length === 0) {
			setContentTabIndex(undefined);
		}

		if (contentTabIndex && contentTabIndex >= content.length) {
			setContentTabIndex(content.length > 0 ? 0 : undefined);
		}
	}, [contentTabIndex, content]);

	const typesWithUsage = useContentTypeUsage(content);

	function addContent(type: LessonContentType["type"]) {
		if (type === "article") {
			append({ type: "article", value: { content: "" }, meta: { estimatedDuration: 0 } });
		}

		if (type === "video") {
			append({ type: "video", value: { url: "" }, meta: { duration: 0 } });
		}

		setContentTabIndex(content.length);
	}

	const removeContent = useCallback(
		(index: number) => {
			const confirmed = window.confirm("Inhalt entfernen ?");

			if (confirmed) {
				remove(index);
			}
		},
		[remove]
	);

	return {
		content,
		addContent,
		removeContent,
		setContent,
		contentTabIndex,
		typesWithUsage,
		setContentTabIndex
	};
}

export function LessonContentEditor() {
	const { control } = useFormContext<{ content: LessonContent }>();
	const {
		content,
		addContent,
		removeContent,
		setContent,
		contentTabIndex,
		setContentTabIndex,
		typesWithUsage
	} = useLessonContentEditor(control);

	return (
		<section>
			<CenteredContainer className="mb-4 flex flex-col">
				<SectionHeader
					title="Inhalt"
					subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente
					angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt
					werden soll."
				/>

				<div className="flex gap-4 text-sm">
					<button
						type="button"
						className="btn-primary w-fit"
						onClick={() => addContent("video")}
						disabled={typesWithUsage["video"]}
					>
						<VideoCameraIcon className="h-5" />
						<span>Video hinzufügen</span>
					</button>

					<button
						type="button"
						className="btn-primary w-fit"
						onClick={() => addContent("article")}
						disabled={typesWithUsage["article"]}
					>
						<DocumentTextIcon className="h-5" />
						<span>Artikel hinzufügen</span>
					</button>
				</div>

				<div className="mt-8 flex gap-4">
					{content.length > 0 && (
						<Reorder.Group
							className="w-full"
							axis="x"
							values={content}
							onReorder={setContent}
						>
							<Tabs selectedIndex={contentTabIndex} onChange={setContentTabIndex}>
								{content.map((value, index) => (
									<Reorder.Item as="div" key={value.id} value={value}>
										<RemovableTab onRemove={() => removeContent(index)}>
											{value.type}
										</RemovableTab>
									</Reorder.Item>
								))}
							</Tabs>
						</Reorder.Group>
					)}
				</div>
			</CenteredContainer>

			{contentTabIndex !== undefined && content[contentTabIndex] ? (
				<RenderContentType
					index={contentTabIndex}
					content={content[contentTabIndex]}
					onRemove={removeContent}
				/>
			) : (
				<CenteredContainer>
					<div className="rounded-lg border border-light-border bg-white py-80 text-center text-light">
						Diese Lerneinheit hat noch keinen Inhalt.
					</div>
				</CenteredContainer>
			)}
		</section>
	);
}

function RenderContentType({
	index,
	content,
	onRemove
}: {
	index: number;
	content: LessonContentType;
	onRemove: (index: number) => void;
}) {
	if (content.type === "video") {
		return <VideoInput index={index} />;
	}

	if (content.type === "article") {
		return <ArticleInput index={index} />;
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}
