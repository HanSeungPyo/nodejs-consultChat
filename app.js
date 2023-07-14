const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");

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
  socket.on("joinRoom", (roomName) => {
      // 해당 방에 참가
      socket.join(roomName);
     
      console.log(`${roomName} 방에 참가 하셨습니다.`);

      // 채팅방 정보 저장
      const room = {
          name: roomName,
          socketIds: [socket.id],
          chatCount: 0, // 채팅 개수 초기값 0으로 설정
          time: moment(new Date()).format("h:mm A")
      };
      chatRooms.push(room);

      
      // admin.html에 새로운 채팅방 목록 전송
      io.to("admin").emit("roomList", chatRooms);
  });

  socket.on("chatting", (data) => {
      const { name, msg, roomName } = data;

      // 해당 채팅방에 메시지 전송
      io.to(roomName).emit("chatting", {
          name,
          msg,
          time: moment(new Date()).format("h:mm A")
      });

      
        // 해당 채팅방의 채팅 개수 증가 
        const room = chatRooms.find((room) => room.name === roomName);
        if (room){
              room.chatCount++;
        } 

        // admin.html에 채팅방 목록 전송
        io.to("admin").emit("roomList", chatRooms);
  });

  socket.on("joinAdminRoom", () => {
      // admin.html로부터의 요청을 처리하여 해당 소켓을 "admin" 방에 추가
      socket.join("admin");
      // admin.html에 채팅방 목록 전송
      socket.emit("roomList", chatRooms);
  });
});

