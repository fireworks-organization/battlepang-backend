import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import logger from "morgan";
import helmet from "helmet";
import globalRouter from "./routes/globalRouter";
import userRouter from "./routes/userRouter";
import battleRouter from "./routes/battleRouter";
import subBattleRouter from "./routes/subBattleRouter";
import commentRouter from "./routes/commentRouter";
import rankRouter from "./routes/rankRouter";
import goldHistoryRouter from "./routes/goldHistoryRouter";
import paymentHistoryRouter from "./routes/paymentHistoryRouter";
import bankAccountNumberRouter from "./routes/bankAccountNumberRouter";
import exchangeHistoryRouter from "./routes/exchangeHistoryRouter";
import passport from "passport";
import passportConfig from "./passport";
import cors from "cors";

import routes from "./routes";

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(helmet());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
passportConfig();

app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
app.use(routes.subBattles, subBattleRouter);
app.use(routes.battles, battleRouter);
app.use(routes.comments, commentRouter);
app.use(routes.ranks, rankRouter);
app.use(routes.goldHistory, goldHistoryRouter);
app.use(routes.paymentHistory, paymentHistoryRouter);
app.use(routes.bankAccountNumber, bankAccountNumberRouter);
app.use(routes.exchangeHistory, exchangeHistoryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
