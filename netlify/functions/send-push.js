// 관리자 페이지(send-notice.html)에서 로그인한 사람만 호출할 수 있는 알림 발송 함수.
// scripts/send-push.js와 동일한 로직이며, Firebase 서비스 계정 키는 코드가 아니라
// Netlify 환경변수(FIREBASE_SERVICE_ACCOUNT)에 저장해 사용한다.
const admin = require('firebase-admin');

const SITE_URL = 'https://helpful-peony-450edf.netlify.app/';

function getApp() {
  if (admin.apps.length) return admin.app();
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: JSON.stringify({ error: '로그인이 필요합니다.' }) };
  }

  let title = '';
  let body = '';
  try {
    const parsed = JSON.parse(event.body || '{}');
    title = String(parsed.title || '').trim();
    body = String(parsed.body || '').trim();
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: '요청 형식이 올바르지 않습니다.' }) };
  }
  if (!title || !body) {
    return { statusCode: 400, body: JSON.stringify({ error: '제목과 내용을 모두 입력해주세요.' }) };
  }

  try {
    const app = getApp();
    const db = app.firestore();

    const announcementRef = await db.collection('announcements').add({
      title,
      body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const snapshot = await db.collection('push_tokens').get();
    const tokens = snapshot.docs.map((d) => d.id);

    if (tokens.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: '알림함에는 저장했지만, 아직 알림을 구독한 사람이 없어 푸시는 못 보냈습니다.' }),
      };
    }

    const message = {
      notification: { title, body },
      data: { announcementId: announcementRef.id },
      webpush: {
        fcmOptions: { link: SITE_URL },
        notification: { icon: SITE_URL + 'assets/img/icons/icon-192.png', tag: announcementRef.id },
      },
    };

    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));

    let successCount = 0;
    let failCount = 0;
    const invalidTokens = [];

    for (const chunk of chunks) {
      const res = await app.messaging().sendEachForMulticast({ ...message, tokens: chunk });
      res.responses.forEach((r, idx) => {
        if (r.success) {
          successCount += 1;
        } else {
          failCount += 1;
          const code = r.error && r.error.code;
          if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
            invalidTokens.push(chunk[idx]);
          }
        }
      });
    }

    if (invalidTokens.length > 0) {
      const batch = db.batch();
      invalidTokens.forEach((t) => batch.delete(db.collection('push_tokens').doc(t)));
      await batch.commit();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message:
          `발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`
          + (invalidTokens.length ? `, 만료된 구독 ${invalidTokens.length}건 정리` : '')
          + ' (알림함에도 저장됨)',
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: '발송 중 오류가 발생했습니다.' }) };
  }
};
