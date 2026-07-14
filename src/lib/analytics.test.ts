import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";

describe("trackEvent", () => {
  afterEach(() => {
    delete window.umami;
  });

  it("forwards events when analytics is configured", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("reading_mode_changed", { mode: "journey" });

    expect(track).toHaveBeenCalledWith("reading_mode_changed", { mode: "journey" });
  });

  it("does nothing when analytics is disabled", () => {
    expect(() => trackEvent("library_search", { result_count: 0 })).not.toThrow();
  });
});
