const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
const DIRNAME = path.resolve();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["Get", "POST"],
  },
});

io.on("connection", (socket) => {
  //measure server is running
  console.log('user connected: ' + socket.id);
  startSend(socket);
});

const makeProduct = (cnt) => {
  let id = Math.floor(Math.random() * cnt) + 1;
  let price = Math.floor(Math.random() * 1000) + 1;
  return {
    id: id,
    name: "P-" + id,
    q: "good",
    price: price + '$'
  }
}

const startSend = (socket) => {
  let cnt = 100;  

  //set time
  let time = 1;
  setInterval(() => {
    const p1 = makeProduct(cnt);
    const p2 = makeProduct(cnt);
    var data = [p1, p2];

    // socket.volatile.emit("ping", data);
    socket.emit("ping", data);
    // cnt += 2;
  }, time * 1000);
}

// ====================  Deployment ========================= //
if (process.env.NODE_ENV === "production") {
  // Establishes the path to our frontend (most important)
  app.use(express.static(path.join(DIRNAME, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(DIRNAME, "/frontend/build/index.html"))
  );
}
// ====================  Deployment ========================= //


console.log(process.env.PORT);
const port = process.env.PORT | 5000;
server.listen(port, () => {
  console.log("Server is running at port : " + port);
});

