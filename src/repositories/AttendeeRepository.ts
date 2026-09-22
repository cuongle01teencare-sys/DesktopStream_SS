import { HallManager, type Hall } from "../models/hall.js";
import type { Attendee } from "../models/anttendee.js";

export class AttendeeRepository {
  private readonly _hallPool: HallManager;

  constructor(params?: { halls?: Hall[]; attendees?: Attendee[] }) {
    this._hallPool = new HallManager();

    if (params && params.halls && params.halls.length > 0)
      for (const hall of params.halls) this.addHall(hall);

    if (params && params.attendees && params.attendees.length > 0)
      for (const attandee of params.attendees) this.addAttendeeTo(attandee);
  }

  removeAttendeeFromHall(attendeeUUID: string, hallUUID: string = "default") {
    const hall = this._hallPool.getHallById(hallUUID);

    if (hall) hall.deregister(attendeeUUID);
  }

  addHall(hall: Hall): boolean {
    try {
      this._hallPool.addHall(hall);

      return true;
    } catch (e) {
      throw e;
    }
  }

  // put attendee into the queue of unregistered Attendee
  addAttendeeTo(
    attendee: Attendee,
    hallUUID: string = "default",
    create: boolean = false,
  ) {
    return this._hallPool.registerAttendeeTo(hallUUID, attendee, create);
  }

  /**
   * This function will return either unregistered attendee total size or hall's attendees list total size.
   * Pass in "default" to get total number of attendees in unregistered attendees list. Otherwise, pass in any string as an uuid for specific hall to retrieve total number from.
   * If this function returns -1 means it could not find any hall with the given uuid.
   * @param uuid
   * @returns
   */
  getAttendeesSizeOf(uuid: string = "default"): number {
    return this._hallPool.getSizeOf(uuid);
  }

  getHallById(uuid: string = "default"): Hall | null {
    return this._hallPool.getHallById(uuid);
  }

  getHallPoolSize() {
    return this._hallPool.getHallsSize();
  }
}
