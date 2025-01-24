const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

let messages = [];
const messages_length = 30 * -1;

io.on("connect", (socket) => {
  socket.on("newMessage", (e) => {
    messages.push(e);
    socket.broadcast.emit("messages", {
      value: messages.slice(messages_length),
    });
    socket.emit("messages", { value: messages.slice(messages_length) });
  });

  socket.on("getMessages", () => {
    socket.emit("messages", { value: messages.slice(messages_length) });
  });

  socket.on("editMessage", (e) => {
    const msg = messages.map((each) => each.id).indexOf(e.id);
    const msgReply = messages.map((each) => each.reply.id).indexOf(e.id);

    if (msg !== -1) {
      messages[msg] = e;
    }
    if (msgReply !== -1) {
      messages[msgReply].reply.value = e.value;
    }

    socket.broadcast.emit("messages", { value: messages });
    socket.emit("messages", { value: messages });
  });

  socket.on("deleteMessage", (e) => {
    const msg = messages.map((each) => each.id).indexOf(e.id);

    if (msg !== -1) {
      messages[msg] = {
        ...messages[msg],
        value: "Mensagem apagada!",
        type: "deleted",
        id: e.id,
      };
    }

    socket.broadcast.emit("messages", { value: messages });
    socket.emit("messages", { value: messages });
  });
});

nextApp.prepare().then(() => {
  app.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) {
      throw err;
    }

    console.log(
      "[Server] Successfully started on port",
      process.env.PORT || 3000
    );
  });
});
