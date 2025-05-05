const express = require("express");
const routes = require("./routes/index");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongosanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");


const app = express();



// Middleware xử lý URL-encoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware chống NoSQL Injection
app.use(mongosanitize());

// Middleware xử lý CORS
app.use(
  cors({
    origin: ["http://localhost:3001"], // Hoặc để là "*"
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true,
    exposedHeaders: ["Content-Disposition"], // nếu cần download file
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Cho phép truy cập từ mọi origin
  next();
});


// Middleware xử lý cookie
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    res.cookie("jwt", req.cookies.jwt, {
      httpOnly: true,
      secure: true, // Chỉ gửi cookie qua HTTPS
      sameSite: "None", // Cho phép cookie hoạt động trong cross-site
    });
  }
  next();
});

// Middleware xử lý JSON
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware bảo mật HTTP headers
app.use(helmet());

// Middleware log request trong môi trường development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware giới hạn số lượng request
const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // Trong một giờ
  message: "Too many requests from this IP, Please try again in an hour",
});
app.use("/TX2T", limiter);

app.use("/uploads", (req, res, next) => {
  console.log("Yêu cầu đến:", req.path);
  next();
});
app.use(
  "/uploads",
  cors({
    origin: "http://localhost:3001", // Chỉ định origin cụ thể
    methods: ["GET"],
  }),
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Cho phép truy cập từ mọi origin
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);
// Routes
app.use(routes);

module.exports = app;