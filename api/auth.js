// Vercel-функція: початок входу через GitHub.
// Перенаправляє на сторінку авторизації GitHub.
module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) { res.statusCode = 500; res.end('GITHUB_CLIENT_ID не налаштовано'); return; }
  const host = req.headers.host;
  const redirect = 'https://' + host + '/api/callback';
  const state = Math.random().toString(36).slice(2);
  const url = 'https://github.com/login/oauth/authorize'
    + '?client_id=' + encodeURIComponent(clientId)
    + '&scope=repo'
    + '&redirect_uri=' + encodeURIComponent(redirect)
    + '&state=' + state;
  res.writeHead(302, { Location: url });
  res.end();
};
