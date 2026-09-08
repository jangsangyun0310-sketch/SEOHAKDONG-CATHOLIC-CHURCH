// 웹 푸시 알림(Firebase Cloud Messaging) 설정
// 아래 값들은 Firebase 콘솔(https://console.firebase.google.com)에서 프로젝트를 만든 뒤
// "프로젝트 설정 > 일반 > 내 앱(웹 앱 추가)"에서 나오는 값들로 바꿔주세요.
// 이 값들은 비밀키가 아니라 공개되어도 되는 값입니다 (Firestore 보안 규칙이 실제 보호막입니다).
window.FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

// Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 > 웹 구성 > "웹 푸시 인증서" 에서 키 쌍을 생성하면 나오는 값
window.FIREBASE_VAPID_KEY = "REPLACE_ME";
