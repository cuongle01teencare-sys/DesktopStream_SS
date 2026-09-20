import * as http from "http";
import { server as Socket } from "websocket";
import { Attendee } from "../models/anttendee.js";
import { AttendeeRepository } from "../repositories/AttendeeRepository.js";

export class ServerController {
  // supports both REST API and WebSocket communication mechanisms, good to name the class as ServerController
  private _port: number;
  private _httpServer: ReturnType<typeof http.createServer> | null = null;
  private _socketServer: Socket | null = null;
  private readonly _repository: AttendeeRepository;

  constructor({ port }: { port: number } = { port: 1709 }) {
    this._port = port;
    this._repository = new AttendeeRepository();
  }

  get isEstablished() {
    return this._socketServer && this._httpServer;
  }

  get port() {
    return this._port;
  }

  isAttendeeExistsInHall(attendeeUUID: string, hallUUID: string = "default") {
    return (
      this._repository.getHallById(hallUUID)?.getAttendeeById(attendeeUUID) ||
      null
    );
  }

  private _onRequest() {
    if (!this.isEstablished)
      throw new Error(
        "Initiating connections failed. Please establish the server first by using ServerController.establish function",
      );

    this._socketServer!.on("request", (request) => {
      const origin = request.origin;
      const connection = request.accept();

      const newAttendee = new Attendee({
        connection,
        origin,
        serverController: this,
      });

      const result = this._repository.addAttendeeTo(
        newAttendee,
        "default",
        false,
      );

      if (!result.ok) result.connection.send(result.error);

      console.log(
        "New attendee arrives. Total number of attendees increased to : ",
        this._repository.getAttendeesSizeOf(),
      );
    });
  }

  // Function sẽ ưu tiên lấy port đang truyền vao function establish này
  // hơn so với port được truyền vào lúc khởi tạo một instance mới
  establish(param?: { port?: number }) {
    if (param?.port) this._port = param?.port;

    this._httpServer = http.createServer();
    this._httpServer.listen(this._port, () => {
      console.log(`The application is listening on port: ${this._port}`);
    });

    this._socketServer = new Socket({ httpServer: this._httpServer });

    this._onRequest();
  }
}
