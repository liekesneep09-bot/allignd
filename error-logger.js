const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        fs.appendFileSync('client-errors.log', body + '\n\n');
        res.end('ok');
    });
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  }
});
server.listen(9999, () => {
  console.log('Error logger listening on 9999');
});
