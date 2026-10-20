import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailPage from "./DetailPage.svelte";
import coursesStore from "../states/coursesStore";
import { setupMockStores } from "../../../test-utils";
import { updateMockPage } from "../../../setupTests";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return {
    ...actual,
    showConfirmDialog: vi.fn(),
  };
});

const content = {
  id: 12,
  course_id: 3,
  title: "Dasar Svelte",
  youtube: "https://youtu.be/abc123",
  my_status_finished: false,
};
const course = {
  id: 3,
  user_id: 1,
  title: "Svelte",
  description: "Belajar **Svelte**",
  author: { name: "Pengajar Delcom" },
  students: [2],
  contents: [content],
  ratings: [{ name: "Peserta", ratings: 5, comment: "Bagus" }],
};

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStores({ profile: { id: 1, name: "Pemilik" } });
    updateMockPage({ params: { courseId: "3" } });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse(course);
    });
  });

  it("shows owner controls, course content, and edit modals", async () => {
    render(DetailPage);
    expect(await screen.findByRole("heading", { name: "Svelte" })).toBeTruthy();
    expect(screen.getByText("Dasar Svelte")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sampul/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Ubah$/ })).toBeTruthy();

    await fireEvent.click(screen.getByRole("button", { name: /Tambah Materi/ }));
    expect(screen.getByRole("heading", { name: "Tambah Materi" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));

    await fireEvent.click(screen.getByRole("button", { name: /^Ubah$/ }));
    expect(screen.getByRole("heading", { name: "Ubah Kursus" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));

    await fireEvent.click(screen.getByRole("button", { name: /Sampul/ }));
    expect(screen.getByRole("heading", { name: "Ubah Sampul Kursus" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));

    await fireEvent.click(screen.getByRole("button", { name: "Ubah materi Dasar Svelte" }));
    expect(screen.getByRole("heading", { name: "Ubah Materi" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
  }, 15000);

  it("lets a visitor join a course and a student submit a rating", async () => {
    setupMockStores({ profile: { id: 8, name: "Peserta Baru" } });
    const join = vi.spyOn(coursesStore, "asyncSetIsStudentJoin").mockImplementation(async () => {
      coursesStore.setIsStudentJoined(true);
      coursesStore.setCourse({ ...course, students: [2, 8] });
    });
    const { unmount } = render(DetailPage);

    expect(await screen.findByRole("button", { name: "Ikuti Kursus" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Ikuti Kursus" }));
    await waitFor(() => expect(join).toHaveBeenCalledWith(3));
    unmount();

    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    render(DetailPage);
    expect(await screen.findByRole("heading", { name: "Beri Rating" })).toBeTruthy();
    const ratingForm = document.querySelector<HTMLFormElement>("form")!;
    const rate = vi.spyOn(coursesStore, "asyncSetIsRatingChange").mockImplementation(async () => {
      coursesStore.setIsRatingChanged(true);
    });
    await fireEvent.submit(ratingForm);
    expect(rate).not.toHaveBeenCalled();
    await fireEvent.input(screen.getByPlaceholderText("Bagikan pengalaman belajarmu"), {
      target: { value: "Materinya jelas" },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Kirim Rating" }));
    await waitFor(() => expect(rate).toHaveBeenCalledWith(3, 5, "Materinya jelas"));
    expect(screen.getByText("Bagus")).toBeTruthy();
  });

  it("confirms content deletion and leaves the course when requested", async () => {
    const remove = vi.spyOn(coursesStore, "asyncSetIsContentDelete").mockImplementation(async () => {
      coursesStore.setIsContentDeleted(true);
    });
    vi.mocked(showConfirmDialog).mockResolvedValue({ isConfirmed: true } as never);

    const { unmount } = render(DetailPage);
    expect(await screen.findByRole("button", { name: "Hapus materi Dasar Svelte" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Hapus materi Dasar Svelte" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(12));
    unmount();

    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    const leave = vi.spyOn(coursesStore, "asyncSetIsStudentLeave").mockImplementation(async () => {
      coursesStore.setIsStudentLeft(true);
    });
    render(DetailPage);
    expect(await screen.findByRole("button", { name: "Keluar dari Kursus" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Keluar dari Kursus" }));
    await waitFor(() => expect(leave).toHaveBeenCalledWith(3));
  });

  it("shows a not-found page when the course is unavailable", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse(null);
    });
    render(DetailPage);
    expect(await screen.findByRole("heading", { name: "Kursus tidak ditemukan" })).toBeTruthy();
  });

  it("uses fallbacks and displays an empty materials state", async () => {
    setupMockStores({ profile: null });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse({
        id: 3,
        user_id: 1,
        title: "Kursus tanpa detail",
        description: "Deskripsi",
      });
    });
    render(DetailPage);

    expect(await screen.findByRole("heading", { name: "Kursus tanpa detail" })).toBeTruthy();
    expect(screen.getByText("Pengajar Delcom")).toBeTruthy();
    expect(screen.getByText("Belum ada rating")).toBeTruthy();
    expect(screen.getByText("0 peserta")).toBeTruthy();
    expect(screen.getByText("Belum ada materi untuk kursus ini.")).toBeTruthy();
  });

  it("renders completion, count, rating, and rating-empty states", async () => {
    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse({
        ...course,
        user_id: 1,
        students: undefined,
        total_contents: 4,
        avg_ratings: 0,
        my_percentage_finished: 25,
        contents: [{ ...content, my_status_finished: true }],
        ratings: [],
      });
    });
    render(DetailPage);

    expect(await screen.findByText("25% selesai")).toBeTruthy();
    expect(screen.getByText("0 peserta")).toBeTruthy();
    expect(screen.getByText("4 materi")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("Selesai")).toBeTruthy();
    expect(screen.queryByText("Bagus")).toBeNull();
  });

  it("does not refresh the course when join, leave, rating, or delete fails", async () => {
    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    vi.mocked(showConfirmDialog).mockResolvedValue({ isConfirmed: false } as never);
    const load = vi.spyOn(coursesStore, "asyncSetCourse");
    const remove = vi.spyOn(coursesStore, "asyncSetIsContentDelete");
    const { unmount } = render(DetailPage);
    expect(await screen.findByRole("button", { name: "Keluar dari Kursus" })).toBeTruthy();

    vi.spyOn(coursesStore, "asyncSetIsStudentLeave").mockImplementation(async () => {
      coursesStore.setIsStudentLeft(false);
    });
    await fireEvent.click(screen.getByRole("button", { name: "Keluar dari Kursus" }));
    expect(load).toHaveBeenCalledTimes(1);

    const rate = vi.spyOn(coursesStore, "asyncSetIsRatingChange").mockImplementation(async () => {
      coursesStore.setIsRatingChanged(false);
    });
    await fireEvent.input(screen.getByPlaceholderText("Bagikan pengalaman belajarmu"), {
      target: { value: "Komentar" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Kirim Rating" }));
    expect(rate).toHaveBeenCalledWith(3, 5, "Komentar");
    expect(load).toHaveBeenCalledTimes(1);

    unmount();

    setupMockStores({ profile: { id: 8, name: "Peserta Baru" } });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse(course);
    });
    const join = vi.spyOn(coursesStore, "asyncSetIsStudentJoin").mockImplementation(async () => {
      coursesStore.setIsStudentJoined(false);
    });
    render(DetailPage);
    await screen.findByRole("button", { name: "Ikuti Kursus" });
    await fireEvent.click(screen.getByRole("button", { name: "Ikuti Kursus" }));
    expect(join).toHaveBeenCalledWith(3);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("uses a stale enrollment control safely after the course disappears", async () => {
    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    let fetchCount = 0;
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      fetchCount += 1;
      coursesStore.setCourse(fetchCount === 1 ? course : null);
    });
    vi.spyOn(coursesStore, "asyncSetIsStudentLeave").mockImplementation(async () => {
      coursesStore.setIsStudentLeft(true);
    });
    render(DetailPage);
    const leaveButton = await screen.findByRole("button", { name: "Keluar dari Kursus" });
    await fireEvent.click(leaveButton);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Kursus tidak ditemukan" })).toBeTruthy());
    await fireEvent.click(leaveButton);
    expect(fetchCount).toBe(2);
  });

  it("shows a course image, percentage, and reports a confirmed delete failure", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse({
        ...course,
        cover: "https://example.com/course.png",
        my_percentage_finished: 0,
      });
    });
    vi.mocked(showConfirmDialog).mockResolvedValue({ isConfirmed: true } as never);
    vi.spyOn(coursesStore, "asyncSetIsContentDelete").mockImplementation(async () => {
      coursesStore.setIsContentDeleted(false);
    });
    render(DetailPage);
    expect(await screen.findByRole("img", { name: "Sampul Svelte" })).toBeTruthy();
    expect(screen.getByText("0% selesai")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Hapus materi Dasar Svelte" }));
    expect(showConfirmDialog).toHaveBeenCalled();
    expect(screen.getByText("Dasar Svelte")).toBeTruthy();
  });

  it("skips content deletion when the confirmation is cancelled", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue({ isConfirmed: false } as never);
    const remove = vi.spyOn(coursesStore, "asyncSetIsContentDelete");
    render(DetailPage);
    await fireEvent.click(await screen.findByRole("button", { name: "Hapus materi Dasar Svelte" }));

    expect(showConfirmDialog).toHaveBeenCalledWith('Hapus materi "Dasar Svelte"?');
    expect(remove).not.toHaveBeenCalled();
  });

  it("navigates back when the course does not exist", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse(null);
    });
    const { mockGoto } = await import("../../../setupTests");
    render(DetailPage);
    await fireEvent.click(await screen.findByRole("button", { name: "Kembali ke semua kursus" }));
    expect(mockGoto).toHaveBeenCalledWith("/");
  });

  it("uses course fallbacks and allows changing the rating selection", async () => {
    setupMockStores({ profile: null });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse({
        id: 3,
        user_id: 1,
        title: "",
        students: undefined,
        description: "",
        contents: undefined,
        ratings: [],
      });
    });
    render(DetailPage);

    expect(await screen.findByRole("link", { name: "Semua Kursus" })).toBeTruthy();
    expect(document.title).toContain("Detail Kursus");
    expect(screen.getByText("0 peserta")).toBeTruthy();
    expect(screen.getByText("0 materi")).toBeTruthy();
    expect(screen.getByText("Belum ada rating")).toBeTruthy();
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Detail kursus pembelajaran Delcom Courses"
    );
  });

  it("renders an empty rating list and allows changing the rating selection", async () => {
    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse({ ...course, students: [2], ratings: [] });
    });
    render(DetailPage);

    expect(await screen.findByRole("heading", { name: "Beri Rating" })).toBeTruthy();
    await fireEvent.change(screen.getByLabelText("Rating"), { target: { value: "4" } });
    expect((screen.getByLabelText("Rating") as HTMLSelectElement).value).toBe("4");
    expect(screen.queryByText("Bagus")).toBeNull();
  });

});
