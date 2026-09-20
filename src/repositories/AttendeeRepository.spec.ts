import { Hall, HallManager } from "../models/hall.js";
import type { connection } from "websocket";
import { Attendee } from "../models/anttendee.js";

describe("AttendeeRepository", () => {
  describe("AttendeeRepository constructor - hallMap", () => {
    it("");
  });

  // describe("AttendeeRepository registerToHallWithSpecificAttendeeId", () => {
  //   // Các hall này nằm đâu vì sau mỗi lần chạy, cần làm mới danh sách Attendee
  //   let firstHall: Hall, secondHall: Hall, hallManager: AttendeeRepository;

  //   // attendee này đặt đây tại vì sau mỗi lần test, không cần làm mới dữ liệu
  //   const attendeeNeedRegister = new Attendee({
  //     uuid: "attendee",
  //     connection: null as unknown as connection,
  //   });

  //   beforeEach(() => {
  //     // hall id luc nay la v7
  //     firstHall = new Hall({
  //       attendees: [
  //         new Attendee({
  //           uuid: "attendee_1", // cái này là attendee id, khác với hall id nhé
  //           connection: null as unknown as connection,
  //         }),
  //       ],
  //     });

  //     secondHall = new Hall({
  //       attendees: [
  //         new Attendee({
  //           uuid: "attendee_2",
  //           connection: null as unknown as connection,
  //         }),
  //       ],
  //     });

  //     hallManager = new AttendeeRepository({ halls: [firstHall, secondHall] });
  //   });

  //   // Cái này test trường hợp không có hall nào
  //   it("return null when no attendee found in any halls.", () => {
  //     const idToRegister = "attendee_99";

  //     const foundHallId = hallManager.registerAttendeeToHallWithAttendeeId(
  //       idToRegister,
  //       attendeeNeedRegister,
  //     );

  //     expect(foundHallId).toBe(null);
  //   });

  //   // Cái này test trường hợp có đúng 1 hall, không cần predicate
  //   it("register attendee to one hall.", () => {
  //     const idToRegister = "attendee_1";

  //     const predicate = vi.fn();

  //     const foundHallId = hallManager.registerAttendeeToHallWithAttendeeId(
  //       idToRegister,
  //       attendeeNeedRegister,
  //       predicate,
  //     );

  //     expect(foundHallId).toBe(firstHall.uuid);
  //     expect(firstHall.getAttendeeById(attendeeNeedRegister.uuid)?.uuid).toBe(
  //       attendeeNeedRegister.uuid,
  //     );
  //     expect(predicate).not.toHaveBeenCalled();
  //   });

  //   // Happy case: Cái này test trường hợp có nhiều hơn 1 hall, lấy số 2 làm đại diện. Có nghĩa là 2 hall cùng chứa attendee_1
  //   // Tìm thấy hall và predicate không vấn đề
  //   it("predicate returns one hall", () => {
  //     const anotherHall: Hall = new Hall({
  //       attendees: [...firstHall.attendees.values()],
  //     });

  //     const hallManager = new AttendeeRepository({
  //       halls: [firstHall, anotherHall],
  //     });

  //     const predicate = vi.fn((hall: Hall) => hall.uuid === anotherHall.uuid);

  //     const foundHall = hallManager.registerAttendeeToHallWithAttendeeId(
  //       "attendee_1",
  //       attendeeNeedRegister,
  //       predicate,
  //     );

  //     expect(foundHall).toBe(anotherHall.uuid);
  //     expect(anotherHall.getAttendeeById(attendeeNeedRegister.uuid)).toBe(
  //       attendeeNeedRegister,
  //     );
  //     expect(predicate).toHaveBeenCalled();
  //   });

  //   // Tìm thấy hall nhưng predicate đang có vấn đề
  //   it.each([
  //     {
  //       name: "throw an Error when predicate is undefined",
  //       attendeeUUID: "attendee_1",
  //       expectedError:
  //         "Predicate must be given to select between Halls which have the same determined uuid.",
  //     },
  //     {
  //       name: "throws when predicate matches no halls",
  //       attendeeUUID: "attendee_1",
  //       predicate: () => false,
  //       expectedError: "No halls found after applying the predicate.",
  //     },
  //     {
  //       name: "throws when predicate matches multiple halls",
  //       attendeeUUID: "attendee_1", // Vẫn giữ nguyên attendee được tìm thấy
  //       predicate: () => true, // Nhưng sau khi dùng predicate, lại có hai hall khác
  //       expectedError:
  //         "Multiple halls remain after resolving the conflict. Please use a stricter predicate.",
  //     },
  //   ])("$name", ({ attendeeUUID, expectedError, predicate }) => {
  //     const anotherHall: Hall = new Hall({
  //       attendees: [...firstHall.attendees.values()],
  //     });

  //     const hallManager = new AttendeeRepository({
  //       halls: [firstHall, anotherHall],
  //     });

  //     expect(() =>
  //       hallManager.registerAttendeeToHallWithAttendeeId(
  //         attendeeUUID,
  //         attendeeNeedRegister,
  //         predicate,
  //       ),
  //     ).toThrow(expectedError);
  //   });
  // });
});
