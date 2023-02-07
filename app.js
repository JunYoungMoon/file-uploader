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

io.on('connection', (socket) => {
    console.log("A user connected");

    socket.on("upload-start", data => {
        console.log("Upload started");
        console.log("File size: ", data.size);

        fs.mkdirSync(__dirname + "/uploaded_files/", {recursive: true});

        const writeStream = fs.createWriteStream(__dirname + "/uploaded_files/" + data.name);
        let uploaded = 0;

        let previousProgress = 0;
        socket.on("upload-chunk", chunk => {
            uploaded += chunk.data.length;
            writeStream.write(new Buffer(chunk.data));
            const progress = (uploaded / data.size) * 100;
            if (Math.floor(progress) - Math.floor(previousProgress) >= 5) {
                console.log("Upload progress: ", progress);
                socket.emit("upload-progress", { progress });
                previousProgress = progress;
            }
        });

        socket.on("upload-end", () => {
            console.log("Upload completed");
            writeStream.end();
            socket.disconnect();
        });
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function() {
    console.log('Socket IO server listening on port 3000');
});