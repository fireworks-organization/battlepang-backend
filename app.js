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
import fanclubRouter from "./routes/fanclubRouter";
import passport from "passport";
import passportConfig from "./passport";
import cors from "cors";

import swaggerUi from 'swagger-ui-express';


import routes from "./routes";

var app = express();
let isAppGoingToBeClosed = false // SIGINT 시그널을 받았는지 여부. 앱이 곧 종료될 것임을 의미한다.

app.use(function(req, res, next) {
  // 프로세스 종료 예정이라면 리퀘스트를 처리하지 않는다
  if (isAppGoingToBeClosed) {
    res.set('Connection', 'close')
  }

  next()
})
const swaggerDocument = require("./swaggerDocument.json");

app.use((req, res, next) => {
  if (req.url === '/favicon.ico') {
    res.sendFile(__dirname + '/favicon.ico');
  } else if (req.url === '/swagger.json') {
    res.sendFile(__dirname + '/swagger.json');
  } else if (req.url === '/my-custom.css') {
    res.sendFile(__dirname + '/my-custom.css');
  } else {
    next();
  }
});

var options = {
  validatorUrl: null,
  docExpansion: 'list', // none , list, full
  // operationsSorter: function (a, b) {
  //   var score = {
  //     '/': 0,
  //     '/users': 1
  //   }
  //   console.log('a', a.get("path"), b.get("path"))
  //   return score[a.get("path")] < score[b.get("path")]
  // }
};

var swaggerUiOpts = {
  explorer: false,
  swaggerOptions: options,
  operationsSorter: 'alpha',
  customSiteTitle: "API 문서",
  customfavIcon: "/favicon.jpg",
  // customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
  customCssUrl: '../stylesheets/swagger.css'
}
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerDocument, swaggerUiOpts));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors({origin: true}));
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
app.use(routes.fanclub, fanclubRouter);

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
