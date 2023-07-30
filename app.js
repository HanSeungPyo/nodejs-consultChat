const fs = require('fs');
const express = require("express");
const https = require("https");
const app = express();
const path = require("path");
const socketIO = require("socket.io");
const moment = require("moment");

//ssl 인증서 설정
const options = {
  key: fs.readFileSync(path.join(__dirname, "ssl/cert.key")),
  cert: fs.readFileSync(path.join(__dirname, "ssl/cert.crt"))
};



const server = https.createServer(options, app);

const io = socketIO(server);

app.use(express.static(path.join(__dirname, "src")));
const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>console.log(`server is running ${PORT}`));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "admin.html"));
});


// 채팅방 목록을 저장할 배열
const chatRooms = [];

io.on("connection", (socket) => {
  //사용자의 방참가
  socket.on("joinRoom", (roomName) => {
      socket.join(roomName);
     
      console.log(`${roomName} 방에 참가 하셨습니다.`);

      // 채팅방 정보 저장
      const room = {
          name: roomName,
          socketIds: [socket.id],
          chatCount: 0, // 채팅 개수 초기값 0으로 설정
          time: moment(new Date()).format("h:mm A"),
          chatHistory: [], // 빈 채팅 기록 배열을 초기화
          consultationStatus: '미정' // 상담 상태 초기값 '미정'으로 설정
      };
      chatRooms.push(room);

      
      // adminRoomList.html에 새로운 채팅방 목록 전송
      io.to("admin").emit("roomList", chatRooms);

      //새로운 채팅방 생성 시 알람처리용
      io.to("admin").emit("newRoom", room);
  });

  socket.on("adminjoinRoom", (roomName) => {
    // 해당 방에 참가
    socket.join(roomName);
    console.log(`상담원이 ${roomName} 방에 참가 하셨습니다.`);
  });

  socket.on("chatting", (data) => {
      const { name, msg, roomName } = data;

      // 해당 채팅방에 메시지 전송
      io.to(roomName).emit("chatting", {
          name,
          msg,
          time: moment(new Date()).format("h:mm A")
      });

      
        // 해당 채팅방의 채팅 개수 증가 및 채팅기록 저장
        const room = chatRooms.find((room) => room.name === roomName);
        if (room){
              room.chatCount++;

              // 이 채팅방의 채팅 기록에 메시지를 저장
              room.chatHistory.push({
                name,
                msg,
                time: moment(new Date()).format("h:mm A"),
              });
        } 

        // adminRoomList.html에 채팅방 목록 전송
        io.to("admin").emit("roomList", chatRooms);
  });

  socket.on("joinAdminRoom", () => {
      // adminRoomList.html로부터의 요청을 처리하여 해당 소켓을 "admin" 방에 추가
      socket.join("admin");
      // adminRoomList.html에 채팅방 목록 전송
      socket.emit("roomList", chatRooms);
  });


  socket.on("getChatHistory", (roomName) => {
    // 주어진 roomName에 해당하는 채팅방 찾기
    const room = chatRooms.find((room) => room.name === roomName);
    if (room) {
      // 채팅 기록을 클라이언트에게 전송
      socket.emit("chatHistory", room.chatHistory);
    }
  });

  socket.on("roomClicked", ({roomName, roomId}) => {
    // 찾은 방의 consultationStatus 값을 변경
    const room = chatRooms.find((room) => room.name === roomName && room.socketId === roomId);
    if (room) {
      room.consultationStatus = "배치"; 
    }

    // adminRoomList.html에 채팅방 목록 전송
    io.to("admin").emit("roomList", chatRooms); 
  });

});

