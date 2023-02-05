const fs = require('fs');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const uploader = require('./uploader');

io.on('connection', (socket) => {
    console.log('connect');

    let fileBuffer = [];

    socket.on('chunk', function (chunk) {
        fileBuffer.push(chunk);
    });

    socket.on('disconnect', function () {
        const buffer = Buffer.concat(fileBuffer);
        fs.writeFile('received_file.bin', buffer, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log('File received and saved.');
            }
        });
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function() {
    console.log('Socket IO server listening on port 3000');
});