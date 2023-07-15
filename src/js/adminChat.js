"use strict"

const socket = io();

const chatList = document.querySelector(".chatting-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");

const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get("room");

if (roomName) {
    socket.emit("adminjoinRoom", roomName);
}

const send = () =>{
    const param = {
        name: "상담원",
        msg: chatInput.value,
        roomName: roomName
    }

    socket.emit("chatting", param);

     // 대화 입력 필드 초기화
    chatInput.value ="";
    chatInput.focus();
}

chatInput.addEventListener("keypress", (event)=>{
    if(event.keyCode === 13){
        send();
    }
});

sendButton.addEventListener("click", send);

socket.on("chatting", (data)=>{
    const {name, msg, time} = data;
    const item = new LiModel(name, msg, time);
    item.makeLi();
    displayContainer.scrollTo(0,displayContainer.scrollHeight);
})

function LiModel(name, msg, time){
    this.name = name;
    this.msg = msg;
    this.time = time;

    this.makeLi = ()=>{
        const li = document.createElement("li");
        li.classList.add("상담원"===this.name ? "sent" : "received");
        const dom =`<li>
                        <span class="profile">
                            <span class="user">${this.name}</span>
                            <img src="https://picsum.photos/50/50"/>
                        </span>
                        <span class="message">${this.msg}</span>
                        <span class="time">${this.time}</span>
                    </li>`;
        li.innerHTML = dom;
        chatList.appendChild(li);
    }
}


