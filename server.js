var Server = require("socket.io").Server;
const io = new Server(9999, {cors: {origins: ["*"]}});
var users = {};

io.on("connection", (socket) => {
    socket.on("message", (msg) =>{
        var data;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
        console.log(data);

        //switching type of the user message
        switch (data.type) {
            //when a user tries to login
            case "login":
                console.log("User logged:", data.name);

                //if anyone is logged in with this username then refuse
                if(users[data.name]) {
                    sendTo(socket, {
                    type: "login",
                    success: false
                    });
                } else {
                    //save user connection on the server
                    users[data.name] = socket;
                    socket.name = data.name;

                    sendTo(socket, {
                    type: "login",
                    success: true
                    });

                }

                break;

            // TODO: offer to random rather than name.
            case "offer":
                //for ex. UserA wants to call UserB
                console.log("Sending offer to: ", data.name);

                //if UserB exists then send him offer details
                var conn = users[data.name];

                if(conn != null){
                    //setting that UserA connected with UserB
                    socket.otherName = data.name;

                    sendTo(conn, {
                        type: "offer",
                        offer: data.offer,
                        name: socket.name
                    });
                }

                break;

            case "answer":
                console.log("Sending answer to: ", data.name);

                //for ex. UserB answers UserA
                var conn = users[data.name];

                if(conn != null) {
                    socket.otherName = data.name;
                    sendTo(conn, {
                        type: "answer",
                        answer: data.answer
                    });
                }

                break;

            case "candidate":
                console.log("Sending candidate to:" +  data.name);
                var conn = users[data.name];

                if(conn != null) {
                    sendTo(conn, {
                        type: "candidate",
                        candidate: data.candidate
                    });
                }

                break;

            default:
                sendTo(socket, {
                    type: "error",
                    message: "Command no found: " + data.type
                });

                break;
        }
    })
})


function sendTo(socket, message) {
    socket.emit("message", JSON.stringify(message));
}
