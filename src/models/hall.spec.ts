import { Hall, HallManager } from "./hall.js";
import { isUUIDv7 } from "../utils/string.js";
import { Attendee } from "./anttendee.js";
import type { connection, server } from "websocket";
import type { ServerController } from "../controller/ServerController.js";

vi.spyOn(console, "log").mockImplementation(() => {});

// Một số lưu ý khi test call một function xem có được gọi hay không thì về cơ bản, chúng ta đang muốn kiểm tra xem liệu hàm có đang sử dụng dependency đó hay không
// Còn test phía dưới là test theo behaviour, chúng ta đang hỏi là liệu constructor của Hall có tôn trọng, bảo vệ tham số truyền vào của người dùng hay không
describe("Hall", () => {
  describe("Hall constructor - uuid", () => {
    it("generates a UUIDv7 when uuid is not provided", () => {
      const hall = new Hall();

      expect(isUUIDv7(hall.uuid)).toBe(true);
    });

    it("uses the caller-provided uuid as-is", () => {
      const hall = new Hall({ uuid: "abc" });

      expect(hall.uuid).toBe("abc");
    });
  });

  describe("Hall constructor - attendees", () => {
    it("starts with no attendees when none are provided", () => {
      const hall = new Hall();

      expect(hall.attendees.size).toBe(0);
    });

    it("registers provided attendees", () => {
      const attendees = [
        new Attendee({
          uuid: "attendee_1",
          connection: null as unknown as connection,
          serverController: null as unknown as ServerController,
        }),
        new Attendee({
          uuid: "attendee_2",
          connection: null as unknown as connection,
          serverController: null as unknown as ServerController,
        }),
      ];

      const hall = new Hall({ attendees });

      expect(hall.attendees.size).toBe(attendees.length);

      for (const attendee of attendees) {
        expect(hall.getAttendeeById(attendee.uuid)).toBe(attendee);
        expect(hall.getAttendeeById(attendee.uuid)).toEqual(attendee);
      }
    });
  });

  describe("Hall deregister", () => {
    it.each([
      {
        name: "an Attendee object",
        getInput: (attendee: Attendee) => attendee,
      },
      {
        name: "an attendee uuid",
        getInput: (attendee: Attendee) => attendee.uuid,
      },
    ])("$name", ({ getInput }) => {
      const attendee = new Attendee({
        connection: null as unknown as connection,
        serverController: null as unknown as ServerController,
      });
      const hall = new Hall({
        attendees: [attendee],
      });
      const input = getInput(attendee);

      expect(hall.deregister(input)).toBe(true);
      expect(hall.getAttendeeById(attendee.uuid)).toBe(null);
      expect(hall.attendees.size).toBe(0);
    });
  });
});

