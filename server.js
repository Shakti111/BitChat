const path = require("path");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

const port = process.env.PORT || 3000;

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// run when a client connects

const botName = "BitChat";

io.on("connection", (socket) => {
    //Listen for chatroom

    socket.on("joinRoom", ({ username, chatroom }) => {
        // Joining users
        const user = userJoin(socket.id, username, chatroom);
        socket.join(user.chatroom);
        //welcome users
        socket.emit("message", formatMessage(botName, "Welcome to BitChat"));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.chatroom)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat!`)
            );

        // send users and room info

        io.to(user.chatroom).emit("roomUsers", {
            user: user.username,
            chatroom: user.chatroom,
            users: getRoomUsers(user.chatroom),
        });
    });

    //listen for chat message

    socket.on("chatMessage", (msg) => {
        // finding the current user
        const user = getCurrentUser(socket.id);

        io.to(user.chatroom).emit("message", formatMessage(user.username, msg));
    });

    // runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.chatroom).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );

            // send users and room info

            io.to(user.chatroom).emit("roomUsers", {
                users: getRoomUsers(user.chatroom),
                chatroom: user.chatroom,
            });
        }
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
