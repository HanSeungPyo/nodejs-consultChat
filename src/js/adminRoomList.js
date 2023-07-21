"use strict"

const roomList = document.querySelector(".room-list");
const alarm = document.querySelector("#alarm");


function checkNotificationPermission() {
  if (Notification.permission === 'granted') {
    alarm.checked = true;
    alarm.disabled = true;
  } else {
    alarm.checked = false;
    alarm.disabled = false;
  }
}

// 페이지 로딩 시 초기 상태 설정
checkNotificationPermission();

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

        sendNotification(name);
    });

    
});


alarm.addEventListener("click", ()=>{
    requestNotificationPermission()
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


// 알림 허용 요청
function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('알림 허용됨');
        alarm.checked = true;
        alarm.disabled = true;
        // 서비스 워커 등록
        navigator.serviceWorker.register('service-worker.js').then(registration => {
          console.log('서비스 워커 등록 성공');
        }).catch(error => {
          console.error('서비스 워커 등록 실패:', error);
        });
      } else {
        console.log('알림 거부됨');
      }
    });
  }

  // 알림 보내기
  function sendNotification(name) {
    if (Notification.permission === 'granted') {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          title: name,
          body: '새로운 상담룸이 개설되었습니다.'
        });
      } else {
        console.log('서비스 워커가 아직 준비되지 않았습니다.');
      }
    } else {
      console.log('알림 권한이 허용되지 않았습니다.');
    }
  }

  
