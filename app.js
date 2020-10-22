var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

nicknames = {};

app.get('/', function (req, res) {
    res.render('extra.ejs', { root: 'views' });
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
        console.log('message: ' + { msg: data, nick: socket.nickname });
        io.sockets.emit('new message', { msg: data, nick: socket.nickname });
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