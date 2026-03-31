
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>DevOps Demo</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>🚀 DevOps Pipeline Demo</h1>
        <p>Version: 1.0.0</p>
        <p>Built with Jenkins | Stored in Nexus | Deployed on Kubernetes</p>
        <p>Project built by Lakshmikanth</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
