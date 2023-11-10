const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {
    Server
} = require('socket.io');
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

var socket_info = {}
var room_info = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket_info[socket.id] = {"room": null};

  socket.on('disconnect', () => {
    console.log('user disconnected');

    userRoom = socket_info[socket.id].room;
    if (userRoom != null) {
    	if (userRoom in room_info) {
    		console.log("	deleting room: " + userRoom.toString());

    		for (var i = 0; i < room_info[userRoom].sockets.length; i++) {
    			room_info[userRoom].sockets[i].emit("neterror", "Room deleted!");
    		}

    		delete room_info[userRoom];
    	}
    }
  });

  socket.on('createRoom', (id) => {
    console.log('creating room: ' + id.toString());
    if (id in room_info) {
    	console.log("	room already exists!")
    	socket.emit("neterror", "Room number already taken!")
    } else {
    	room_info[id] = {"sockets": [socket]};
    	socket_info[socket.id].room = id;
    }
  });

  socket.on('joinRoom', (id) => {
    console.log('joining room: ' + id.toString());

    if (id in room_info) {
    	if (room_info[id].sockets.length < 2) {
    		room_info[id].sockets.push(socket);
    		socket_info[socket.id].room = id;
    		console.log("	successfully joined");

    		for (var i = 0; i < room_info[id].sockets.length; i++) {
    			room_info[id].sockets[i].emit("roomfull");
    		}
    	} else {
    		console.log("	room is already full!");
    		socket.emit("neterror", "Room is full!")
    	}
	} else {
		console.log("	room does not exist!")
		socket.emit("neterror", "Room does not exist!")
	}
  });

  socket.on('netcmd', (cmd) => {
    console.log('network cmd');
    userRoom = socket_info[socket.id].room;
    for (var i = 0; i < room_info[userRoom].sockets.length; i++) {
    	room_info[userRoom].sockets[i].emit("netcmd", cmd);
    }
  });
  console.log("	user setup success")
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});