import type { Hall } from "../models/hall.js";
import type { Attendee } from "../models/anttendee.js";

export class AntendeeRepository {
  private readonly _hallPool: Map<string, Hall>;
  private readonly _unregisteredAttendee: Map<string, Attendee>;

  constructor(params?: { halls?: Hall[]; attendees?: Attendee[] }) {
    this._hallPool = new Map<string, Hall>();
    this._unregisteredAttendee = new Map<string, Attendee>();

    if (params && params.halls && params.halls.length > 0)
      for (const hall of params.halls) this.addHall(hall);

    if (params && params.attendees && params.attendees.length > 0)
      for (const attandee of params.attendees) this.addAttendee(attandee);
  }

  addHall(hall: Hall) {
    const foundHall = this._hallPool.get(hall.uuid);

    if (foundHall) throw new Error("Duplicated hall uuid has been found.");

    this._hallPool.set(hall.uuid, hall);
  }

  // put attendee into the queue of unregistered Attendee
  addAttendee(attendee: Attendee) {
    const foundAttendee = this._unregisteredAttendee.get(attendee.uuid);

    if (foundAttendee)
      throw new Error("Duplicated attendee uuid has been found.");

    this._unregisteredAttendee.set(attendee.uuid, attendee);
  }

  /**
   * This function will return either unregistered attendee total size or hall's attendees list total size.
   * Pass in "unreg" to get total number of attendees in unregistered attendees list. Otherwise, pass in any string as an uuid for specific hall to retrieve total number from.
   * If this function returns -1 means it could not find any hall with the given uuid.
   * @param uuid
   * @returns
   */
  getAttendeeSizeOf(uuid: string): number {
    if (uuid === "unreg") return this._unregisteredAttendee.size;

    const foundHall = this._hallPool.get(uuid);

    return foundHall?.getSize() || -1;
  }

  getHallById(uuid: string): Hall | null {
    return this._hallPool.get(uuid) || null;
  }

  getHallPoolSize() {
    // each instance of this repository class has only one hall pool
    return this._hallPool.size;
  }
}

// /**
//    * This function registers an attendee A to a Hall which has a specific attendee B id.
//    * If two or more matching attendees are found in different Halls, this function will use predicate to resolve the conflicts
//    * @param uuid UUID of attendee you want
//    * @returns A uuid string of Hall to which the attendee want to register
//    */
//   registerAttendeeToHallWithAnotherAttendeeId(
//     uuid: string,
//     attendee: Attendee,
//     predicate?: (hall: Hall) => boolean,
//   ): string | null {
//     const foundHalls: Hall[] = [...this._hallPool.values()].filter(
//       (hall) => hall.getAttendeeById(uuid) !== null,
//     ); // this should never be less than 0

//     switch (foundHalls.length) {
//       case 0:
//         return null;

//       case 1:
//         const hallToRegisterTo = foundHalls[0]!;
//         hallToRegisterTo.register(attendee);

//         return hallToRegisterTo.uuid;

//       default: {
//         // Khi nhiều hơn 1
//         if (!predicate)
//           throw new Error(
//             "Predicate must be given to select between Halls which have the same determined uuid.",
//           );

//         const hallToRegisterTo = foundHalls.filter(predicate);

//         if (hallToRegisterTo && hallToRegisterTo.length < 1)
//           throw new Error("No halls found after applying the predicate.");

//         if (hallToRegisterTo.length > 1)
//           throw new Error(
//             "Multiple halls remain after resolving the conflict. Please use a stricter predicate.",
//           );

//         hallToRegisterTo[0]!.register(attendee);

//         return hallToRegisterTo[0]!.uuid;
//       }
//     }
//   }
