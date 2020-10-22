var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

nicknames = {};
networkSockets = {};

app.get('/', function (req, res) {
    res.render('extra.ejs', {
        headerTitle: "Socket IO chat app",
        nick: nicknames
    });
});


io.on('connection', function (socket) {

    //new users 
    socket.on('new user', function (data, callback) {

        if (nicknames.hasOwnProperty(data)) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            nicknames[socket.nickname] = { online: true };
            networkSockets[socket.nickname] = { networkSocket: socket };
            console.log('user connected: ' + socket.nickname);
            //  io.emit('update_personal', nicknames + ': Online');
            updateNicknames();
        }
    });

    // update all user name

    function updateNicknames() {
        io.sockets.emit('usernames', nicknames);
    }

    // send message 
    socket.on('send message', function (data) {
        console.log("Message is " + data.msg);
        console.log("The user to send mesage is : " + data.toSend);
        // var netWorkSocket = networkSockets[data.toSend];
        console.log('message: ' + { msg: data.msg, nick: socket.nickname });
        console.log("Socket id is " + networkSockets[data.toSend].networkSocket.id)
        io.to(networkSockets[data.toSend].networkSocket.id).emit('new message', { msg: data.msg, nick: socket.nickname });
    });

    //disconnected service

    socket.on('disconnect', function (data) {
        console.log('user disconnected:' + socket.nickname)
        if (!socket.nickname) return;
        nicknames[socket.nickname].online = false;
        updateNicknames();
    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});