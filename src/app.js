import express from "express";
import vendorRouter from "./routes/vendorRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import itemRouter from "./routes/itemRoute.js";
import cors from "cors"
import userRouter from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import oderRouter from "./routes/orderRoute.js"
const app= express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())

//routes
app.use("/vendor",vendorRouter)
app.use("/category",categoryRouter)
app.use("/item",itemRouter)
app.use("/user",userRouter)
app.use("/order",oderRouter)
export default app;