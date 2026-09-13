import { v7 as uuidv7 } from "uuid";
import type { connection } from "websocket";
import type { Flatten } from "../utils/type.js";

type AttendeeParams = Flatten<Omit<Attendee, "uuid"> & { uuid?: string }>;

export class Attendee {
  // uuid này sẽ được hệ thống sinh ra hoặc từ user gửi lên. Nếu user gửi lên thì không cần trả về khi establish connection, nhưng nếu là server tạo thì server sẽ trả về uuid để người dùng tự biết mình được định danh thế nào trong hệ thống, tiện cho các setup kết nối sau này
  public readonly uuid: string;
  public readonly origin?: string; // URL hoặc địa chỉ IP của người tham dự
  public readonly name?: string; // Tên của người tham dự, có thể có hoặc không
  public readonly connection: connection;

  constructor(params: AttendeeParams) {
    let finalUUID: string | undefined = params.uuid;

    if (!finalUUID) finalUUID = uuidv7();

    this.uuid = finalUUID;
    this.origin = params.origin;
    this.name = params.name;
    this.connection = params.connection;
  }
}
