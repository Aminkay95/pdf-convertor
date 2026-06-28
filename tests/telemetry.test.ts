import { describe, expect, it } from "vitest";
import { assertSafeTelemetryEvent } from "@/adapters/telemetry/safeTelemetry";

describe("safe telemetry", () => {
  it("allows aggregate conversion events", () => {
    expect(
      assertSafeTelemetryEvent({
        name: "conversion_completed",
        mode: "local",
        success: true,
        latencyBucket: "fast"
      })
    ).toMatchObject({ name: "conversion_completed" });
  });

  it("rejects sensitive event keys", () => {
    expect(() =>
      assertSafeTelemetryEvent({
        name: "conversion_failed",
        pageType: "file-name-leak"
      })
    ).toThrow("forbidden");
  });
});
