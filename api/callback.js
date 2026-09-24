// Vercel-функція: завершення входу через GitHub.
// Обмінює код на токен (секрет лишається на сервері) і віддає його у вікно сайту.
module.exports = async (req, res) => {
  const code = req.query && req.query.code;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const host = req.headers.host;
  const origin = 'https://' + host;

  function page(token, errMsg) {
    const t = JSON.stringify(token || '');
    const o = JSON.stringify(origin);
    const err = JSON.stringify(errMsg || '');
    return '<!doctype html><html lang="uk"><head><meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1">'
      + '<title>Вхід…</title></head><body style="font-family:system-ui;padding:30px;text-align:center;color:#2f6f45">'
      + '<p>Готово. Можна закрити це вікно.</p>'
      + '<script>(function(){var t=' + t + ',err=' + err + ';'
      + 'try{if(window.opener){window.opener.postMessage({source:"kalynka-auth",token:t,error:err},' + o + ');}}catch(e){}'
      + 'setTimeout(function(){window.close();},300);})();</script>'
      + '</body></html>';
  }

  if (!clientId || !clientSecret) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 500;
    res.end(page('', 'GITHUB_CLIENT_ID/SECRET не налаштовано на Vercel'));
    return;
  }
  if (!code) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(page('', 'Немає коду авторизації'));
    return;
  }
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code: code })
    });
    const data = await r.json();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(page(data.access_token || '', data.access_token ? '' : 'Не вдалося отримати токен'));
  } catch (e) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 500;
    res.end(page('', 'Помилка обміну токена'));
  }
};
