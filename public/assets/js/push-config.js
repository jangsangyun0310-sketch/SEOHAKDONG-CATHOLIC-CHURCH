// Firebase 설정 — 관리자 구글 로그인과 휴대폰 푸시 알림에만 쓴다 (데이터 저장은 서버의 D1).
// 아래 값들은 Firebase 콘솔 "프로젝트 설정 > 일반 > 내 앱"에서 나오는 값이며,
// 비밀키가 아니라 공개되어도 되는 값입니다 (관리자 권한은 서버가 로그인 토큰과 관리자 명단으로 확인).
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBFqfixoo2Rky7VU7-WPZ43qisL3dFMY9g",
  authDomain: "seohakdong-church.firebaseapp.com",
  projectId: "seohakdong-church",
  storageBucket: "seohakdong-church.firebasestorage.app",
  messagingSenderId: "270912339972",
  appId: "1:270912339972:web:f25d3096f300c3de72b551"
};

// Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 > 웹 구성 > "웹 푸시 인증서" 에서 키 쌍을 생성하면 나오는 값
window.FIREBASE_VAPID_KEY = "BEy7c9Fwfyl0WDP-n_ZYCPEGHNgO8WNUTrbQ3xmpadJMyEZeF7PvqWHfJd16PEoiYiiiuTua59rKORXK44RKt1A";

// 대표 관리자 구글 계정. 이 계정은 관리자 명단에 없어도 항상 관리자로 취급되며 (서버 설정 OWNER_EMAIL과 같아야 함),
// 관리자 페이지에서 다른 관리자를 추가·삭제할 수 있는 유일한 계정이다.
window.SITE_OWNER_EMAIL = "jangsangyun0310@gmail.com";
