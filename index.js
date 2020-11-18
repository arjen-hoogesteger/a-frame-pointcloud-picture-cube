
const express = require('express');
const sharp = require('sharp');
const app = express();

const ply = require('./PlyPointCloud');

app.use(express.static('public'));

app.get('/image_cube', (req, res) => {
  const imageUrl = req.query.in || 'public/sweco.jpg';
  const plyName = req.query.out || 'public/points.ply';
  const image = sharp(imageUrl);

  let imageWidth = 0;
  let imageHeight = 0;

  image.metadata()
  .then((data) => {
    imageWidth = data.width;
    imageHeight = data.height;

    return image.raw().toBuffer();
  })
  .then((pixels) => {
    const plyFormat = req.query.format || ply.PlyFormat.Binary;
    const cubeWidth = req.query.width || 20;
    const cubeHeight = req.query.height || 20;
    const cubeDepth = req.query.height || 20;
    const pointCount = req.query.count || 100000;
    let points = [];

    for (i = 0; i < pointCount; ++i) {
      const xRand = Math.random();
      const yRand = Math.random();

      let p = {
        x: xRand * cubeWidth - 0.5 * cubeWidth,
        y: yRand * cubeHeight - 0.5 * cubeHeight,
        z: Math.random() * cubeDepth - 0.5 * cubeDepth
      };

      const pixelX = Math.floor(xRand * imageWidth);
      const pixelY = imageHeight - Math.floor(yRand * imageHeight);

      const pixelsPerRow = pixels.length / imageHeight;
      const rowIndex = pixelsPerRow * pixelY;
      const offset = 3 * pixelX; // rgb is assumed, sometimes this may be a wrong assumption ...
      const pixelIndex = rowIndex + offset;

      p.red = pixels[pixelIndex];
      p.green = pixels[pixelIndex + 1];
      p.blue = pixels[pixelIndex + 2];

      points.push(p);
    }

    res.contentType('text/plain');

    let plyCloud = new ply.PlyPointCloud(points);
    let start = Date.now();

    plyCloud.write(plyName, plyFormat);

    res.send(`'${plyName}' written in ${(Date.now() - start)}ms`);
  })
  .catch((err) => {
    console.log(err);
    res.send();
  });
});

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
