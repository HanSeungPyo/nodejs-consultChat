// 요소 참조
var consultBtn = document.getElementById("consultBtn");
var chatContainer = document.getElementById("chatContainer");
var closeChat = document.getElementById("closeChat");
var chatContent = document.getElementById("chatContent");

// 상담 버튼 클릭 시 채팅 창 보이기 및 user.html 로드
consultBtn.onclick = function() {
    // 버튼의 위치를 기반으로 팝업 창 위치 조정
    var rect = consultBtn.getBoundingClientRect();
    var chatRect = chatContainer.getBoundingClientRect();
    chatContainer.style.left = (rect.left + window.scrollX + rect.width / 2 - chatRect.width / 2) + 'px';
    chatContainer.style.top = (rect.top + window.scrollY - chatRect.height) + 'px';

    // 팝업 창이 화면 밖으로 넘어가지 않도록 조정
    chatRect = chatContainer.getBoundingClientRect();
    if (chatRect.left < 0) {
        chatContainer.style.left = '0px';
    }
    else if (chatRect.right > window.innerWidth) {
        chatContainer.style.left = (window.innerWidth - chatRect.width) + 'px';
    }
    if (chatRect.top < 0) {
        chatContainer.style.top = '0px';
    }

    chatContent.src = "user.html";  // user.html 로드
    chatContainer.classList.remove("hidden");
}
// X 버튼 클릭 시 채팅 창 숨기기
closeChat.onclick = function() {
    chatContent.src = "";  // iframe 내용 비우기
    chatContainer.classList.add("hidden");
}