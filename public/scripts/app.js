const socket = io();
const chatForm = document.querySelector(".chat-form");
const messages = document.querySelector("#messages");

// extracting params from the query string

const params = new URLSearchParams(window.location.search);
const username = params.get("username");
const chatroom = params.get("chatroom");

//Join chatroom

socket.emit("joinRoom", { username, chatroom });

// getting the users and room info from server

socket.on("roomUsers", ({ user, users, chatroom }) => {
    const totalUsers = document.querySelector("#users");
    const roomName = document.querySelector(".room-name");

    // assigning the roomname

    roomName.innerHTML = chatroom;
    // emptying the total users ul

    totalUsers.innerHTML = "";

    // traversing through the users array
    for (let user of users) {
        let listItem = document.createElement("li");
        listItem.innerText = user.username;
        totalUsers.append(listItem);
    }
});

// Output message to dom

const outputMessage = (msg) => {
    const div = document.createElement("div");
    div.setAttribute("class", "message");

    const p1 = document.createElement("p");
    p1.innerText = `${msg.username} ${msg.time}`;

    const p2 = document.createElement("p");
    p2.innerText = msg.text;

    div.append(p1);
    div.append(p2);
    messages.append(div);
};

//Message from server
socket.on("message", (message) => {
    outputMessage(message);
    messages.scrollTop = messages.scrollHeight;
});

// Event listener for submission of the form

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputText = document.querySelector("#msg");
    // get message text
    const message = e.target.elements.msg.value;

    // emitting a message to the server
    socket.emit("chatMessage", message);
    //clearing the input
    inputText.value = "";
    inputText.focus();
});
