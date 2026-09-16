import { config } from "dotenv";
import { ServerController } from "./controller/ServerController.js";
import { appConfigSchema } from "./schemas/appConfig.js";

config();

const port = appConfigSchema.shape.port.parse(process.env.PORT || "3000");

const serverController = new ServerController();

serverController.establish();
