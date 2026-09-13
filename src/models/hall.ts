// File này hoạt động như là một hội trường, giành cho các client muốn giao tiếp với nhau trong cùng một phòng

import { v7 } from "uuid";
import type { Attendee } from "./anttendee.js";

export class Hall {
  // 1. Một danh sách các connector/attandee
  public readonly uuid: string; // Hall Id
  public readonly attendees: Map<string, Attendee>;

  constructor(params?: { uuid?: string; attendees?: Attendee[] }) {
    let finalUUID: string | undefined = params?.uuid;

    if (!finalUUID) finalUUID = v7();

    this.uuid = finalUUID;
    this.attendees = new Map<string, Attendee>();

    if (params && params.attendees && params.attendees.length > 0)
      this.bulkRegister(params.attendees);
  }

  bulkRegister(attendees: Attendee[]): void {
    for (const attandee of attendees) {
      this.attendees.set(attandee.uuid, attandee);
    }
  }

  register(attendee: Attendee): void {
    this.attendees.set(attendee.uuid, attendee);
  }

  deregister(attandee: Attendee | string): boolean {
    let toBeDeleted: string;

    if (typeof attandee !== "string") toBeDeleted = attandee.uuid;
    else toBeDeleted = attandee;

    return this.attendees.delete(toBeDeleted);
  }

  getAttendeeById(uuid: string): Attendee | null {
    return this.attendees.get(uuid) || null;
  }
}

export class HallManager {
  public readonly hallMap: Map<string, Hall>;

  constructor(params?: { halls?: Hall[] }) {
    this.hallMap = new Map<string, Hall>();
    if (params && params.halls && params.halls.length > 0)
      for (const hall of params.halls) this.hallMap.set(hall.uuid, hall);
  }

  /**
   * This function registers an attendee A to a Hall which has a specific attendee B id.
   * If two or more matching attendees are found in different Halls, this function will use predicate to resolve the conflicts
   * @param uuid UUID of attendee you want
   * @returns A uuid string of Hall to which the attendee want to register
   */
  registerToHallWithSpecificAttendeeId(
    uuid: string,
    attendee: Attendee,
    predicate?: (hall: Hall) => boolean,
  ): string | null {
    const foundHalls: Hall[] = [...this.hallMap.values()].filter(
      (hall) => hall.getAttendeeById(uuid) !== null,
    ); // this should never be less than 0

    switch (foundHalls.length) {
      case 0:
        return null;

      case 1:
        const hallToRegisterTo = foundHalls[0]!;
        hallToRegisterTo.register(attendee);

        return hallToRegisterTo.uuid;

      default: {
        // Khi nhiều hơn 1
        if (!predicate)
          throw new Error(
            "Predicate must be given to select between Halls which have the same determined uuid.",
          );

        const hallToRegisterTo = foundHalls.filter(predicate);

        if (hallToRegisterTo && hallToRegisterTo.length < 1)
          throw new Error("No halls found after applying the predicate.");

        if (hallToRegisterTo.length > 1)
          throw new Error(
            "Multiple halls remain after resolving the conflict. Please use a stricter predicate.",
          );

        hallToRegisterTo[0]!.register(attendee);

        return hallToRegisterTo[0]!.uuid;
      }
    }
  }

  getHallById(uuid: string): Hall | null {
    return this.hallMap.get(uuid) || null;
  }
}
