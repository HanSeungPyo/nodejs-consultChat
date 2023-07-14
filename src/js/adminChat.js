"use strict"

const roomList = document.querySelector(".room-list");

// Socket.IO 서버에 연결
const socket = io();
// admin.html에서 채팅방 목록을 요청
socket.emit("joinAdminRoom");

// 채팅방 목록을 수신하여 목록을 업데이트
socket.on("roomList", (rooms) => {
    roomList.innerHTML = "";

    rooms.forEach((room) => {
        const {name, socketIds, chatCount, time} = room;
        const item = new LiModel(name, socketIds[0], chatCount, time);
        item.makeLi();
    });
});


function LiModel(name, socketId, chatCount, time){
    this.name = name;
    this.socketId = socketId;
    this.chatCount = chatCount;
    this.time = time;

    this.makeLi = ()=>{
        const li = document.createElement("li");
        const dom =`
                    <span class="chat-count">${chatCount}</span>
                    <span class="chat-name">${name}</span>
                    <span class="time">${time}</span>
                    `;
        li.innerHTML = dom;
        roomList.appendChild(li);
    }
}