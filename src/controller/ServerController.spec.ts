import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ServerController } from "./ServerController.js";

vi.mock("websocket", () => {
  return {
    // Dùng function thường để làm constructor cho `new Socket()`
    server: vi.fn().mockImplementation(function () {
      return {
        // Mock các method của socket server nếu code chính có gọi
        mount: vi.fn(),
        shutDown: vi.fn(),
      };
    }),
  };
});

const mockListen = vi.fn((port: number, callback?: () => void) => {
  if (callback) callback();
});

vi.mock("http", async () => {
  const actual = await vi.importActual<typeof import("http")>("http");
  return {
    ...actual,
    createServer: vi.fn(() => ({
      listen: mockListen,
      on: vi.fn(),
      close: vi.fn(),
      address: vi.fn(() => ({ port: 2004 })),
    })),
  };
});

const PORT = 2004;

describe("ServerController - port", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("constructor should use default port number", () => {
    const serverController = new ServerController();
    expect(serverController.get("port")).toBe(1709);
  });

  it("constructor preserves port number of user", () => {
    const serverController = new ServerController({ port: PORT });
    expect(serverController.get("port")).toBe(PORT);
  });

  it("establish function should use method option port number", () => {
    const serverController = new ServerController();
    const consoleSpy = vi.spyOn(console, "log");

    serverController.establish({ port: PORT });

    // 1. Kiểm tra listen được gọi đúng
    expect(mockListen).toHaveBeenCalledWith(PORT, expect.any(Function));

    // 2. Kiểm tra console.log khớp với Template String trong code gốc
    expect(consoleSpy).toHaveBeenCalledWith(
      `The application is listening on port: ${PORT}`,
    );

    expect(serverController.get("port")).toBe(PORT);
  });
});