describe("HallManager", () => {
  describe("HallManager constructor - hallMap", () => {
    it('automatically generates hall with uuid of "default"', () => {
      const halls = [
        new Hall({
          uuid: "hall_1",
        }),
        new Hall({
          uuid: "hall_2",
        }),
      ];

      const hallManager = new HallManager({ halls });

      expect(hallManager.getHallsSize()).toBe(halls.length + 1);

      for (const hall of halls) {
        expect(hallManager.getHallById(hall.uuid)).toBe(hall);
        expect(hallManager.getHallById(hall.uuid)).toEqual(hall);
      }

      expect(hallManager.getHallById("default")).not.toBe(null);
    });

    it('automatically generates hall with uuid of "default" without giving any halls array', () => {
      const hallManager = new HallManager();

      expect(hallManager.getHallsSize()).toBe(1);

      expect(hallManager.getHallById("default")).not.toBe(null);
    });

    it("registers provided halls to the hall manager", () => {
      const halls = [
        new Hall({
          uuid: "default",
        }),
        new Hall({
          uuid: "hall_1",
        }),
        new Hall({
          uuid: "hall_2",
        }),
      ];

      const hallManager = new HallManager({ halls });

      expect(hallManager.getHallsSize()).toBe(halls.length);

      for (const hall of halls) {
        expect(hallManager.getHallById(hall.uuid)).toBe(hall);
        expect(hallManager.getHallById(hall.uuid)).toEqual(hall);
      }
    });
  });

  describe("registerAttendeeTo", () => {
    let hallManager: HallManager;
    const attendeeNeedRegister = new Attendee({
      uuid: "attendee",
      connection: null as unknown as connection,
      serverController: null as unknown as ServerController,
    });
    // attendee khác để "gieo" sẵn hall mà không đụng uuid "attendee"
    const seedAttendee = new Attendee({
      uuid: "seed",
      connection: null as unknown as connection,
      serverController: null as unknown as ServerController,
    });

    beforeEach(() => {
      hallManager = new HallManager();
      // Tạo sẵn "first_hall" qua chính API (create = true) để test nhánh hall đã tồn tại
      hallManager.registerAttendeeTo("first_hall", seedAttendee, true);
    });

    it.each([
      {
        name: "trả về false khi hall không tồn tại và create = false",
        hallUUID: "khong_ton_tai",
        create: false,
        expected: {
          ok: false,
          connection: null,
          name: undefined,
          origin: undefined,
          uuid: "attendee",
          error: "Could not find any hall uuid that matches khong_ton_tai",
        },
      },
      {
        name: "trả về true khi hall không tồn tại nhưng create = true (tạo mới)",
        hallUUID: "anonymous_hall",
        create: true,
        expected: {
          ok: true,
          connection: null,
          name: undefined,
          origin: undefined,
          uuid: "attendee",
        },
      },
      {
        name: "trả về true khi hall đã tồn tại và create = false",
        hallUUID: "first_hall",
        create: false,
        expected: {
          ok: true,
          connection: null,
          name: undefined,
          origin: undefined,
          uuid: "attendee",
        },
      },
    ])("$name", ({ hallUUID, create, expected }) => {
      const result = hallManager.registerAttendeeTo(
        hallUUID,
        attendeeNeedRegister,
        create,
      );
      expect(result).toEqual(expected);
    });

    it("trả về false khi attendee đã tồn tại trong hall", () => {
      // Đăng ký lần đầu -> ok
      const first = hallManager.registerAttendeeTo(
        "first_hall",
        attendeeNeedRegister,
      );
      expect(first.ok).toBe(true);

      // Đăng ký lại cùng attendee -> thất bại
      const second = hallManager.registerAttendeeTo(
        "first_hall",
        attendeeNeedRegister,
      );

      expect(second).toEqual({
        ok: false,
        connection: null,
        name: undefined,
        origin: undefined,
        uuid: "attendee",
        error:
          "Attendee with uuid of attendee has already existed in hall first_hall. Please try a new attendee",
      });
    });
  });

  describe("HallManager registerToHallWithSpecificAttendeeId", () => {
    // Các hall này nằm đâu vì sau mỗi lần chạy, cần làm mới danh sách Attendee
    let firstHall: Hall, secondHall: Hall, hallManager: HallManager;

    // attendee này đặt đây tại vì sau mỗi lần test, không cần làm mới dữ liệu
    const attendeeNeedRegister = new Attendee({
      uuid: "attendee",
      serverController: null as unknown as ServerController,

      connection: null as unknown as connection,
    });

    beforeEach(() => {
      // hall id luc nay la v7
      firstHall = new Hall({
        attendees: [
          new Attendee({
            uuid: "attendee_1", // cái này là attendee id, khác với hall id nhé
            serverController: null as unknown as ServerController,

            connection: null as unknown as connection,
          }),
        ],
      });

      secondHall = new Hall({
        attendees: [
          new Attendee({
            uuid: "attendee_2",
            serverController: null as unknown as ServerController,

            connection: null as unknown as connection,
          }),
        ],
      });

      hallManager = new HallManager({ halls: [firstHall, secondHall] });
    });

    // Cái này test trường hợp không có hall nào
    it("return null when no attendee found in any halls.", () => {
      const idToRegister = "attendee_99";

      const foundHallId =
        hallManager.registerAttendeeToAHallWithSpecificAttendeeId(
          idToRegister,
          attendeeNeedRegister,
        );

      expect(foundHallId).toBe(null);
    });

    // Cái này test trường hợp có đúng 1 hall, không cần predicate
    it("register attendee to one hall.", () => {
      const idToRegister = "attendee_1";

      const predicate = vi.fn();

      const foundHallId =
        hallManager.registerAttendeeToAHallWithSpecificAttendeeId(
          idToRegister,
          attendeeNeedRegister,
          predicate,
        );

      expect(foundHallId).toBe(firstHall.uuid);
      expect(firstHall.getAttendeeById(attendeeNeedRegister.uuid)?.uuid).toBe(
        attendeeNeedRegister.uuid,
      );
      expect(predicate).not.toHaveBeenCalled();
    });

    // Happy case: Cái này test trường hợp có nhiều hơn 1 hall, lấy số 2 làm đại diện. Có nghĩa là 2 hall cùng chứa attendee_1
    // Tìm thấy hall và predicate không vấn đề
    it("predicate returns one hall", () => {
      const anotherHall: Hall = new Hall({
        attendees: [...firstHall.attendees.values()],
      });

      const hallManager = new HallManager({ halls: [firstHall, anotherHall] });

      const predicate = vi.fn((hall: Hall) => hall.uuid === anotherHall.uuid);

      const foundHall =
        hallManager.registerAttendeeToAHallWithSpecificAttendeeId(
          "attendee_1",
          attendeeNeedRegister,
          predicate,
        );

      expect(foundHall).toBe(anotherHall.uuid);
      expect(anotherHall.getAttendeeById(attendeeNeedRegister.uuid)).toBe(
        attendeeNeedRegister,
      );
      expect(predicate).toHaveBeenCalled();
    });

    // Tìm thấy hall nhưng predicate đang có vấn đề
    it.each([
      {
        name: "throw an Error when predicate is undefined",
        attendeeUUID: "attendee_1",
        expectedError:
          "Predicate must be given to select between Halls which have the same determined uuid.",
      },
      {
        name: "throws when predicate matches no halls",
        attendeeUUID: "attendee_1",
        predicate: () => false,
        expectedError: "No halls found after applying the predicate.",
      },
      {
        name: "throws when predicate matches multiple halls",
        attendeeUUID: "attendee_1", // Vẫn giữ nguyên attendee được tìm thấy
        predicate: () => true, // Nhưng sau khi dùng predicate, lại có hai hall khác
        expectedError:
          "Multiple halls remain after resolving the conflict. Please use a stricter predicate.",
      },
    ])("$name", ({ attendeeUUID, expectedError, predicate }) => {
      const anotherHall: Hall = new Hall({
        attendees: [...firstHall.attendees.values()],
      });

      const hallManager = new HallManager({
        halls: [firstHall, anotherHall],
      });

      expect(() =>
        hallManager.registerAttendeeToAHallWithSpecificAttendeeId(
          attendeeUUID,
          attendeeNeedRegister,
          predicate,
        ),
      ).toThrow(expectedError);
    });
  });

  describe("HallManager getSizeOf", () => {
    it.each([
      {
        name: "returns -1 on non-existed hall uuid",
        id: "nothing",
        expected: -1,
      },
      {
        name: "returns 2 existed hall uuid",
        id: "default",
        expected: 2,
      },
    ])("$name", ({ id, expected }) => {
      const halls = [
        new Hall({
          uuid: "default",
          attendees: [
            new Attendee({
              connection: null as unknown as connection,
              serverController: null as unknown as ServerController,
            }),
            new Attendee({
              connection: null as unknown as connection,
              serverController: null as unknown as ServerController,
            }),
          ],
        }),
        new Hall({
          uuid: "hall_1",
        }),
        new Hall({
          uuid: "hall_2",
        }),
      ];

      const hallManager = new HallManager({ halls });

      expect(hallManager.getSizeOf(id)).toBe(expected);
    });
  });
});
