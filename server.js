const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join-table", (tableId) => {
      socket.join(`table:${tableId}`);
    });
    socket.on("join-restaurant", (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
    });
    socket.on("join-dashboard", (restaurantId) => {
      socket.join(`dashboard:${restaurantId}`);
    });
  });

  global.io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
