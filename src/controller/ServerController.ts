import * as http from "http";
import { server as Socket } from "websocket";
import { Attendee } from "../models/anttendee.js";

export class ServerController {
  // supports both REST API and WebSocket communication mechanisms, good to name the class as ServerController
  private _port: number;
  private _httpServer: ReturnType<typeof http.createServer>;
  private _socketServer: Socket;

  constructor({ port }: { port: number } = { port: 1709 }) {
    this._port = port;
    this._unregisteredAttendee = new Map<string, Attendee>();
  }

  onRequest() {
    this._socketServer.on("request", (request) => {
      const origin = request.origin;
      const connection = request.accept();

      const newAttendee = new Attendee({
        connection,
        origin,
      });

      this._unregisteredAttendee.set(newAttendee.uuid, newAttendee);

      console.log(
        "New attendee arrives. Total number of attendees increased: ",
        this._unregisteredAttendee.size,
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

    this.onRequest();
  }

  get(key: "port") {
    switch (key) {
      case "port":
        return this._port;
      default:
        throw new Error("Invalid key string to get.");
    }
  }
}
