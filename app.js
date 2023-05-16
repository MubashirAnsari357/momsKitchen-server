import express from "express";
import User from "./routes/Users.js"
import cookieParser from "cookie-parser";
import Dish from "./routes/Dishes.js";
import Feedback from "./routes/Feedbacks.js";
import Orders from "./routes/Orders.js";
import Payment from "./routes/Payment.js";
import cors from "cors";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.use('/public',express.static('public'))


app.use("/api/v1/", User)
app.use("/api/v1/", Dish)
app.use("/api/v1/", Feedback)
app.use("/api/v1/", Orders)
app.use("/api/v1/", Payment)
app.use(cors({origin: true, credentials: true}));


app.get("/", (req,res)=>{
    res.send("Server is working")
})
