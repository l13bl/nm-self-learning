import { Prisma } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useRef } from "react";

type EditCourseProps = {
	course: CourseFormModel;
	lessons: { title: string; lessonId: string; slug: string; meta: Prisma.JsonValue }[];
};

export const getServerSideProps: GetServerSideProps<EditCourseProps> = async ({ params }) => {
	const courseId = params?.courseId as string;

	const course = await database.course.findUnique({
		where: { courseId },
		include: {
			authors: {
				select: {
					slug: true
				}
			},
			subject: {
				select: {
					subjectId: true,
					title: true
				}
			}
		}
	});

	if (!course) {
		return {
			notFound: true
		};
	}

	const content = course.content as CourseContent;

	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			title: true,
			slug: true,
			lessonId: true,
			meta: true
		}
	});

	const lessonsById = new Map<string, typeof lessons[0]>();

	for (const lesson of lessons) {
		lessonsById.set(lesson.lessonId, lesson);
	}

	const courseFormModel: CourseFormModel = {
		title: course.title,
		courseId: course.courseId,
		description: course.description,
		subtitle: course.subtitle,
		imgUrl: course.imgUrl,
		slug: course.slug,
		subjectId: course.subject?.subjectId ?? null,
		authors: course.authors.map(author => ({ slug: author.slug })),
		content: content
	};

	return {
		notFound: !course,
		props: { course: courseFormModel, lessons }
	};
};

export default function EditCoursePage({ course, lessons }: EditCourseProps) {
	const { mutateAsync: updateCourse } = trpc.course.edit.useMutation();
	const router = useRouter();
	const trpcContext = trpc.useContext();
	const isInitialRender = useRef(true);

	if (isInitialRender.current) {
		isInitialRender.current = false;

		// Populate query cache with existing lessons
		// This way, we only need to fetch newly added lessons
		for (const lesson of lessons) {
			trpcContext.lesson.findOne.setData(lesson, { lessonId: lesson.lessonId });
		}
	}

	function onConfirm(updatedCourse: CourseFormModel) {
		async function update() {
			try {
				const { title } = await updateCourse({
					courseId: course.courseId as string,
					course: updatedCourse
				});
				showToast({ type: "success", title: "Änderung gespeichert!", subtitle: title });
				router.replace(router.asPath, undefined, { scroll: false });
				// next.js quit page reload
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}
		update();
	}

	return <CourseEditor course={course} onConfirm={onConfirm} />;
}
