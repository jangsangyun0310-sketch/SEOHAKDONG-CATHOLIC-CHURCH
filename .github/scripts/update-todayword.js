// Fetches today's Korean Catholic liturgical info from the official 가톨릭굿뉴스
// daily-mass page and writes it to Firestore (site_data/todayword), which the
// homepage reads client-side. This intentionally does NOT touch index.html or
// git-commit anything, so this daily run never triggers a Netlify redeploy
// (each redeploy costs Netlify build credits; a Firestore write does not).
//
// Safety rule: if any expected value cannot be extracted with confidence,
// this script exits with an error and leaves Firestore untouched — it never
// guesses, paraphrases, or reuses a stale value for public-facing liturgical text.

const admin = require('firebase-admin');

const SOURCE_URL = 'https://maria.catholic.or.kr/mobile/missa/missa_view.asp?today=on';

function fail(reason) {
  console.error(`FAIL: ${reason}`);
  process.exit(1);
}

async function main() {
  const res = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    },
  });
  if (!res.ok) fail(`source page returned HTTP ${res.status}`);
  const html = await res.text();

  // A) date / liturgical color / feast name, from the first Korean (class="active") view_content(...) link
  const headMatch = html.match(
    /<a class="active" href="javascript:view_content\('(\d+)','([^']*)','(\d{8})','([^']*)','([^']*)','([^']*)'\);">/
  );
  if (!headMatch) fail('could not find the date/color/feast <a class="active" ...> tag');
  const [, , color, yyyymmdd, feastName] = headMatch;
  if (!/^(백|홍|녹|자|흑)$/.test(color)) fail(`unexpected liturgical color value: "${color}"`);
  if (!feastName) fail('feast name was empty');

  // B) today's Gospel quote, book, and citation
  const gospelMatch = html.match(
    /&lt;([^&]+?)&gt;<br>[^\s]*\s*([가-힣]+)가 전한 거룩한 복음입니다\.([0-9]+,[0-9,\-.]+)<br>/
  );
  if (!gospelMatch) fail('could not find the Gospel quote/citation pattern');
  const [, quoteRaw, book, citation] = gospelMatch;
  let quote = quoteRaw.trim();
  if (!quote) fail('Gospel quote text was empty');
  if (!/[.!?]$/.test(quote)) quote += '.';

  const ym = `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}`;
  const day = yyyymmdd.slice(6, 8);
  const verse = `${quote} (${book} ${citation})`;

  console.log('Extracted:', JSON.stringify({ ym, day, color, feastName, verse }, null, 2));

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  await admin.firestore().collection('site_data').doc('todayword').set({
    ym,
    day,
    color,
    feastName,
    verse,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Updated Firestore site_data/todayword');
}

main().catch((err) => fail(err.stack || String(err)));
