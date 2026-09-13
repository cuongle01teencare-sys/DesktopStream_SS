import http from "http";
import { type connection, server as Socket } from "websocket";

const PORT = 3000;

const server = http.createServer();

server.listen(PORT, () => {
  console.log("The application is listening on port: ", PORT);
});

const webSocket = new Socket({ httpServer: server });

webSocket.on("request", (request) => {
  const connection: connection = request.accept();

  connection.send("Hello from server, you are now in");

  connection.on("message", (message) => {
    // if (message.type === "utf8") console.log(message.utf8Data);

    connection.send("Ok, hello");
  });
});
