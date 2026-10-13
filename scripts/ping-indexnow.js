/**
 * Skrip pengiriman IndexNow otomatis (Microsoft Bing & DuckDuckGo)
 * Dijalankan otomatis saat proses postbuild / deployment
 */

const INDEXNOW_KEY = '69bf7c858593452292f7596827018c15';
const HOST = 'www.ibraglobalenglish.uk';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/about`,
  `https://${HOST}/calendar`,
  `https://${HOST}/placement-test`,
  `https://${HOST}/kemitraan`,
  `https://${HOST}/gallery`,
  `https://${HOST}/formulir-offline`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`
];

async function submitToIndexNow() {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`IndexNow ping berhasil! Status: ${res.status} (${URL_LIST.length} URL terkirim ke Bing & DuckDuckGo)`);
    } else {
      console.warn(`IndexNow response status: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.warn(`Gagal mengirim IndexNow ping: ${err.message}`);
  }
}

submitToIndexNow();
