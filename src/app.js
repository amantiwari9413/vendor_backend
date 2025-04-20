import express from "express";
import vendorRouter from "./routes/vendorRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import itemRouter from "./routes/itemRoute.js";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import oderRouter from "./routes/orderRoute.js";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load environment variables

const app = express();

// ✅ Get allowed origins from .env and split into array
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin like curl or mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/vendor", vendorRouter);
app.use("/category", categoryRouter);
app.use("/item", itemRouter);
app.use("/user", userRouter);
app.use("/order", oderRouter);

export default app;
