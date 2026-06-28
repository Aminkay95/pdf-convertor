import type { ProcessingMode } from "@/domain/conversion/types";

export type SafeTelemetryEvent = {
  name: "conversion_started" | "conversion_completed" | "conversion_failed" | "ocr_consent";
  mode?: ProcessingMode;
  pageType?: string;
  success?: boolean;
  latencyBucket?: "fast" | "normal" | "slow";
  confidenceBand?: "high" | "mixed" | "low";
};

const forbiddenKeys = ["file", "password", "description", "row", "cell", "account", "balance"];

export function assertSafeTelemetryEvent(event: SafeTelemetryEvent): SafeTelemetryEvent {
  const serialized = JSON.stringify(event).toLowerCase();
  if (forbiddenKeys.some((key) => serialized.includes(key))) {
    throw new Error("Telemetry event contains a forbidden sensitive key");
  }
  return event;
}

export function trackSafeEvent(event: SafeTelemetryEvent): void {
  assertSafeTelemetryEvent(event);
  if (process.env.NODE_ENV === "development") {
    console.info("safe telemetry", event);
  }
}
