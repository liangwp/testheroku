var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
var port = (process.env.PORT || 1337);
server.listen(port, function() {
  console.log("lwp-server listening on port " + port);
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var client_counter = 0; // MDN: The MAX_SAFE_INTEGER constant has a value of 9,007,199,254,740,991.
var client_connections = {};

// WebSocket server
wsServer.on('request', function(request) {
    var this_client_ip = request.remoteAddress;
    console.log("Incoming connection: " + this_client_ip);

    var requested_protocols = "Requested Protocols: ";
    for (var i = 0; i < request.requestedProtocols.length; i++) {
      requested_protocols += '\n  '+request.requestedProtocols[i];
    }
    console.log(requested_protocols);

    var connection = request.accept("lwp-protocol", request.origin);
    client_counter += 1;
    var this_client = "id"+client_counter.toString();
    client_connections[this_client] = connection;
/*
    for (var client_id in client_connections) {
      console.log(client_id);
    }
*/

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            var broadcast_msg = "received from " + this_client_ip + " : " + message.utf8Data;
            console.log(broadcast_msg);

            // broadcast the message to all clients.
            for (var client_id in client_connections) {
              client_connections[client_id].sendUTF(broadcast_msg);
            }
        }
    });

    connection.on('close', function() {
        // close user connection
        console.log("User logged out: " + connection.remoteAddress);
        delete client_connections[this_client.toString()];
/*
        for (var client_id in client_connections) {
          console.log(client_id);
        }
*/
    });
});
