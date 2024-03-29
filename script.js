import ws from "k6/ws";
import { check } from "k6";
import http from "k6/http";
import { makeConnection } from "./k6lib.js";

export const options = {
  vus: 1,
  duration: "10s",
  tags: {
    testName: "socketsio poc",
  },
};

export default function () {
  const domain = `localhost:8000`;

  const sid = makeConnection(domain);

  const url = `ws://${domain}/socket.io/?EIO=4&transport=websocket&sid=${sid}`;

  let response = ws.connect(url, {}, function (socket) {
    socket.on("open", function open() {
      console.log("connected");

      // do not change any of these
      // protocols lol
      socket.send("2probe");
      socket.send("5");
      socket.send("3");

      // send to event ping
      const payload = `42["ping"]`;
      socket.send(payload);
    });

    // "message" is keyword constant
    socket.on("message", function pong(msg) {
      console.log(msg);
    });
    socket.on("debugMsg", function incoming(msg) {
      console.log(msg);
    });

    socket.on("close", function close() {
      console.log("disconnected");
    });

    socket.on("error", function (e) {
      console.log("error", JSON.stringify(e));
    });

    socket.setTimeout(function () {
      console.log("2 seconds passed, closing the socket");
      socket.close();
    }, 1000 * 2);
  });

  check(response, { "status is 101": (r) => r && r.status === 101 });
}
