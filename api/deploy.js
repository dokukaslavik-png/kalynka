// Vercel-функція: після збереження на сайті запускає оновлення (Deploy Hook).
// Потрібно, бо на безкоштовному плані Vercel блокує автодеплой комітів,
// зроблених не власником акаунта (наприклад, мамою).
// Захист: спрацьовує лише для того, хто реально має право запису в репозиторій.
const OWNER = 'dokukaslavik-png';
const REPO = 'kalynka';

module.exports = async (req, res) => {
  const send = (code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
  if (req.method !== 'POST') return send(405, { error: 'POST only' });
  const hook = process.env.VERCEL_DEPLOY_HOOK;
  if (!hook) return send(200, { skipped: 'VERCEL_DEPLOY_HOOK не налаштовано' });
  const auth = req.headers.authorization || '';
  if (!/^token \S+$/.test(auth)) return send(401, { error: 'no token' });
  try {
    const r = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO, {
      headers: { Authorization: auth, Accept: 'application/vnd.github+json', 'User-Agent': 'kalynka-site' }
    });
    if (!r.ok) return send(403, { error: 'no access' });
    const j = await r.json();
    if (!j.permissions || !j.permissions.push) return send(403, { error: 'no push access' });
    const h = await fetch(hook, { method: 'POST' });
    return send(200, { ok: h.ok });
  } catch (e) {
    return send(500, { error: String(e && e.message || e) });
  }
};
