import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage.svelte";
import coursesStore from "../states/coursesStore";
import usersStore from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { setupMockStores } from "../../../test-utils";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return {
    ...actual,
    showConfirmDialog: vi.fn(),
  };
});

const courses = [
  {
    id: 1,
    user_id: 7,
    title: "Svelte Dasar",
    description: "Belajar framework",
    author: { name: "Dosen Delcom" },
    students: [7, 8],
  },
  {
    id: 2,
    user_id: 9,
    title: "TypeScript",
    description: "Belajar JavaScript types",
    author: { name: "Pengajar" },
    cover: "https://example.com/cover.png",
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStores({ profile: { id: 7, name: "Pemilik" } });
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {
      coursesStore.setCourses(courses);
    });
  });

  it("loads and displays courses, and filters by search and ownership", async () => {
    render(HomePage);

    expect(await screen.findByText("Svelte Dasar")).toBeTruthy();
    expect(screen.getByText("Pengajar")).toBeTruthy();
    expect(screen.getByText("2 peserta")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Sampul TypeScript" })).toBeTruthy();

    await fireEvent.input(screen.getByRole("searchbox", { name: "Cari kursus" }), {
      target: { value: "type" },
    });
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.queryByText("Svelte Dasar")).toBeNull();

    await fireEvent.input(screen.getByRole("searchbox", { name: "Cari kursus" }), {
      target: { value: "" },
    });
    await fireEvent.click(screen.getByLabelText("Kursus saya"));
    expect(screen.getByText("Svelte Dasar")).toBeTruthy();
    expect(screen.queryByText("TypeScript")).toBeNull();
  });

  it("shows empty states for no courses and for a non-matching search", async () => {
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {
      coursesStore.setCourses([]);
    });
    const { rerender } = render(HomePage);
    expect(await screen.findByText("Belum ada kursus")).toBeTruthy();

    coursesStore.setCourses(courses);
    await rerender({});
    await fireEvent.input(screen.getByRole("searchbox", { name: "Cari kursus" }), {
      target: { value: "tidak ada" },
    });
    expect(screen.getByText("Kursus tidak ditemukan")).toBeTruthy();
  });

  it("offers create and delete actions to a signed-in user", async () => {
    const deleteOne = vi.spyOn(coursesStore, "asyncSetIsCourseDelete").mockImplementation(async () => {
      coursesStore.setIsCourseDeleted(true);
    });
    vi.spyOn(coursesStore, "asyncSetIsCourseDeleteAll").mockImplementation(async () => {
      coursesStore.setIsCourseDeletedAll(true);
    });
    vi.mocked(showConfirmDialog).mockResolvedValue({ isConfirmed: true } as never);

    render(HomePage);
    await screen.findByText("Svelte Dasar");

    await fireEvent.click(screen.getByRole("button", { name: "Hapus kursus Svelte Dasar" }));
    await waitFor(() => expect(deleteOne).toHaveBeenCalledWith(1));
    expect(showConfirmDialog).toHaveBeenCalledWith('Hapus kursus "Svelte Dasar"?');

    await fireEvent.click(screen.getByRole("button", { name: /Buat Kursus/ }));
    expect(screen.getByTestId("add-course-modal")).toBeTruthy();
    await fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(screen.queryByTestId("add-course-modal")).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Hapus Kursus Saya" }));
    expect(showConfirmDialog).toHaveBeenCalledWith("Hapus semua kursus yang Anda buat?");
  });

  it("does nothing when delete confirmations are cancelled", async () => {
    const deleteOne = vi.spyOn(coursesStore, "asyncSetIsCourseDelete");
    const deleteAll = vi.spyOn(coursesStore, "asyncSetIsCourseDeleteAll");
    vi.mocked(showConfirmDialog).mockResolvedValue({ isConfirmed: false } as never);
    render(HomePage);
    await screen.findByText("Svelte Dasar");

    await fireEvent.click(screen.getByRole("button", { name: "Hapus kursus Svelte Dasar" }));
    await fireEvent.click(screen.getByRole("button", { name: "Hapus Kursus Saya" }));
    expect(deleteOne).not.toHaveBeenCalled();
    expect(deleteAll).not.toHaveBeenCalled();
  });

  it("hides management actions when there is no profile", async () => {
    usersStore.setProfile(null);
    render(HomePage);

    await screen.findByText("Svelte Dasar");
    expect(screen.queryByRole("button", { name: /Buat Kursus/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Hapus kursus Svelte Dasar" })).toBeNull();
  });
});
