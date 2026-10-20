import { writable } from "svelte/store";
import courseApi, {
  type Course,
  type CourseContent,
} from "../api/courseApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export interface CoursesState {
  courses: Course[];
  course: Course | null;
  content: CourseContent | null;
  isCourse: boolean;
  isCourseAdd: boolean;
  isCourseAdded: boolean;
  isCourseChange: boolean;
  isCourseChanged: boolean;
  isCourseChangeCover: boolean;
  isCourseChangedCover: boolean;
  isCourseDelete: boolean;
  isCourseDeleted: boolean;
  isCourseDeleteAll: boolean;
  isCourseDeletedAll: boolean;
  isStudentJoin: boolean;
  isStudentJoined: boolean;
  isStudentLeave: boolean;
  isStudentLeft: boolean;
  isRatingChange: boolean;
  isRatingChanged: boolean;
  isContent: boolean;
  isContentAdd: boolean;
  isContentAdded: boolean;
  isContentChange: boolean;
  isContentChanged: boolean;
  isContentDelete: boolean;
  isContentDeleted: boolean;
  isContentStatusChange: boolean;
  isContentStatusChanged: boolean;
}

function createCoursesStore() {
  const initial: CoursesState = {
    courses: [],
    course: null,
    content: null,
    isCourse: false,
    isCourseAdd: false,
    isCourseAdded: false,
    isCourseChange: false,
    isCourseChanged: false,
    isCourseChangeCover: false,
    isCourseChangedCover: false,
    isCourseDelete: false,
    isCourseDeleted: false,
    isCourseDeleteAll: false,
    isCourseDeletedAll: false,
    isStudentJoin: false,
    isStudentJoined: false,
    isStudentLeave: false,
    isStudentLeft: false,
    isRatingChange: false,
    isRatingChanged: false,
    isContent: false,
    isContentAdd: false,
    isContentAdded: false,
    isContentChange: false,
    isContentChanged: false,
    isContentDelete: false,
    isContentDeleted: false,
    isContentStatusChange: false,
    isContentStatusChanged: false,
  };

  let currentState: CoursesState = { ...initial };
  const innerStore = writable<CoursesState>(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get courses() {
      return currentState.courses;
    },
    get course() {
      return currentState.course;
    },
    get content() {
      return currentState.content;
    },
    get isCourse() {
      return currentState.isCourse;
    },
    get isCourseAdd() {
      return currentState.isCourseAdd;
    },
    get isCourseAdded() {
      return currentState.isCourseAdded;
    },
    get isCourseChange() {
      return currentState.isCourseChange;
    },
    get isCourseChanged() {
      return currentState.isCourseChanged;
    },
    get isCourseChangeCover() {
      return currentState.isCourseChangeCover;
    },
    get isCourseChangedCover() {
      return currentState.isCourseChangedCover;
    },
    get isCourseDelete() {
      return currentState.isCourseDelete;
    },
    get isCourseDeleted() {
      return currentState.isCourseDeleted;
    },
    get isCourseDeleteAll() {
      return currentState.isCourseDeleteAll;
    },
    get isCourseDeletedAll() {
      return currentState.isCourseDeletedAll;
    },
    get isStudentJoin() {
      return currentState.isStudentJoin;
    },
    get isStudentJoined() {
      return currentState.isStudentJoined;
    },
    get isStudentLeave() {
      return currentState.isStudentLeave;
    },
    get isStudentLeft() {
      return currentState.isStudentLeft;
    },
    get isRatingChange() {
      return currentState.isRatingChange;
    },
    get isRatingChanged() {
      return currentState.isRatingChanged;
    },
    get isContent() {
      return currentState.isContent;
    },
    get isContentAdd() {
      return currentState.isContentAdd;
    },
    get isContentAdded() {
      return currentState.isContentAdded;
    },
    get isContentChange() {
      return currentState.isContentChange;
    },
    get isContentChanged() {
      return currentState.isContentChanged;
    },
    get isContentDelete() {
      return currentState.isContentDelete;
    },
    get isContentDeleted() {
      return currentState.isContentDeleted;
    },
    get isContentStatusChange() {
      return currentState.isContentStatusChange;
    },
    get isContentStatusChanged() {
      return currentState.isContentStatusChanged;
    },
    get $state() {
      return currentState;
    },
    reset(state: Partial<CoursesState> = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setCourses(courses: Course[]) {
      innerStore.update((s) => ({ ...s, courses }));
    },
    setCourse(course: Course | null) {
      innerStore.update((s) => ({ ...s, course }));
    },
    setContent(content: CourseContent | null) {
      innerStore.update((s) => ({ ...s, content }));
    },
    setIsCourse(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourse: status }));
    },
    setIsCourseAdd(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseAdd: status }));
    },
    setIsCourseAdded(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseAdded: status }));
    },
    setIsCourseChange(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChange: status }));
    },
    setIsCourseChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChanged: status }));
    },
    setIsCourseChangeCover(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChangeCover: status }));
    },
    setIsCourseChangedCover(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseChangedCover: status }));
    },
    setIsCourseDelete(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseDelete: status }));
    },
    setIsCourseDeleted(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseDeleted: status }));
    },
    setIsCourseDeleteAll(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseDeleteAll: status }));
    },
    setIsCourseDeletedAll(status: boolean) {
      innerStore.update((s) => ({ ...s, isCourseDeletedAll: status }));
    },
    setIsStudentJoin(status: boolean) {
      innerStore.update((s) => ({ ...s, isStudentJoin: status }));
    },
    setIsStudentJoined(status: boolean) {
      innerStore.update((s) => ({ ...s, isStudentJoined: status }));
    },
    setIsStudentLeave(status: boolean) {
      innerStore.update((s) => ({ ...s, isStudentLeave: status }));
    },
    setIsStudentLeft(status: boolean) {
      innerStore.update((s) => ({ ...s, isStudentLeft: status }));
    },
    setIsRatingChange(status: boolean) {
      innerStore.update((s) => ({ ...s, isRatingChange: status }));
    },
    setIsRatingChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isRatingChanged: status }));
    },
    setIsContent(status: boolean) {
      innerStore.update((s) => ({ ...s, isContent: status }));
    },
    setIsContentAdd(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentAdd: status }));
    },
    setIsContentAdded(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentAdded: status }));
    },
    setIsContentChange(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentChange: status }));
    },
    setIsContentChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentChanged: status }));
    },
    setIsContentDelete(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentDelete: status }));
    },
    setIsContentDeleted(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentDeleted: status }));
    },
    setIsContentStatusChange(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentStatusChange: status }));
    },
    setIsContentStatusChanged(status: boolean) {
      innerStore.update((s) => ({ ...s, isContentStatusChanged: status }));
    },
    async asyncSetCourses(is_me: string | number = "") {
      try {
        const courses = await courseApi.getCourses(is_me);
        this.setCourses(courses);
      } catch {
        this.setCourses([]);
      }
    },
    async asyncSetCourse(courseId: string | number) {
      try {
        const course = await courseApi.getCourseById(courseId);
        this.setCourse(course);
      } catch {
        this.setCourse(null);
      } finally {
        this.setIsCourse(true);
      }
    },
    async asyncSetContent(contentId: string | number) {
      try {
        const content = await courseApi.getContentById(contentId);
        this.setContent(content);
      } catch {
        this.setContent(null);
      } finally {
        this.setIsContent(true);
      }
    },
    async asyncSetIsCourseAdd(title: string, description: string) {
      try {
        await courseApi.postCourse(title, description);
        showSuccessDialog("Kursus berhasil ditambahkan!");
        this.setIsCourseAdded(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseAdded(false);
      } finally {
        this.setIsCourseAdd(true);
      }
    },
    async asyncSetIsCourseChange(
      courseId: string | number,
      title: string,
      description: string
    ) {
      try {
        const message = await courseApi.putCourse(courseId, title, description);
        showSuccessDialog(message || "Kursus berhasil diubah!");
        this.setIsCourseChanged(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseChanged(false);
      } finally {
        this.setIsCourseChange(true);
      }
    },
    async asyncSetIsCourseChangeCover(courseId: string | number, cover: File) {
      try {
        const message = await courseApi.postCourseCover(courseId, cover);
        showSuccessDialog(message || "Cover kursus berhasil diubah!");
        this.setIsCourseChangedCover(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseChangedCover(false);
      } finally {
        this.setIsCourseChangeCover(true);
      }
    },
    async asyncSetIsCourseDelete(courseId: string | number) {
      try {
        const message = await courseApi.deleteCourse(courseId);
        showSuccessDialog(message || "Kursus berhasil dihapus!");
        this.setIsCourseDeleted(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseDeleted(false);
      } finally {
        this.setIsCourseDelete(true);
      }
    },
    async asyncSetIsCourseDeleteAll() {
      try {
        const message = await courseApi.deleteCourses();
        showSuccessDialog(message || "Semua kursus berhasil dihapus!");
        this.setIsCourseDeletedAll(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseDeletedAll(false);
      } finally {
        this.setIsCourseDeleteAll(true);
      }
    },
    async asyncSetIsStudentJoin(courseId: string | number) {
      try {
        const message = await courseApi.postStudent(courseId);
        showSuccessDialog(message || "Berhasil bergabung dengan kursus!");
        this.setIsStudentJoined(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsStudentJoined(false);
      } finally {
        this.setIsStudentJoin(true);
      }
    },
    async asyncSetIsStudentLeave(courseId: string | number) {
      try {
        const message = await courseApi.deleteStudent(courseId);
        showSuccessDialog(message || "Berhasil keluar dari kursus!");
        this.setIsStudentLeft(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsStudentLeft(false);
      } finally {
        this.setIsStudentLeave(true);
      }
    },
    async asyncSetIsRatingChange(
      courseId: string | number,
      ratings: number,
      comment: string
    ) {
      try {
        const message = await courseApi.putStudentRating(courseId, ratings, comment);
        showSuccessDialog(message || "Rating berhasil diperbarui!");
        this.setIsRatingChanged(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsRatingChanged(false);
      } finally {
        this.setIsRatingChange(true);
      }
    },
    async asyncSetIsContentAdd(
      courseId: string | number,
      title: string,
      youtube: string
    ) {
      try {
        await courseApi.postContent(courseId, title, youtube);
        showSuccessDialog("Materi berhasil ditambahkan!");
        this.setIsContentAdded(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsContentAdded(false);
      } finally {
        this.setIsContentAdd(true);
      }
    },
    async asyncSetIsContentChange(
      contentId: string | number,
      title: string,
      youtube: string
    ) {
      try {
        const message = await courseApi.putContent(contentId, title, youtube);
        showSuccessDialog(message || "Materi berhasil diubah!");
        this.setIsContentChanged(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsContentChanged(false);
      } finally {
        this.setIsContentChange(true);
      }
    },
    async asyncSetIsContentDelete(contentId: string | number) {
      try {
        const message = await courseApi.deleteContent(contentId);
        showSuccessDialog(message || "Materi berhasil dihapus!");
        this.setIsContentDeleted(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsContentDeleted(false);
      } finally {
        this.setIsContentDelete(true);
      }
    },
    async asyncSetIsContentStatusChange(contentId: string | number, status: 1 | 0) {
      try {
        const message = await courseApi.postContentStatus(contentId, status);
        showSuccessDialog(message || "Status pembelajaran berhasil diperbarui!");
        this.setIsContentStatusChanged(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsContentStatusChanged(false);
      } finally {
        this.setIsContentStatusChange(true);
      }
    },
  };
}

export const coursesStore = createCoursesStore();
export const useCoursesStore = () => coursesStore;
export default coursesStore;
