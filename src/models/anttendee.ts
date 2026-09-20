import { v7 as uuidv7 } from "uuid";
import type { Flatten } from "../utils/type.js";
import type { ServerController } from "../controller/ServerController.js";
import type { connection } from "websocket";

type AttendeeParams = Flatten<Omit<Attendee, "uuid"> & { uuid?: string }>;

type OnStartCallRequestType =
  | {
      type: "who_am_i";
    }
  | {
      type: "start_call";
      target: string;
    }
  | {
      type: "create_offer" | "create_answer";
      target: string;
      sdp: any;
    }
  | {
      type: "ice_candidate";
      target: string;
      sdpMLineIndex: any;
      sdpMid: any;
      sdpCandidate: any;
    };

export class Attendee {
  // uuid này sẽ được hệ thống sinh ra hoặc từ user gửi lên. Nếu user gửi lên thì không cần trả về khi establish connection, nhưng nếu là server tạo thì server sẽ trả về uuid để người dùng tự biết mình được định danh thế nào trong hệ thống, tiện cho các setup kết nối sau này
  public readonly uuid: string;
  public readonly origin?: string; // URL hoặc địa chỉ IP của người tham dự
  public readonly name?: string; // Tên của người tham dự, có thể có hoặc không
  public readonly connection: connection;
  public readonly serverController: ServerController;

  constructor(params: AttendeeParams) {
    let finalUUID: string | undefined = params.uuid;

    if (!finalUUID) finalUUID = uuidv7();

    this.uuid = finalUUID;
    this.origin = params.origin;
    this.name = params.name;
    this.connection = params.connection;
    this.serverController = params.serverController;

    if (this.connection)
      this.connection.on("message", (message) => {
        // @ts-ignore
        const data: OnStartCallRequestType = JSON.parse(message.utf8Data);

        switch (data.type) {
          case "who_am_i": {
            this.connection.send(
              JSON.stringify({
                type: "who_am_i_response",
                data: this.uuid,
              }),
            );

            break;
          }
          case "start_call": {
            const target: string = data.target;

            if (this.serverController.isAttendeeExistsInHall(target))
              this.connection.send(
                JSON.stringify({
                  type: "start_call_response",
                  data: "The user is registered and ready for call",
                }),
              );
            else
              this.connection.send(
                JSON.stringify({
                  type: "start_call_response",
                  data: "The user is not registered and not ready for a call",
                }),
              );
            break;
          }
          case "create_offer": {
            const target: string = data.target;

            const attendeeToSendTo =
              this.serverController.isAttendeeExistsInHall(target);

            if (attendeeToSendTo)
              attendeeToSendTo?.connection.send(
                JSON.stringify({
                  type: "create_offer_relaying",
                  sender: this.uuid,
                  data: data.sdp,
                }),
              );

            break;
          }
          case "create_answer": {
            const target: string = data.target;

            const attendeeToSendTo =
              this.serverController.isAttendeeExistsInHall(target);

            if (attendeeToSendTo)
              attendeeToSendTo?.connection.send(
                JSON.stringify({
                  type: "opponent_answers",
                  sender: this.uuid,
                  data: data.sdp,
                }),
              );

            break;
          }
          case "ice_candidate": {
            const target: string = data.target;

            const attendeeToSendTo =
              this.serverController.isAttendeeExistsInHall(target);

            if (attendeeToSendTo) {
              attendeeToSendTo.connection.send(
                JSON.stringify({
                  type: "ice_candidate",
                  sender: this.uuid,
                  sdpMLineIndex: data.sdpMLineIndex,
                  sdpMid: data.sdpMid,
                  sdpCandidate: data.sdpCandidate,
                }),
              );
            }
            break;
          }
        }
      });
  }
}
