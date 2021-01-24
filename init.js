import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import "./db";
import "./models/User";

const PORT = process.env.PORT || 4000;

const listeningServer = app.listen(PORT, err => {
  if (err) throw err
  console.log(`Listening on : http://localhost:${PORT}`);

  // PM2에게 앱 구동이 완료되었음을 전달한다
  if (process.send) {
    process.send('ready')
    console.log('sent ready signal to PM2 at', new Date())
  }
})


process.on('SIGINT', function() {
  console.log('> received SIGNIT signal')
  isAppGoingToBeClosed = true // 앱이 종료될 것

  // pm2 재시작 신호가 들어오면 서버를 종료시킨다.
  listeningServer.close(function(err) {
    console.log('server closed')
    process.exit(err ? 1 : 0)
  })
})