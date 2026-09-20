import type { IStringified } from "websocket";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import { ServerController } from "./ServerController.js";
import type { AttendeeRepository } from "../repositories/AttendeeRepository.js";

const fakeConnection = {
  on: vi.fn(),
  sendUTF: vi.fn(),
  close: vi.fn(),
};

vi.spyOn(console, "log").mockImplementation(() => {});

const { onMock, sendMock, captured } = vi.hoisted(() => {
  const captured: Record<string, (req: any) => void> = {};
  const onMock = vi.fn((type: string, cb: (req: any) => void) => {
    captured[type] = cb; // lưu callback thay vì chạy ngay
  });
  const sendMock = vi.fn(
    (
      data: Buffer<ArrayBufferLike> | IStringified,
      cb?: (err?: Error) => void,
    ) => {},
  );
  return { onMock, sendMock, captured };
});

vi.mock("websocket", async (importOriginal) => {
  const actual = await importOriginal<typeof import("websocket")>();

  return {
    // Dùng function thường để làm constructor cho `new Socket()`
    server: vi.fn().mockImplementation(function (...args) {
      const realServer = new actual.server(...args);

      return { ...realServer, on: onMock, send: sendMock };
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

beforeEach(() => {
  onMock.mockClear();
  for (const k of Object.keys(captured)) delete captured[k];
});

describe("ServerController - port", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("constructor should use default port number", () => {
    const serverController = new ServerController();
    expect(serverController.port).toBe(1709);
  });

  it("constructor preserves port number of user", () => {
    const serverController = new ServerController({ port: PORT });
    expect(serverController.port).toBe(PORT);
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

    expect(serverController.port).toBe(PORT);
  });
});

describe("ServerController - onRequest", () => {
  let repositories: AttendeeRepository;
  let mockedAddAttendeeTo: Mock;
  let serverController: ServerController;

  beforeEach(() => {
    serverController = new ServerController();

    repositories = serverController["_repository"];

    mockedAddAttendeeTo = vi.spyOn(repositories, "addAttendeeTo");

    serverController.establish(); // tạo mocked server + gọi onMock
  });

  it("invokes connection.send when result.ok is $name", () => {
    const result = {
      ok: false,
      uuid: "nothing",
      connection: {
        send: sendMock,
      },
      error: "BLAH BLAH BLAH",
    };

    mockedAddAttendeeTo.mockReturnValueOnce(result);
    // tự bắn request giả để callback (nơi chứa addAttendeeTo) chạy
    captured["request"]?.({
      origin: "http://localhost",
      accept: vi.fn(() => fakeConnection),
      reject: vi.fn(),
    });

    expect(sendMock).toHaveBeenCalledWith(result.error);
  });

  it('should register newcomers to "default" Hall', () => {
    // tự bắn request giả để callback (nơi chứa addAttendeeTo) chạy
    captured["request"]?.({
      origin: "http://localhost",
      accept: vi.fn(() => fakeConnection),
      reject: vi.fn(),
    });

    expect(onMock).toHaveBeenCalled(); // on đã được gọi
    expect(repositories.getHallById("default")?.getAttendeesSize()).toBe(1);
    expect(mockedAddAttendeeTo).toHaveBeenCalledWith(
      expect.anything(),
      "default",
      false,
    );
  });
});
