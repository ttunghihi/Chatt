const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { initializeSocket } = require("./socket");
const { setSocketIO } = require("./controllers/message");
const { setSocketIOAuth } = require("./controllers/auth"); // Import hàm để truyền io vào auth.js

dotenv.config({ path: "./config.env" });

const server = http.createServer(app);

// Khởi tạo Socket.IO và truyền vào controller
const io = initializeSocket(server);
setSocketIO(io); // Truyền io vào message.js
setSocketIOAuth(io); // Truyền io vào auth.js

const DB = process.env.DBURI.replace("<PASSWORD>", process.env.DBPASSWORD);

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection is successful");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`App running on port ${port}`);
});