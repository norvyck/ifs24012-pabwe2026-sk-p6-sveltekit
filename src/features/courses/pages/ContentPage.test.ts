import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentPage from "./ContentPage.svelte";
import coursesStore from "../states/coursesStore";
import { setupMockStores } from "../../../test-utils";
import { updateMockPage } from "../../../setupTests";

const content = {
  id: 12,
  course_id: 3,
  title: "Dasar Svelte",
  youtube: "https://www.youtube.com/watch?v=abc123",
  my_status_finished: false,
};
const course = {
  id: 3,
  user_id: 1,
  title: "Svelte",
  description: "Belajar Svelte",
  students: [2],
};

describe("ContentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStores({ profile: { id: 2, name: "Peserta" } });
    updateMockPage({ params: { contentId: "12" } });
    vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(async () => {
      coursesStore.setContent(content);
    });
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse(course);
    });
  });

  it("loads a video and lets an enrolled student mark it complete", async () => {
    const refresh = vi.spyOn(coursesStore, "asyncSetCourse");
    const markFinished = vi.spyOn(coursesStore, "asyncSetIsContentStatusChange").mockImplementation(async () => {
      coursesStore.setIsContentStatusChanged(true);
    });
    render(ContentPage);

    expect(await screen.findByRole("heading", { name: "Dasar Svelte" })).toBeTruthy();
    expect(screen.getByTitle("Dasar Svelte").getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123"
    );

    await fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    await waitFor(() => expect(markFinished).toHaveBeenCalledWith(12, 1));
    expect(screen.getByText("Materi ini sudah selesai dipelajari.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tandai belum selesai" })).toBeTruthy();
    expect(refresh).toHaveBeenCalledWith(3);
  });

  it("renders an unrecognized video URL as an external link", async () => {
    vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(async () => {
      coursesStore.setContent({ ...content, youtube: "not a url" });
    });
    render(ContentPage);

    expect(await screen.findByText(/Tautan video tidak dapat dikenali/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Buka video/ }).getAttribute("href")).toBe("not a url");
  });

  it("supports short links and video paths without a query parameter", async () => {
    vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(async () => {
      coursesStore.setContent({ ...content, youtube: "https://youtu.be/short-id" });
    });
    const { rerender } = render(ContentPage);
    expect((await screen.findByTitle("Dasar Svelte")).getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/short-id"
    );

    vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(async () => {
      coursesStore.setContent({ ...content, youtube: "https://youtube.com/embed/path-id" });
    });
    updateMockPage({ params: { contentId: "13" } });
    await waitFor(() => {
      expect(screen.getByTitle("Dasar Svelte").getAttribute("src")).toBe(
        "https://www.youtube-nocookie.com/embed/path-id"
      );
    });
  });

  it("keeps the current status when a status update fails or no content id is available", async () => {
    const { unmount } = render(ContentPage);
    expect(await screen.findByRole("button", { name: "Tandai selesai" })).toBeTruthy();
    vi.spyOn(coursesStore, "asyncSetIsContentStatusChange").mockImplementation(async () => {
      coursesStore.setIsContentStatusChanged(false);
    });
    await fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    expect(screen.getByText("Tandai selesai setelah menonton materi.")).toBeTruthy();
    unmount();

    updateMockPage({ params: {} });
    render(ContentPage);
    expect(screen.getByText("Memuat materi...")).toBeTruthy();
  });

  it("shows the missing-content state when the related course cannot be loaded", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {
      coursesStore.setCourse(null);
    });
    render(ContentPage);

    expect(await screen.findByRole("heading", { name: "Materi tidak ditemukan" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tandai selesai" })).toBeNull();
  });

  it("does not render learning controls for a user who is not enrolled", async () => {
    setupMockStores({ profile: { id: 8, name: "Pengunjung" } });
    render(ContentPage);

    expect(await screen.findByRole("heading", { name: "Dasar Svelte" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tandai selesai" })).toBeNull();
  });
});
