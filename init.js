import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import "./db";
import "./models/User";
import { Mongoose } from "mongoose";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, err => {
  if (err) throw err
  console.log(`Listening on : http://localhost:${PORT}`);

  // PM2에게 앱 구동이 완료되었음을 전달한다
  if (process.send) {
    process.send('ready')
    console.log('sent ready signal to PM2 at', new Date())
  }
})


// process.on('SIGINT', function() {
//   console.log('> received SIGNIT signal')
//   isAppGoingToBeClosed = true // 앱이 종료될 것

//   // pm2 재시작 신호가 들어오면 서버를 종료시킨다.
//   server.close(function(err) {
//     console.log('server closed')
//     process.exit(err ? 1 : 0)
//   })
// })

// process.on('uncaughtException', function (err) {
//   console.log('Caught exception: ' + err);
//   // restart or safe shutdown 등의 처리
// });

process.on('SIGTERM', shutDown)
process.on('SIGINT', shutDown)
process.on('uncaughtException', shutDown)

let connections = [];

server.on('connection', connection => {
  connections.push(connection)
  // server.getConnections((err, connections) =>
  //   console.log(`${connections} connections currently open`)
  // )
  connection.on('close', () => {
    connections = connections.filter(curr => curr !== connection)
  })
})

function shutDown() {
  console.log('Received kill signal, shutting down gracefully')
  server.close(() => {
    Mongoose.close()
    console.log('Closed out remaining connections')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)

  connections.forEach(curr => curr.end())
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000)
}