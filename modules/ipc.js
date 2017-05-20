/**
 * Created by Peter on 19/05/2017.
 */

const zmq = require('zmq');
const config = require('config');
module.exports = function ipc(){


    var sock = zmq.socket('pub');
    sock.bindSync("tcp://127.0.0.1:"+config.get("IPC.port"));

    sock.monitor(1000, 0);




    sock.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
    sock.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
    sock.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
    sock.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
    sock.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
    sock.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
    sock.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
    sock.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
    sock.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
    sock.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});

    var object = {
        getSocket: sock,
        send: function(message){
            console.log("Sending message");
            sock.send(message);
        }
    };


    // setInterval(function(){
    //     object.send(["downloader", "test"]);
    // }, 1000);

    return object;
};