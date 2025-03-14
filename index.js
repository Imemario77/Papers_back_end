import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";

import loginRoute from "./router/authRoute.js";
import businessRoute from "./router/businessRoute.js";
import vendorRoute from "./router/vendorRoute.js";
import expensesRoute from "./router/expensesRoute.js";
import productRoute from "./router/productRoute.js";
import customerRoute from "./router/customerRoute.js";
import salesRoute from "./router/salesRoute.js";
import invoiceRoute from "./router/invoiceRoute.js";
import userRoute from "./router/userRoute.js";
import otpRoute from "./router/otpRoute.js";
const app = express();
mongoose
  .connect("mongodb://127.0.0.1:27017/Papers", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database succesfully");
  })
  .catch((e) => {
    console.log(e);
  });

// application middlewares
const oneDay = 1000 * 60 * 60 * 24;
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

// app.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
app.use(
  session({
    secret: "hello world",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/Papers" }),
    cookie: {
      httpOnly: true,
      maxAge: oneDay,
    },
  })
);

// url routes to call 'api endpoints'
app.use("/auth", loginRoute);
app.use("/business", businessRoute);
app.use("/expenses", expensesRoute);
app.use("/vendor", vendorRoute);
app.use("/customer", customerRoute);
app.use("/product", productRoute);
app.use("/sales", salesRoute);
app.use("/invoice", invoiceRoute);
app.use("/user", userRoute);
app.use("/otp", otpRoute);

app.listen(10000, () => {
  console.log("server started on port 3000");
});
