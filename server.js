if (process.argv.length < 4) {
  console.log("Usage: node server.js <ipAddr> <port>");
  process.exit();
}
var ipAddr = process.argv[2];
var port = process.argv[3];
// get mac address
var macAddr = require('getmac').default();
console.log(macAddr);

var ncurl = "http://" + ipAddr + ":" + port + "/numberofclients";

const WebSocket = require('ws');
var ws = null;

function connectws() {
  ws = new WebSocket('ws://' + ipAddr + ':' + port + '/jpgstream_server');
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

function write(data) {
  // send binary data
  if (ws.readyState == 1 && numberofclients > 0) {
    ws.send(data);
  }
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

var numberofclients = 1;
setInterval(() => {
  if (ws.readyState == 1) {
    request(ncurl, function (error, response, body) {
      //console.log(error, body)
      if (!error && response.statusCode == 200) {
        numberofclients = parseInt(body);
        //console.log(numberofclients);
      }
      else {
        numberofclients = Math.INFINITY;
      }
    });
  }
}, 10 * 1000);

var consumerR = null;
loadFace = () => {
  consumerR = new MjpegConsumer();
  request("http://127.0.0.1:8080/?action=stream")
    .pipe(consumerR);

  consumerR.on("data", (data) => {
    // base64data = "data:image/png;base64," + new Buffer(data).toString('base64');
    // write(JSON.stringify({ id: macAddr, image: base64data, raw: data }));
    write(data);
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