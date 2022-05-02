var Server = require("socket.io").Server;
const io = new Server(9999, { cors: { origins: ["*"] } });
const mqtt = require("mqtt");
var users = {};
var active_office_user = "";
const host = "localhost";
const port = "1883";

const connectUrl = `mqtt://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

const topic = "ABS/office/movement";
client.on("connect", () => {
  console.log("Connected");
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
  });
});

client.on("message", (topic, payload) => {
  let office_id = payload.toString();
  if (office_id) {
    active_office_user = office_id;
    console.log("new active:", active_office_user);
  }
});

io.on("connection", (socket) => {
  socket.on("message", (msg) => {
    var data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }
    console.log(data);

    switch (data.type) {
      case "login":
        console.log("User logged:", data.name);

        if (users[data.name]) {
          sendTo(socket, {
            type: "login",
            success: false,
          });
        } else {
          users[data.name] = socket;
          socket.name = data.name;

          sendTo(socket, {
            type: "login",
            success: true,
          });
        }

        break;

      case "offer":
        console.log("Sending offer to: ", active_office_user);

        var conn = users[active_office_user];

        if (conn != null) {
          socket.otherName = active_office_user;

          sendTo(conn, {
            type: "offer",
            offer: data.offer,
            name: socket.name,
          });
        }

        break;

      case "answer":
        console.log("Sending answer to: ", data.name);

        var conn = users[data.name];

        if (conn != null) {
          socket.otherName = data.name;
          sendTo(conn, {
            type: "answer",
            answer: data.answer,
            name: socket.name,
          });
        }

        break;

      case "candidate":
        console.log("Sending candidate to:" + data.name);
        var conn = users[data.name];

        if (conn != null) {
          sendTo(conn, {
            type: "candidate",
            candidate: data.candidate,
          });
        }

        break;

      case "leave":
        console.log("Disconnecting from", data.name);
        var conn = users[data.name];
        conn.otherName = null;

        if (conn != null) {
          sendTo(conn, {
            type: "leave",
          });
        }

        break;

      default:
        sendTo(socket, {
          type: "error",
          message: "Command no found: " + data.type,
        });

        break;
    }
  });
});

function sendTo(socket, message) {
  socket.emit("message", JSON.stringify(message));
}
