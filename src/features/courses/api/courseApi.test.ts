import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

describe("courseApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postCourse", () => {
    it("should post course successfully", async () => {
      const mockResponse = {
        status: "success",
        message: "Berhasil menambahkan kursus",
        data: { course_id: 1 },
      };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await courseApi.postCourse("Judul", "Deskripsi");
      expect(result).toEqual({ course_id: 1 });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("accepts the success boolean response envelope across all course endpoints", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "ok",
          success: true,
          message: "OK",
          data: {
            courses: [],
            course: { id: 1 },
            course_content: { id: 2 },
          },
        }),
      } as Response);

      await expect(courseApi.postCourse("Judul", "Deskripsi")).resolves.toBeDefined();
      await expect(courseApi.postCourseCover(1, new File(["cover"], "cover.png"))).resolves.toBe("OK");
      await expect(courseApi.putCourse(1, "Judul", "Deskripsi")).resolves.toBe("OK");
      await expect(courseApi.getCourses()).resolves.toEqual([]);
      await expect(courseApi.getCourses(null)).resolves.toEqual([]);
      await expect(courseApi.getCourses(0)).resolves.toEqual([]);
      await expect(courseApi.getCourseById(1)).resolves.toEqual({ id: 1 });
      await expect(courseApi.deleteCourse(1)).resolves.toBe("OK");
      await expect(courseApi.deleteCourses()).resolves.toBe("OK");
      await expect(courseApi.postStudent(1)).resolves.toBe("OK");
      await expect(courseApi.deleteStudent(1)).resolves.toBe("OK");
      await expect(courseApi.putStudentRating(1, 5, "Bagus")).resolves.toBe("OK");
      await expect(courseApi.postContent(1, "Materi", "https://youtu.be/abc")).resolves.toBeDefined();
      await expect(courseApi.putContent(2, "Materi", "https://youtu.be/abc")).resolves.toBe("OK");
      await expect(courseApi.getContentById(2)).resolves.toEqual({ id: 2 });
      await expect(courseApi.deleteContent(2)).resolves.toBe("OK");
      await expect(courseApi.postContentStatus(2, 1)).resolves.toBe("OK");
    });

    it("should throw error if post course fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Data tidak valid" }),
      } as Response);

      await expect(courseApi.postCourse("Judul", "Deskripsi")).rejects.toThrow(
        "Data tidak valid"
      );
    });
  });

  describe("postCourseCover", () => {
    it("should post course cover successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah cover" }),
      } as Response);

      const file = new File(["cover content"], "test-cover.png", { type: "image/png" });
      const result = await courseApi.postCourseCover(1, file);
      expect(result).toBe("Berhasil mengubah cover");
    });

    it("should fallback to cover.jpg if file has no name", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah cover" }),
      } as Response);

      const file = new File(["cover content"], "");
      const result = await courseApi.postCourseCover(1, file);
      expect(result).toBe("Berhasil mengubah cover");
    });

    it("should throw error if post course cover fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal upload cover" }),
      } as Response);

      const file = new File(["cover content"], "cover.png");
      await expect(courseApi.postCourseCover(1, file)).rejects.toThrow("Gagal upload cover");
    });
  });

  describe("putCourse", () => {
    it("should put course successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah data" }),
      } as Response);

      const result = await courseApi.putCourse(1, "Judul Baru", "Deskripsi Baru");
      expect(result).toBe("Berhasil mengubah data");
    });

    it("should throw error if put course fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal update" }),
      } as Response);

      await expect(courseApi.putCourse(1, "Judul", "Deskripsi")).rejects.toThrow("Gagal update");
    });
  });

  describe("getCourses", () => {
    it("should get all courses without filter", async () => {
      const mockCourses = [{ id: 1, title: "Kursus 1", user_id: 1, description: "Desc" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { courses: mockCourses },
        }),
      } as Response);

      const result = await courseApi.getCourses();
      expect(result).toEqual(mockCourses);
    });

    it("should get courses with is_me filter", async () => {
      const mockCourses = [{ id: 1, title: "Kursus Saya", user_id: 1, description: "Desc" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { courses: mockCourses },
        }),
      } as Response);

      const result = await courseApi.getCourses("1");
      expect(result).toEqual(mockCourses);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("?is_me=1"),
        expect.anything()
      );
    });

    it("should return empty array if data.courses is null", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: null,
        }),
      } as Response);

      const result = await courseApi.getCourses();
      expect(result).toEqual([]);
    });

    it("should throw error if get courses fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal mengambil data" }),
      } as Response);

      await expect(courseApi.getCourses()).rejects.toThrow("Gagal mengambil data");
    });
  });

  describe("getCourseById", () => {
    it("should get course detail successfully", async () => {
      const mockCourse = { id: 1, title: "Detail Kursus", user_id: 1, description: "Desc" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { course: mockCourse },
        }),
      } as Response);

      const result = await courseApi.getCourseById(1);
      expect(result).toEqual(mockCourse);
    });

    it("should throw error if get course detail fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Kursus tidak ditemukan" }),
      } as Response);

      await expect(courseApi.getCourseById(1)).rejects.toThrow("Kursus tidak ditemukan");
    });
  });

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus data" }),
      } as Response);

      const result = await courseApi.deleteCourse(1);
      expect(result).toBe("Berhasil menghapus data");
    });

    it("should throw error if delete course fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal menghapus" }),
      } as Response);

      await expect(courseApi.deleteCourse(1)).rejects.toThrow("Gagal menghapus");
    });
  });

  describe("deleteCourses (all)", () => {
    it("should delete all courses successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus semua data kursus" }),
      } as Response);

      const result = await courseApi.deleteCourses();
      expect(result).toBe("Berhasil menghapus semua data kursus");
    });

    it("should throw error if delete all courses fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Unauthenticated." }),
      } as Response);

      await expect(courseApi.deleteCourses()).rejects.toThrow("Unauthenticated.");
    });
  });

  describe("postStudent (join)", () => {
    it("should add student successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menjadi pelajar pada kursus" }),
      } as Response);

      const result = await courseApi.postStudent(1);
      expect(result).toBe("Berhasil menjadi pelajar pada kursus");
    });

    it("should throw error if add student fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal daftar" }),
      } as Response);

      await expect(courseApi.postStudent(1)).rejects.toThrow("Gagal daftar");
    });
  });

  describe("deleteStudent (leave)", () => {
    it("should delete student successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil keluar sebagai pelajar pada kursus" }),
      } as Response);

      const result = await courseApi.deleteStudent(1);
      expect(result).toBe("Berhasil keluar sebagai pelajar pada kursus");
    });

    it("should throw error if delete student fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal keluar" }),
      } as Response);

      await expect(courseApi.deleteStudent(1)).rejects.toThrow("Gagal keluar");
    });
  });

  describe("putStudentRating", () => {
    it("should change student ratings successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah ratings pada kursus" }),
      } as Response);

      const result = await courseApi.putStudentRating(1, 5, "Bagus sekali");
      expect(result).toBe("Berhasil mengubah ratings pada kursus");
    });

    it("should throw error if change student ratings fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Rating tidak valid" }),
      } as Response);

      await expect(courseApi.putStudentRating(1, 5, "Bagus")).rejects.toThrow("Rating tidak valid");
    });
  });

  describe("postContent", () => {
    it("should add new content successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menambahkan konten kursus",
          data: { content_id: 10 },
        }),
      } as Response);

      const result = await courseApi.postContent(1, "Materi 1", "https://youtu.be/abc");
      expect(result).toEqual({ content_id: 10 });
    });

    it("should throw error if add content fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Data konten tidak valid" }),
      } as Response);

      await expect(courseApi.postContent(1, "Materi 1", "invalid-url")).rejects.toThrow(
        "Data konten tidak valid"
      );
    });
  });

  describe("putContent", () => {
    it("should update content successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah konten kursus" }),
      } as Response);

      const result = await courseApi.putContent(10, "Materi Baru", "https://youtu.be/xyz");
      expect(result).toBe("Berhasil mengubah konten kursus");
    });

    it("should throw error if update content fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal update konten" }),
      } as Response);

      await expect(courseApi.putContent(10, "Materi", "https://youtu.be/xyz")).rejects.toThrow(
        "Gagal update konten"
      );
    });
  });

  describe("getContentById", () => {
    it("should get content detail successfully", async () => {
      const mockContent = { id: 10, course_id: 1, title: "Materi 1", youtube: "https://youtu.be/abc" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { course_content: mockContent },
        }),
      } as Response);

      const result = await courseApi.getContentById(10);
      expect(result).toEqual(mockContent);
    });

    it("should throw error if get content detail fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Konten tidak ditemukan" }),
      } as Response);

      await expect(courseApi.getContentById(10)).rejects.toThrow("Konten tidak ditemukan");
    });
  });

  describe("deleteContent", () => {
    it("should delete content successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus konten kursus" }),
      } as Response);

      const result = await courseApi.deleteContent(10);
      expect(result).toBe("Berhasil menghapus konten kursus");
    });

    it("should throw error if delete content fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal menghapus konten" }),
      } as Response);

      await expect(courseApi.deleteContent(10)).rejects.toThrow("Gagal menghapus konten");
    });
  });

  describe("postContentStatus", () => {
    it("should change content status successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil mengubah status pembelajaran" }),
      } as Response);

      const result = await courseApi.postContentStatus(10, 1);
      expect(result).toBe("Berhasil mengubah status pembelajaran");
    });

    it("should throw error if change content status fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal ubah status" }),
      } as Response);

      await expect(courseApi.postContentStatus(10, 0)).rejects.toThrow("Gagal ubah status");
    });
  });
});
