if(process.argv.length < 3) {
  console.log("Usage: node server.js <hand>");
  process.exit();
}
var hand = process.argv[2] || "left";

const WebSocket = require('ws');
var ws = null;

function connectws() {
    ws = new WebSocket('ws://192.168.1.50:80/hub');
    ws.on('open', function open() {
        console.log("connected");
        //write("hello");
    });

    ws.on('message', function incoming(data) {
        console.log(data);
    });

    ws.on('close', function close() {
        console.log('disconnected');
        connectws();
    });
}

connectws();

function write(str) {
    ws.send(str);
}

var request = require("request");
var MjpegConsumer = require("mjpeg-consumer");
const { connect } = require('net');



var faceStart = false;

setInterval(() => {
  if (consumerR == null) {
    try {
      loadFace();
    } catch (e) {
      console.log(e);
    }
  }
}, 10 * 1000);

var consumerR = null;
loadFace = () => {
  consumerR = new MjpegConsumer();
  request("http://127.0.0.1:8080/?action=stream")
    .pipe(consumerR);

  consumerR.on("data", (data) => {
    base64data = "data:image/png;base64," + new Buffer(data).toString('base64');
    write(JSON.stringify({ hand: hand, image: base64data }));
  });
  consumerR.on("end", () => { 
    console.log("end");
    consumerR = null;
  });
  consumerR.on("error", (e) => {
    console.log(e);
    consumerR = null;
  });
}