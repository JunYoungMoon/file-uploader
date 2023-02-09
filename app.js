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

app.get('/submit', function(req, res) {
    const name = data.Name;
    const env = data.env || 'dev';
    const location = config.nfs_path; //data.location || '';
    const t = data.target || 'prev';
    const target = (t == 'prev') ? t : _path.join('nft', t);

    const sub_path = config.sub_path;

    let temp_path = _path.join(config.root_path, sub_path);
    if (location != '') {
        temp_path = _path.join(temp_path, location);
    }

    temp_path = _path.join(temp_path, env);
    temp_path = _path.join(temp_path, 'temp');

    let dsc_path = _path.join(config.root_path, sub_path);
    if (location != '') {
        dsc_path = _path.join(dsc_path, location);
    }

    dsc_path = _path.join(dsc_path, env);
    dsc_path = _path.join(dsc_path, target);
    const now_folder = `${timestamp()}`;
    dsc_path = _path.join(dsc_path, now_folder);
    fs.mkdirSync(dsc_path, {recursive: true});
    dsc_path = _path.join(dsc_path, name);

    let result_path = _path.join(location, env);
    result_path = _path.join(result_path, target);
    result_path = _path.join(result_path, now_folder);
    result_path = _path.join(result_path, name);

    let target_path = _path.join('nft', location);
    target_path = _path.join(target_path, t);
    target_path = _path.join(target_path, now_folder);
    target_path = _path.join(target_path, name);
});


server.listen(3000, function() {
    console.log('Socket IO server listening on port 3000');
});