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

  getSize() {
    return this.attendees.size;
  }

  getAttendeeById(uuid: string): Attendee | null {
    return this.attendees.get(uuid) || null;
  }
}
