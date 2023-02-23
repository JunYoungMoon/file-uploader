const fs = require('fs');
const _path = require("path");
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const { execFile } = require('child_process');

// import {execFile} from 'node:child_process';
// import gifsicle from 'gifsicle';

const bodyParser = require('body-parser');

app.use(bodyParser.json());


io.on('connection', (socket) => {
    console.log("A user connected");

    socket.on("upload-start", data => {
        console.log("Upload started");
        console.log("File size: ", data.size);

        fs.mkdirSync(__dirname + "/temp/", {recursive: true});

        const writeStream = fs.createWriteStream(__dirname + "/temp/" + data.name);
        let uploaded = 0;

        let previousProgress = 0;
        socket.on("upload-chunk", chunk => {
            uploaded += chunk.data.length;
            writeStream.write(new Buffer(chunk.data));
            const progress = (uploaded / data.size) * 100;
            if (Math.floor(progress) - Math.floor(previousProgress) >= 5) {
                console.log("Upload progress: ", progress);
                socket.emit("upload-progress", {progress});
                previousProgress = progress;
            }
        });

        socket.on("upload-end", () => {
            execFile('gifsicle', ['--lossy=80 -O3 --resize 500x500', '-o', __dirname + "/temp/" + data.name, __dirname + "/temp/" + data.name], (error, stdout, stderr) => {
                if (error) {
                    console.error(`execFile error: ${error}`);
                    return;
                }

                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            });

            console.log("Upload completed");
            writeStream.end();
            socket.disconnect();
        });
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit', function (req, res) {
    const now_folder = `${timestamp()}`;
    const path = _path.join(__dirname + "/files/", now_folder);
    fs.mkdirSync(path, {recursive: true});

    let count = 0;
    for (const file of req.body) {
        const oldPath = _path.join(__dirname, 'temp', file);
        const newPath = _path.join(__dirname, 'files', now_folder ,file);
        fs.rename(oldPath, newPath, (error) => {
            if (error) {
                console.error(error);
                res.status(400).send({
                    message: 'POST request failed.',
                });
            } else {
                count++;
                if (count === req.body.length) {
                    res.status(200).send({
                        message: 'POST request succeeded.',
                    });
                }
            }
        });
    }
});


function timestamp() {
    const pad = n => n < 10 ? `0${n}` : n;
    const d = new Date();

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

server.listen(3000, function () {
    console.log('Socket IO server listening on port 3000');
});