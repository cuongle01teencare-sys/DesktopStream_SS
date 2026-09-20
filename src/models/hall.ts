// File này hoạt động như là một hội trường, giành cho các client muốn giao tiếp với nhau trong cùng một phòng

import { v7 } from "uuid";
import { Attendee } from "./anttendee.js";
import type { connection } from "websocket";

type BaseReturn = {
  uuid: string;
  connection: connection;
};

export type RegisterAttendeeReturnType =
  | (BaseReturn & { ok: true })
  | (BaseReturn & { ok: false; error: string });

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

  bulkRegister(attendees: Attendee[]): boolean {
    for (const attandee of attendees) {
      this.attendees.set(attandee.uuid, attandee);
    }

    return true;
  }

  register(attendee: Attendee): boolean {
    this.attendees.set(attendee.uuid, attendee);
    return true;
  }

  deregister(attandee: Attendee | string): boolean {
    let toBeDeleted: string;

    if (typeof attandee !== "string") toBeDeleted = attandee.uuid;
    else toBeDeleted = attandee;

    return this.attendees.delete(toBeDeleted);
  }

  getAttendeesSize(): number {
    return this.attendees.size;
  }

  getAttendeeById(uuid: string): Attendee | null {
    return this.attendees.get(uuid) || null;
  }
}

export class HallManager {
  private readonly _hallMap: Map<string, Hall>;

  constructor(params?: { halls?: Hall[] }) {
    let foundDefaut = false;

    this._hallMap = new Map<string, Hall>();
    if (params && params.halls && params.halls.length > 0)
      for (const hall of params.halls) {
        if (hall.uuid === "default") foundDefaut = true;
        this._hallMap.set(hall.uuid, hall);
      }

    if (!foundDefaut) {
      console.log(
        "Could not find any default Hall. Auto generated a default hall or you can use your own by including a default hall inside params.halls array.",
      );
      this._hallMap.set("default", new Hall({ uuid: "default" }));
    }
  }

  registerAttendeeTo(
    hallId: string,
    attandee: Attendee,
    create: boolean = false,
  ): RegisterAttendeeReturnType {
    const hall = this._hallMap.get(hallId);

    // Nếu như không tìm thấy mà create là true thì tạo mới
    // Nếu như không tìm thấy mà create là false thì không tạo mới
    if (!hall)
      if (create) {
        // Không tìm thấy
        // Nếu create là true
        const newHall = new Hall({ uuid: hallId });
        newHall.register(attandee);
        this._hallMap.set(newHall.uuid, newHall);

        return {
          ok: true,
          uuid: attandee.uuid,
          connection: attandee.connection,
        };
      } else
        return {
          ok: false,
          uuid: attandee.uuid,
          connection: attandee.connection,
          error: `Could not find any hall uuid that matches ${hallId}`,
        };

    if (hall.getAttendeeById(attandee.uuid))
      return {
        ok: false,
        uuid: attandee.uuid,
        connection: attandee.connection,
        error: `Attendee with uuid of ${attandee.uuid} has already existed in hall ${hallId}. Please try a new attendee`,
      };

    hall.register(attandee);

    return {
      ok: true,
      uuid: attandee.uuid,
      connection: attandee.connection,
    };
  }

  /**
   * This function registers an attendee A to a Hall which has a specific attendee B id.
   * If two or more matching attendees are found in different Halls, this function will use predicate to resolve the conflicts
   * @param uuid UUID of attendee you want
   * @returns A uuid string of Hall to which the attendee want to register
   */
  registerAttendeeToAHallWithSpecificAttendeeId(
    uuid: string,
    attendee: Attendee,
    predicate?: (hall: Hall) => boolean, // Sau này phải hỗ trợ onConflict. Tức là cho phép user nhập vào logic, cách mà họ giải quyết mâu thuẫn thay vì bắt họ ép chọn 1 trong các mâu thuẫn đó
    // Một số possible options có thể là: "Cascase", "Deaf", ...
  ): string | null {
    const foundHalls: Hall[] = [...this._hallMap.values()].filter(
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

  addHall(hall: Hall) {
    if (this._hallMap.get(hall.uuid))
      throw new Error("Duplicated hall uuid has been found.");

    this._hallMap.set(hall.uuid, hall);
  }

  getHallById(uuid: string = "default"): Hall | null {
    return this._hallMap.get(uuid) || null;
  }

  getHallsSize() {
    return this._hallMap.size;
  }

  getSizeOf(uuid: string = "default") {
    return this.getHallById(uuid)?.getAttendeesSize() || -1;
  }
}
