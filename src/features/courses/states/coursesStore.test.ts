import { describe, it, expect, vi, beforeEach } from "vitest";
import coursesStore, { useCoursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("coursesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coursesStore.reset();
  });

  it("should have initial state and getters", () => {
    expect(coursesStore.courses).toEqual([]);
    expect(coursesStore.course).toBeNull();
    expect(coursesStore.content).toBeNull();
    expect(coursesStore.isCourse).toBe(false);
    expect(coursesStore.isCourseAdd).toBe(false);
    expect(coursesStore.isCourseAdded).toBe(false);
    expect(coursesStore.isCourseChange).toBe(false);
    expect(coursesStore.isCourseChanged).toBe(false);
    expect(coursesStore.isCourseChangeCover).toBe(false);
    expect(coursesStore.isCourseChangedCover).toBe(false);
    expect(coursesStore.isCourseDelete).toBe(false);
    expect(coursesStore.isCourseDeleted).toBe(false);
    expect(coursesStore.isCourseDeleteAll).toBe(false);
    expect(coursesStore.isCourseDeletedAll).toBe(false);
    expect(coursesStore.isStudentJoin).toBe(false);
    expect(coursesStore.isStudentJoined).toBe(false);
    expect(coursesStore.isStudentLeave).toBe(false);
    expect(coursesStore.isStudentLeft).toBe(false);
    expect(coursesStore.isRatingChange).toBe(false);
    expect(coursesStore.isRatingChanged).toBe(false);
    expect(coursesStore.isContent).toBe(false);
    expect(coursesStore.isContentAdd).toBe(false);
    expect(coursesStore.isContentAdded).toBe(false);
    expect(coursesStore.isContentChange).toBe(false);
    expect(coursesStore.isContentChanged).toBe(false);
    expect(coursesStore.isContentDelete).toBe(false);
    expect(coursesStore.isContentDeleted).toBe(false);
    expect(coursesStore.isContentStatusChange).toBe(false);
    expect(coursesStore.isContentStatusChanged).toBe(false);
    expect(coursesStore.$state).toBeDefined();
  });

  it("should update state with setters and reset", () => {
    const mockCourse = { id: 1, title: "Course 1", user_id: 1, description: "Desc" };
    const mockContent = { id: 2, course_id: 1, title: "Content 1", youtube: "https://youtu.be/abc" };

    coursesStore.setCourses([mockCourse]);
    expect(coursesStore.courses).toEqual([mockCourse]);

    coursesStore.setCourse(mockCourse);
    expect(coursesStore.course).toEqual(mockCourse);

    coursesStore.setContent(mockContent);
    expect(coursesStore.content).toEqual(mockContent);

    coursesStore.setIsCourse(true);
    expect(coursesStore.isCourse).toBe(true);

    coursesStore.setIsCourseAdd(true);
    expect(coursesStore.isCourseAdd).toBe(true);

    coursesStore.setIsCourseAdded(true);
    expect(coursesStore.isCourseAdded).toBe(true);

    coursesStore.setIsCourseChange(true);
    expect(coursesStore.isCourseChange).toBe(true);

    coursesStore.setIsCourseChanged(true);
    expect(coursesStore.isCourseChanged).toBe(true);

    coursesStore.setIsCourseChangeCover(true);
    expect(coursesStore.isCourseChangeCover).toBe(true);

    coursesStore.setIsCourseChangedCover(true);
    expect(coursesStore.isCourseChangedCover).toBe(true);

    coursesStore.setIsCourseDelete(true);
    expect(coursesStore.isCourseDelete).toBe(true);

    coursesStore.setIsCourseDeleted(true);
    expect(coursesStore.isCourseDeleted).toBe(true);

    coursesStore.setIsCourseDeleteAll(true);
    expect(coursesStore.isCourseDeleteAll).toBe(true);

    coursesStore.setIsCourseDeletedAll(true);
    expect(coursesStore.isCourseDeletedAll).toBe(true);

    coursesStore.setIsStudentJoin(true);
    expect(coursesStore.isStudentJoin).toBe(true);

    coursesStore.setIsStudentJoined(true);
    expect(coursesStore.isStudentJoined).toBe(true);

    coursesStore.setIsStudentLeave(true);
    expect(coursesStore.isStudentLeave).toBe(true);

    coursesStore.setIsStudentLeft(true);
    expect(coursesStore.isStudentLeft).toBe(true);

    coursesStore.setIsRatingChange(true);
    expect(coursesStore.isRatingChange).toBe(true);

    coursesStore.setIsRatingChanged(true);
    expect(coursesStore.isRatingChanged).toBe(true);

    coursesStore.setIsContent(true);
    expect(coursesStore.isContent).toBe(true);

    coursesStore.setIsContentAdd(true);
    expect(coursesStore.isContentAdd).toBe(true);

    coursesStore.setIsContentAdded(true);
    expect(coursesStore.isContentAdded).toBe(true);

    coursesStore.setIsContentChange(true);
    expect(coursesStore.isContentChange).toBe(true);

    coursesStore.setIsContentChanged(true);
    expect(coursesStore.isContentChanged).toBe(true);

    coursesStore.setIsContentDelete(true);
    expect(coursesStore.isContentDelete).toBe(true);

    coursesStore.setIsContentDeleted(true);
    expect(coursesStore.isContentDeleted).toBe(true);

    coursesStore.setIsContentStatusChange(true);
    expect(coursesStore.isContentStatusChange).toBe(true);

    coursesStore.setIsContentStatusChanged(true);
    expect(coursesStore.isContentStatusChanged).toBe(true);

    coursesStore.reset();
    expect(coursesStore.courses).toEqual([]);
    expect(coursesStore.course).toBeNull();
  });

  describe("asyncSetCourses", () => {
    it("should fetch courses successfully", async () => {
      const mockList = [{ id: 1, title: "C1", user_id: 1, description: "D" }];
      vi.spyOn(courseApi, "getCourses").mockResolvedValue(mockList);

      await coursesStore.asyncSetCourses("1");
      expect(coursesStore.courses).toEqual(mockList);
    });

    it("should set empty array on error", async () => {
      vi.spyOn(courseApi, "getCourses").mockRejectedValue(new Error("Fail"));

      await coursesStore.asyncSetCourses();
      expect(coursesStore.courses).toEqual([]);
    });
  });

  describe("asyncSetCourse", () => {
    it("should fetch single course successfully", async () => {
      const mockCourse = { id: 1, title: "C1", user_id: 1, description: "D" };
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse);

      await coursesStore.asyncSetCourse(1);
      expect(coursesStore.course).toEqual(mockCourse);
      expect(coursesStore.isCourse).toBe(true);
    });

    it("should set null course on error", async () => {
      vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("Fail"));

      await coursesStore.asyncSetCourse(99);
      expect(coursesStore.course).toBeNull();
      expect(coursesStore.isCourse).toBe(true);
    });
  });

  describe("asyncSetContent", () => {
    it("should fetch content successfully", async () => {
      const mockContent = { id: 10, course_id: 1, title: "M1", youtube: "https://youtu.be/abc" };
      vi.spyOn(courseApi, "getContentById").mockResolvedValue(mockContent);

      await coursesStore.asyncSetContent(10);
      expect(coursesStore.content).toEqual(mockContent);
      expect(coursesStore.isContent).toBe(true);
    });

    it("should set null content on error", async () => {
      vi.spyOn(courseApi, "getContentById").mockRejectedValue(new Error("Fail"));

      await coursesStore.asyncSetContent(99);
      expect(coursesStore.content).toBeNull();
      expect(coursesStore.isContent).toBe(true);
    });
  });

  describe("asyncSetIsCourseAdd", () => {
    it("should add course and show success dialog", async () => {
      vi.spyOn(courseApi, "postCourse").mockResolvedValue({ course_id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseAdd("Judul", "Deskripsi");
      expect(successSpy).toHaveBeenCalledWith("Kursus berhasil ditambahkan!");
      expect(coursesStore.isCourseAdded).toBe(true);
      expect(coursesStore.isCourseAdd).toBe(true);
    });

    it("should handle error when adding course", async () => {
      vi.spyOn(courseApi, "postCourse").mockRejectedValue(new Error("Add fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseAdd("Judul", "Deskripsi");
      expect(errorSpy).toHaveBeenCalledWith("Add fail");
      expect(coursesStore.isCourseAdded).toBe(false);
      expect(coursesStore.isCourseAdd).toBe(true);
    });
  });

  describe("asyncSetIsCourseChange", () => {
    it("should update course and show success dialog", async () => {
      vi.spyOn(courseApi, "putCourse").mockResolvedValue("Berhasil mengubah data");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseChange(1, "Judul Baru", "Deskripsi");
      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah data");
      expect(coursesStore.isCourseChanged).toBe(true);
      expect(coursesStore.isCourseChange).toBe(true);
    });

    it("should handle error when updating course", async () => {
      vi.spyOn(courseApi, "putCourse").mockRejectedValue(new Error("Update fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseChange(1, "Judul", "Deskripsi");
      expect(errorSpy).toHaveBeenCalledWith("Update fail");
      expect(coursesStore.isCourseChanged).toBe(false);
      expect(coursesStore.isCourseChange).toBe(true);
    });
  });

  describe("asyncSetIsCourseChangeCover", () => {
    it("should update cover and show success dialog", async () => {
      vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("Berhasil mengubah cover");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      const file = new File(["cover"], "cover.jpg");
      await coursesStore.asyncSetIsCourseChangeCover(1, file);
      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah cover");
      expect(coursesStore.isCourseChangedCover).toBe(true);
      expect(coursesStore.isCourseChangeCover).toBe(true);
    });

    it("should handle error when updating cover", async () => {
      vi.spyOn(courseApi, "postCourseCover").mockRejectedValue(new Error("Cover fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      const file = new File(["cover"], "cover.jpg");
      await coursesStore.asyncSetIsCourseChangeCover(1, file);
      expect(errorSpy).toHaveBeenCalledWith("Cover fail");
      expect(coursesStore.isCourseChangedCover).toBe(false);
      expect(coursesStore.isCourseChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsCourseDelete", () => {
    it("should delete course and show success dialog", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("Berhasil menghapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Berhasil menghapus");
      expect(coursesStore.isCourseDeleted).toBe(true);
      expect(coursesStore.isCourseDelete).toBe(true);
    });

    it("should handle error when deleting course", async () => {
      vi.spyOn(courseApi, "deleteCourse").mockRejectedValue(new Error("Delete fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseDelete(1);
      expect(errorSpy).toHaveBeenCalledWith("Delete fail");
      expect(coursesStore.isCourseDeleted).toBe(false);
      expect(coursesStore.isCourseDelete).toBe(true);
    });
  });

  describe("asyncSetIsCourseDeleteAll", () => {
    it("should delete all courses and show success dialog", async () => {
      vi.spyOn(courseApi, "deleteCourses").mockResolvedValue("Berhasil menghapus semua data kursus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Berhasil menghapus semua data kursus");
      expect(coursesStore.isCourseDeletedAll).toBe(true);
      expect(coursesStore.isCourseDeleteAll).toBe(true);
    });

    it("should handle error when deleting all courses", async () => {
      vi.spyOn(courseApi, "deleteCourses").mockRejectedValue(new Error("Delete all fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(errorSpy).toHaveBeenCalledWith("Delete all fail");
      expect(coursesStore.isCourseDeletedAll).toBe(false);
      expect(coursesStore.isCourseDeleteAll).toBe(true);
    });
  });

  describe("asyncSetIsStudentJoin", () => {
    it("should join course and show success dialog", async () => {
      vi.spyOn(courseApi, "postStudent").mockResolvedValue("Berhasil bergabung");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsStudentJoin(1);
      expect(successSpy).toHaveBeenCalledWith("Berhasil bergabung");
      expect(coursesStore.isStudentJoined).toBe(true);
      expect(coursesStore.isStudentJoin).toBe(true);
    });

    it("should handle error when joining course", async () => {
      vi.spyOn(courseApi, "postStudent").mockRejectedValue(new Error("Join fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsStudentJoin(1);
      expect(errorSpy).toHaveBeenCalledWith("Join fail");
      expect(coursesStore.isStudentJoined).toBe(false);
      expect(coursesStore.isStudentJoin).toBe(true);
    });
  });

  describe("asyncSetIsStudentLeave", () => {
    it("should leave course and show success dialog", async () => {
      vi.spyOn(courseApi, "deleteStudent").mockResolvedValue("Berhasil keluar");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsStudentLeave(1);
      expect(successSpy).toHaveBeenCalledWith("Berhasil keluar");
      expect(coursesStore.isStudentLeft).toBe(true);
      expect(coursesStore.isStudentLeave).toBe(true);
    });

    it("should handle error when leaving course", async () => {
      vi.spyOn(courseApi, "deleteStudent").mockRejectedValue(new Error("Leave fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsStudentLeave(1);
      expect(errorSpy).toHaveBeenCalledWith("Leave fail");
      expect(coursesStore.isStudentLeft).toBe(false);
      expect(coursesStore.isStudentLeave).toBe(true);
    });
  });

  describe("asyncSetIsRatingChange", () => {
    it("should change rating and show success dialog", async () => {
      vi.spyOn(courseApi, "putStudentRating").mockResolvedValue("Rating berhasil diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsRatingChange(1, 5, "Mantap");
      expect(successSpy).toHaveBeenCalledWith("Rating berhasil diubah");
      expect(coursesStore.isRatingChanged).toBe(true);
      expect(coursesStore.isRatingChange).toBe(true);
    });

    it("should handle error when changing rating", async () => {
      vi.spyOn(courseApi, "putStudentRating").mockRejectedValue(new Error("Rating fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsRatingChange(1, 5, "Mantap");
      expect(errorSpy).toHaveBeenCalledWith("Rating fail");
      expect(coursesStore.isRatingChanged).toBe(false);
      expect(coursesStore.isRatingChange).toBe(true);
    });
  });

  describe("asyncSetIsContentAdd", () => {
    it("should add content and show success dialog", async () => {
      vi.spyOn(courseApi, "postContent").mockResolvedValue({ content_id: 10 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentAdd(1, "Materi 1", "https://youtu.be/abc");
      expect(successSpy).toHaveBeenCalledWith("Materi berhasil ditambahkan!");
      expect(coursesStore.isContentAdded).toBe(true);
      expect(coursesStore.isContentAdd).toBe(true);
    });

    it("should handle error when adding content", async () => {
      vi.spyOn(courseApi, "postContent").mockRejectedValue(new Error("Add content fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentAdd(1, "Materi 1", "https://youtu.be/abc");
      expect(errorSpy).toHaveBeenCalledWith("Add content fail");
      expect(coursesStore.isContentAdded).toBe(false);
      expect(coursesStore.isContentAdd).toBe(true);
    });
  });

  describe("asyncSetIsContentChange", () => {
    it("should change content and show success dialog", async () => {
      vi.spyOn(courseApi, "putContent").mockResolvedValue("Materi berhasil diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentChange(10, "Materi Baru", "https://youtu.be/xyz");
      expect(successSpy).toHaveBeenCalledWith("Materi berhasil diubah");
      expect(coursesStore.isContentChanged).toBe(true);
      expect(coursesStore.isContentChange).toBe(true);
    });

    it("should handle error when changing content", async () => {
      vi.spyOn(courseApi, "putContent").mockRejectedValue(new Error("Change content fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentChange(10, "Materi", "https://youtu.be/xyz");
      expect(errorSpy).toHaveBeenCalledWith("Change content fail");
      expect(coursesStore.isContentChanged).toBe(false);
      expect(coursesStore.isContentChange).toBe(true);
    });
  });

  describe("asyncSetIsContentDelete", () => {
    it("should delete content and show success dialog", async () => {
      vi.spyOn(courseApi, "deleteContent").mockResolvedValue("Materi berhasil dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentDelete(10);
      expect(successSpy).toHaveBeenCalledWith("Materi berhasil dihapus");
      expect(coursesStore.isContentDeleted).toBe(true);
      expect(coursesStore.isContentDelete).toBe(true);
    });

    it("should handle error when deleting content", async () => {
      vi.spyOn(courseApi, "deleteContent").mockRejectedValue(new Error("Delete content fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentDelete(10);
      expect(errorSpy).toHaveBeenCalledWith("Delete content fail");
      expect(coursesStore.isContentDeleted).toBe(false);
      expect(coursesStore.isContentDelete).toBe(true);
    });
  });

  describe("asyncSetIsContentStatusChange", () => {
    it("should change content status and show success dialog", async () => {
      vi.spyOn(courseApi, "postContentStatus").mockResolvedValue("Status berhasil diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentStatusChange(10, 1);
      expect(successSpy).toHaveBeenCalledWith("Status berhasil diubah");
      expect(coursesStore.isContentStatusChanged).toBe(true);
      expect(coursesStore.isContentStatusChange).toBe(true);
    });

    it("should handle error when changing content status", async () => {
      vi.spyOn(courseApi, "postContentStatus").mockRejectedValue(new Error("Status fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(async () => ({ isConfirmed: true } as any));

      await coursesStore.asyncSetIsContentStatusChange(10, 0);
      expect(errorSpy).toHaveBeenCalledWith("Status fail");
      expect(coursesStore.isContentStatusChanged).toBe(false);
      expect(coursesStore.isContentStatusChange).toBe(true);
    });
  });

  it("returns the shared instance from useCoursesStore", () => {
    expect(useCoursesStore()).toBe(coursesStore);
  });

  it("uses success messages when API mutations return an empty message", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(async () => ({ isConfirmed: true } as any));
    vi.spyOn(courseApi, "putCourse").mockResolvedValue("");
    vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("");
    vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("");
    vi.spyOn(courseApi, "deleteCourses").mockResolvedValue("");
    vi.spyOn(courseApi, "postStudent").mockResolvedValue("");
    vi.spyOn(courseApi, "deleteStudent").mockResolvedValue("");
    vi.spyOn(courseApi, "putStudentRating").mockResolvedValue("");
    vi.spyOn(courseApi, "putContent").mockResolvedValue("");
    vi.spyOn(courseApi, "deleteContent").mockResolvedValue("");
    vi.spyOn(courseApi, "postContentStatus").mockResolvedValue("");

    await coursesStore.asyncSetIsCourseChange(1, "Judul", "Deskripsi");
    await coursesStore.asyncSetIsCourseChangeCover(1, new File(["cover"], "cover.png"));
    await coursesStore.asyncSetIsCourseDelete(1);
    await coursesStore.asyncSetIsCourseDeleteAll();
    await coursesStore.asyncSetIsStudentJoin(1);
    await coursesStore.asyncSetIsStudentLeave(1);
    await coursesStore.asyncSetIsRatingChange(1, 5, "Bagus");
    await coursesStore.asyncSetIsContentChange(10, "Materi", "https://youtu.be/abc");
    await coursesStore.asyncSetIsContentDelete(10);
    await coursesStore.asyncSetIsContentStatusChange(10, 1);

    expect(successSpy.mock.calls.map(([message]) => message)).toEqual([
      "Kursus berhasil diubah!",
      "Cover kursus berhasil diubah!",
      "Kursus berhasil dihapus!",
      "Semua kursus berhasil dihapus!",
      "Berhasil bergabung dengan kursus!",
      "Berhasil keluar dari kursus!",
      "Rating berhasil diperbarui!",
      "Materi berhasil diubah!",
      "Materi berhasil dihapus!",
      "Status pembelajaran berhasil diperbarui!",
    ]);
  });
});
