self.addEventListener('install', event => {
  console.log('서비스 워커 설치');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('서비스 워커 활성화');
});

// 웹 페이지에서 postMessage를 통해 메시지를 수신
self.addEventListener('message', event => {
  const data = event.data;
  console.log('메시지 수신:', data);

  // 알림 생성
  self.registration.showNotification(data.title, {
    body: data.body,
  });
});

self.addEventListener('push', event => {
  console.log('푸시 이벤트 수신');

  const data = event.data.text();

  const options = {
    body: data,
  };

  event.waitUntil(
    self.registration.showNotification("서버에서", options)
  );
});