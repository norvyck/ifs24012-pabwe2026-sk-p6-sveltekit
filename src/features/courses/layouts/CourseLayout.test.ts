import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseLayout from "./CourseLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import { mockGoto } from "../../../setupTests";

describe("CourseLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should navigate to /auth/login if no token on mount", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper } = renderWithProviders(CourseLayout, {
      preloadedState: { profile: null },
    });

    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should call asyncSetProfile on mount if token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { usersStore } = renderWithProviders(CourseLayout, {
      preloadedState: { profile: null },
    });

    expect(usersStore.asyncSetProfile).toBeDefined();
  });

  it("should render layout with navbar and sidebar when profile is loaded", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: { id: 1, name: "User Tes", email: "tes@delcom.org" },
      },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.text()).toContain("Semua Kursus");
    expect(wrapper.text()).toContain("User Tes");
  });

  it("should clear token and navigate to login when isProfile is true but profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(CourseLayout, {
      preloadedState: { profile: null, isProfile: false },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
  });

  it("should navigate to login when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { authStore } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        isAuthLogout: false,
      },
    });

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
  });

  it("should handle toggle sidebar and logout event handlers", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, authStore } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: { id: 1, name: "User Tes", email: "tes@delcom.org" },
      },
    });

    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockImplementation(async () => {});
    await wrapper.find('[data-testid="profile-dropdown-button"]').trigger("click");

    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);
    await wrapper.find('[data-testid="dropdown-logout-button"]').trigger("click");

    expect(logoutSpy).toHaveBeenCalled();
  });

});
