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
})

// gracfully shutdown 할 필요가 무엇인가?
// process.on('SIGTERM', shutDown)
// process.on('SIGINT', shutDown)
// process.on('uncaughtException', shutDown)

let connections = [];

server.on('connection', connection => {
  connections.push(connection)
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