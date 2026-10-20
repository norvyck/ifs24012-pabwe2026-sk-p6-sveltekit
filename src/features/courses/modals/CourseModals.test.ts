import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddModal from "./AddModal.svelte";
import ChangeModal from "./ChangeModal.svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import ContentModal from "./ContentModal.svelte";
import coursesStore from "../states/coursesStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { setupMockStores } from "../../../test-utils";
import type { Course, CourseContent } from "../api/courseApi";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return {
    ...actual,
    showErrorDialog: vi.fn(),
  };
});

const course: Course = {
  id: 3,
  user_id: 1,
  title: "Svelte",
  description: "Belajar Svelte",
};
const content: CourseContent = {
  id: 12,
  course_id: 3,
  title: "Dasar Svelte",
  youtube: "https://youtu.be/abc123",
};

describe("Course modals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStores();
  });

  it("validates, saves, resets, and closes the add-course modal", async () => {
    const onClose = vi.fn();
    const save = vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {
      coursesStore.setIsCourseAdded(true);
      coursesStore.setIsCourseAdd(true);
    });
    vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();
    const { rerender } = render(AddModal, { props: { show: true, onClose } });

    const addForm = document.querySelector<HTMLFormElement>('[data-testid="add-course-modal"] form')!;
    await fireEvent.submit(addForm);
    expect(showErrorDialog).toHaveBeenCalledWith("Judul kursus tidak boleh kosong");

    await fireEvent.input(screen.getByTestId("add-course-title-input"), {
      target: { value: "Kursus Baru" },
    });
    await fireEvent.submit(addForm);
    expect(showErrorDialog).toHaveBeenLastCalledWith("Deskripsi kursus tidak boleh kosong");

    await fireEvent.input(screen.getByTestId("add-course-description-input"), {
      target: { value: "  Deskripsi baru  " },
    });
    await fireEvent.submit(addForm);
    await waitFor(() => expect(save).toHaveBeenCalledWith("Kursus Baru", "Deskripsi baru"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect((screen.getByTestId("add-course-title-input") as HTMLInputElement).value).toBe("");
    await rerender({ show: false, onClose });
    expect(document.body.style.overflow).toBe("auto");
    await rerender({ show: true, onClose });
    expect(document.body.style.overflow).toBe("hidden");
    await fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renders safely without document or an onClose callback, and stays open when save fails", async () => {
    let finishAdd!: () => void;
    vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishAdd = () => {
            coursesStore.setIsCourseAdded(false);
            coursesStore.setIsCourseAdd(true);
            resolve();
          };
        })
    );
    const { rerender } = render(AddModal, { props: { show: true } });
    await fireEvent.click(screen.getByRole("button", { name: "Tutup modal tambah kursus" }));
    const form = document.querySelector<HTMLFormElement>('[data-testid="add-course-modal"] form')!;
    await fireEvent.input(screen.getByTestId("add-course-title-input"), {
      target: { value: "Kursus gagal" },
    });
    await fireEvent.input(screen.getByTestId("add-course-description-input"), {
      target: { value: "Deskripsi" },
    });
    await fireEvent.submit(form);
    expect(screen.getByText("Menyimpan...")).toBeTruthy();
    expect((screen.getByTestId("submit-add-modal-btn") as HTMLButtonElement).disabled).toBe(true);
    finishAdd();
    await waitFor(() => expect(screen.getByText("Tambah Kursus")).toBeTruthy());
    expect(screen.getByTestId("add-course-modal")).toBeTruthy();

    const currentDocument = globalThis.document;
    vi.stubGlobal("document", undefined);
    try {
      await rerender({ show: false });
    } finally {
      vi.stubGlobal("document", currentDocument);
    }
  });

  it("validates course changes and invokes callbacks only after success", async () => {
    const onClose = vi.fn();
    const onChanged = vi.fn();
    const update = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(true);
    });
    const { rerender } = render(ChangeModal, {
      props: { show: true, course, onClose, onChanged },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();
    const changeForm = document.querySelector<HTMLFormElement>("dialog form")!;
    const titleInput = screen.getByLabelText("Judul kursus") as HTMLInputElement;
    await waitFor(() => expect(titleInput.value).toBe("Svelte"));
    await fireEvent.input(titleInput, { target: { value: "  " } });
    await fireEvent.submit(changeForm);
    expect(showErrorDialog).toHaveBeenCalledWith("Judul dan deskripsi kursus wajib diisi.");
    expect(update).not.toHaveBeenCalled();

    await fireEvent.input(titleInput, { target: { value: "Svelte Lanjutan" } });
    await fireEvent.input(screen.getByLabelText("Deskripsi Markdown"), {
      target: { value: "Materi baru" },
    });
    await fireEvent.submit(changeForm);
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(3, "Svelte Lanjutan", "Materi baru")
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();

    await rerender({ show: false, course, onClose, onChanged });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("leaves the course edit modal open when the update fails", async () => {
    const onClose = vi.fn();
    const onChanged = vi.fn();
    vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(false);
    });
    render(ChangeModal, { props: { show: true, course, onClose, onChanged } });

    await fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() =>
      expect((screen.getByRole("button", { name: "Simpan" }) as HTMLButtonElement).disabled).toBe(false)
    );
    expect(onChanged).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("requires a cover file and uploads a selected image", async () => {
    const onClose = vi.fn();
    const onChanged = vi.fn();
    const upload = vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(true);
    });
    render(ChangeCoverModal, { props: { show: true, course, onClose, onChanged } });

    await fireEvent.click(screen.getByRole("button", { name: "Unggah Sampul" }));
    expect(showErrorDialog).toHaveBeenCalledWith("Pilih berkas gambar sampul terlebih dahulu.");
    expect(upload).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();

    const image = new File(["cover"], "cover.png", { type: "image/png" });
    await fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [image] },
    });
    expect(screen.getByText("cover.png")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Unggah Sampul" }));
    await waitFor(() => expect(upload).toHaveBeenCalledWith(3, image));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("retains a selected cover on failure and permits closing without callbacks", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(false);
    });
    render(ChangeCoverModal, { props: { show: true, course } });

    await fireEvent.change(screen.getByLabelText("Pilih gambar sampul"), {
      target: { files: [] },
    });
    expect(screen.getByText("Pilih gambar")).toBeTruthy();
    await fireEvent.change(screen.getByLabelText("Pilih gambar sampul"), {
      target: { files: [new File(["cover"], "cover.png", { type: "image/png" })] },
    });
    await fireEvent.submit(document.querySelector<HTMLFormElement>("dialog form")!);
    await waitFor(() => expect((screen.getByRole("button", { name: "Unggah Sampul" }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.getByText("cover.png")).toBeTruthy();

    await fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
  });

  it("removes the cover dialog when it is closed", async () => {
    const { container, rerender } = render(ChangeCoverModal, { props: { show: true, course } });
    expect(container.querySelector("dialog")).not.toBeNull();

    await rerender({ show: false, course });
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("validates and creates new course content", async () => {
    const onClose = vi.fn();
    const onChanged = vi.fn();
    const add = vi.spyOn(coursesStore, "asyncSetIsContentAdd").mockImplementation(async () => {
      coursesStore.setIsContentAdded(true);
    });
    render(ContentModal, { props: { show: true, courseId: 3, onClose, onChanged } });

    const contentForm = document.querySelector<HTMLFormElement>("dialog form")!;
    await fireEvent.submit(contentForm);
    expect(showErrorDialog).toHaveBeenCalledWith("Judul materi dan tautan YouTube wajib diisi.");

    await fireEvent.input(screen.getByPlaceholderText("Contoh: Pengenalan Svelte"), {
      target: { value: "Pengenalan" },
    });
    await fireEvent.input(screen.getByPlaceholderText("https://www.youtube.com/watch?v=..."), {
      target: { value: "not a url" },
    });
    await fireEvent.submit(contentForm);
    expect(showErrorDialog).toHaveBeenLastCalledWith("Tautan video harus berupa URL yang valid.");
    expect(add).not.toHaveBeenCalled();

    await fireEvent.input(screen.getByPlaceholderText("https://www.youtube.com/watch?v=..."), {
      target: { value: "https://youtu.be/abc123" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Simpan Materi" }));
    await waitFor(() => expect(add).toHaveBeenCalledWith(3, "Pengenalan", "https://youtu.be/abc123"));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("updates an existing content item and does not close after a failed store action", async () => {
    const onClose = vi.fn();
    const onChanged = vi.fn();
    const update = vi.spyOn(coursesStore, "asyncSetIsContentChange").mockResolvedValue();
    render(ContentModal, { props: { show: true, courseId: 3, content, onClose, onChanged } });

    expect(screen.getByRole("heading", { name: "Ubah Materi" })).toBeTruthy();
    await fireEvent.input(screen.getByDisplayValue("Dasar Svelte"), {
      target: { value: "Materi diperbarui" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Simpan Materi" }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(12, "Materi diperbarui", "https://youtu.be/abc123")
    );
    expect(onChanged).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();
    await fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes a new content modal without optional callbacks", async () => {
    render(ContentModal, { props: { show: true, courseId: 3 } });
    await fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
  });
});
