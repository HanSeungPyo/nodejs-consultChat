"use strict"

const roomList = document.querySelector(".room-list");

// Socket.IO 서버에 연결
const socket = io();
// adminRoomList.html에서 채팅방 목록을 요청
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
        li.classList.add("room-item");
        li.dataset.roomName = name; // 방 이름을 데이터 속성으로 추가
        const dom =`
                    <span class="chat-count">${chatCount}</span>
                    <span class="room-name">${name}</span>
                    <span class="time">${time}</span>
                    `;
        li.innerHTML = dom;
        roomList.appendChild(li);
    }
}

roomList.addEventListener("click", (event) => {
    const roomItem = event.target.closest(".room-item");
    if (roomItem) {
        const roomName = roomItem.dataset.roomName;
        window.location.href = `adminChat.html?room=${roomName}`;
    }
});

