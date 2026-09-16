import { Hall } from "./hall.js";
import { isUUIDv7 } from "../utils/string.js";
import { Attendee } from "./anttendee.js";
import type { connection } from "websocket";

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
        }),
        new Attendee({
          uuid: "attendee_2",
          connection: null as unknown as connection,
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
