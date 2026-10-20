import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarComponent from "./SidebarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation items with Semus Kursus active on /", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      route: "/",
      props: {
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Semua Kursus");
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should navigate when a nav link is clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      route: "/",
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const links = wrapper.findAll("a");
    const usersLink = links.find((l: any) => l.text().includes("Semua Pengguna"));
    expect(usersLink).toBeDefined();

    if (usersLink?.element) {
      usersLink.element.click();
      await new Promise((r) => setTimeout(r, 0));
    }

    expect(mockGoto).toHaveBeenCalledWith("/users");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close mobile sidebar on backdrop click and Escape key", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);

    if (backdrop.element) {
      backdrop.element.click();
      await new Promise((r) => setTimeout(r, 0));
    }
    expect(closeSpy).toHaveBeenCalled();

    // Keydown other key
    if (backdrop.element) {
      backdrop.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await new Promise((r) => setTimeout(r, 0));
    }

    // Keydown Escape
    if (backdrop.element) {
      backdrop.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise((r) => setTimeout(r, 0));
    }
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle navigation when onCloseMobile is not provided", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const links = wrapper.findAll("a");
    const profileLink = links.find((l: any) => l.text().includes("Profil Saya"));
    if (profileLink?.element) {
      profileLink.element.click();
      await new Promise((r) => setTimeout(r, 0));
    }

    expect(mockGoto).toHaveBeenCalledWith("/profile");

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    if (backdrop.element) {
      backdrop.element.click();
      backdrop.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    }
  });
});
