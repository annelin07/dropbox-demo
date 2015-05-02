let net = require('net')
let JsonSocket = require('json-socket')

let socket = new JsonSocket(new net.Socket()) //Decorate a standard net.Socket with JsonSocket
socket.connect(9838, '127.0.0.1')
socket.on('connect', function() { //Don't send until we're connected
    socket.on('message', function(message) {
        console.log('Received message from tcpServer: ', message)
        socket.sendMessage({text: "Client recieved message"})
    })
})
