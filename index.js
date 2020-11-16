
const express = require('express');
const app = express();

const ply = require('./PlyPointCloud');

app.use(express.static('public'));

app.get('/random', (req, res) => {
  const format = req.query.format || ply.PlyFormat.Binary;
  const width = req.query.width || 20;
  const height = req.query.height || 20;
  const depth = req.query.height || 20;
  const count = req.query.count || 100000;
  let points = [];

  for (i = 0; i < count; ++i) {
    points.push({
      x: Math.random() * width - 0.5 * width,
      y: Math.random() * height - 0.5 * height,
      z: Math.random() * depth - 0.5 * depth,
      red: Math.random() * 255,
      green: Math.random() * 255,
      blue: Math.random() * 255
    });
  }

  res.contentType('text/plain');

  let plyCloud = new ply.PlyPointCloud(points);
  let start = Date.now();

  plyCloud.write('public/points.ply', format);

  res.send(`'points.ply' written in ${(Date.now() - start)}ms`);
});

const port = 8000;

app.listen(port, () => {
  console.log(`Listening @${port} ...`)
});
