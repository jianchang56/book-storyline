import { afterEach, describe, expect, it, vi } from "vitest";
import { sendServiceWorkerMessage } from "@/lib/service-worker-client";

class FakeMessageChannel {
  port1 = {
    close: vi.fn(),
    onmessage: null as ((event: MessageEvent<unknown>) => void) | null,
  };

  port2 = {
    reply: (data: unknown) => {
      this.port1.onmessage?.({ data } as MessageEvent<unknown>);
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("service worker client", () => {
  it("times out while waiting for a worker to become ready", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { setTimeout, clearTimeout });
    vi.stubGlobal("navigator", { serviceWorker: { ready: new Promise(() => undefined) } });
    vi.stubGlobal("MessageChannel", FakeMessageChannel);

    const response = sendServiceWorkerMessage({ type: "GET_CACHE_STATUS" }, 100);
    const rejection = expect(response).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(100);

    await rejection;
  });

  it("uses the active worker and resolves its reply", async () => {
    const worker = {
      postMessage: vi.fn((_message: unknown, ports: FakeMessageChannel["port2"][]) => {
        ports[0]?.reply({ ok: true });
      }),
    };
    vi.stubGlobal("window", { setTimeout, clearTimeout });
    vi.stubGlobal("navigator", {
      serviceWorker: { ready: Promise.resolve({ active: worker }) },
    });
    vi.stubGlobal("MessageChannel", FakeMessageChannel);

    await expect(sendServiceWorkerMessage<{ ok: boolean }>({ type: "PING" })).resolves.toEqual({
      ok: true,
    });
    expect(worker.postMessage).toHaveBeenCalledOnce();
  });
});
