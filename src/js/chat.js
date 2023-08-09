"use strict"

const socket = io();

const nickName = document.querySelector("#nickname");
const chatList = document.querySelector(".chatting-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");
const endChat = document.getElementById("endChat");  // 채팅 종료 버튼

let roomName; // 방 이름 변수

// 로컬 스토리지에서 대화명 로드
nickName.value = localStorage.getItem('nickname') || '';

nickName.addEventListener('change', () => {
    localStorage.setItem('nickname', nickName.value);
});


const send = () =>{
    
    // 방이 생성되어 있는지 확인
    if (!roomName) {
        // 방 이름 생성
        roomName = "room_" + nickName.value;
        // 서버로 방에 참가하는 이벤트 전송
        socket.emit("joinRoom", roomName);
    }
    
    const param = {
        name: nickName.value,
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

    // 채팅 메시지를 로컬 스토리지에 저장
    saveChatToLocalStorage(name, msg, time);
})

function LiModel(name, msg, time){
    this.name = name;
    this.msg = msg;
    this.time = time;

    this.makeLi = ()=>{
        const li = document.createElement("li");
        li.classList.add(nickname.value===this.name ? "sent" : "received");
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

// 로컬 스토리지에 채팅 메시지 저장
function saveChatToLocalStorage(name, msg, time) {
    let chatHistory = localStorage.getItem("chatHistory");
    if (!chatHistory) {
        chatHistory = [];
    } else {
        chatHistory = JSON.parse(chatHistory);
    }
    chatHistory.push({name, msg, time});
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    localStorage.setItem("lastSaved", Date.now()); // 현재 시간 저장
}

function loadChatFromLocalStorage() {
    let chatHistory = localStorage.getItem("chatHistory");

    // 하루가 지났는지 확인
    const lastSaved = localStorage.getItem("lastSaved");
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

    // 하루가 지났으면 데이터 초기화
    if (lastSaved && Date.now() - lastSaved > oneDayInMilliseconds) {
        localStorage.removeItem("chatHistory");
        localStorage.removeItem("lastSaved");
        chatHistory = null;
    }

    if (chatHistory) {
        chatHistory = JSON.parse(chatHistory);
        chatHistory.forEach(data => {
            const {name, msg, time} = data;
            const item = new LiModel(name, msg, time);
            item.makeLi();
        });
        displayContainer.scrollTo(0,displayContainer.scrollHeight);
    }
}

// 페이지 로드 시 로컬 스토리지에서 채팅 메시지 불러오기
loadChatFromLocalStorage();


// 채팅 종료 버튼 클릭 이벤트
endChat.onclick = function() {
    var isConfirmed = confirm("채팅을 종료하시면 상담 내역이 사라집니다. 종료하시겠습니까?");
    if (isConfirmed) {
        // 로컬 스토리지 초기화
        localStorage.clear();
        // 서버로 방에서 나가는 이벤트 전송
        if (roomName) {
            socket.emit("leaveRoom", roomName);
        }
        // 대화명 초기화
        nickName.value = '';
        // 페이지 리로드
        location.reload();
        // 상담창 닫기
        parent.chatContent.src = "";  // iframe 내용 비우기
        parent.chatContainer.classList.add("hidden");
    }
}