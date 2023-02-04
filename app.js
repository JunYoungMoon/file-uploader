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

    socket.on('Start', function (data) {
        console.log('start');
        uploader.start(socket, data);
    });

    socket.on('Upload', function (data) {
        console.log('upload');
        uploader.upload(socket, data);
    });

    socket.on('disconnect', () => {
        console.log('disconnect');
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function() {
    console.log('Socket IO server listening on port 3000');
});