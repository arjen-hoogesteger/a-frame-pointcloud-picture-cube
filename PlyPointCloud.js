
const fs = require('fs');

const PlyFormat = {
  Ascii: 'ascii',
  Binary: 'binary'
};

module.exports.PlyFormat = PlyFormat;

class PlyPointCloud {
  constructor(points) {
    this.points = points
  }

  writeHeader(fd, format) {
    fs.writeSync(fd,
`ply
format ${format}
element vertex ${this.points.length}
property float32 x
property float32 y
property float32 z
property uchar red
property uchar green
property uchar blue
end_header
`
    );
  }

  writeAscii(fd) {
    this.writeHeader(fd, 'ascii 1.0');
    this.points.forEach((p, index) => {
      fs.writeSync(
        fd,
        `${p.x} ${p.y} ${p.z} ${p.red} ${p.green} ${p.blue}\n`
      );
    });
  }

  writeBinary(fd) {
    this.writeHeader(fd, 'binary_little_endian 1.0');

    const recordLength = 12 + 3; // x, y, z + rgb
    let data = new ArrayBuffer(recordLength * this.points.length);
    let buffer = Buffer.from(data);

    this.points.forEach((p, i) => {
      let offset = i * recordLength;
      buffer.writeFloatLE(p.x, offset);
      buffer.writeFloatLE(p.y, offset + 4);
      buffer.writeFloatLE(p.z, offset + 8);
      buffer.writeUInt8(p.red, offset + 12);
      buffer.writeUInt8(p.green, offset + 13);
      buffer.writeUInt8(p.blue, offset + 14);
    });

    fs.writeSync(
      fd,
      buffer
    )
  }

  write(filename, format) {
    let fd = fs.openSync(filename, 'w');

    switch (format) {
      case PlyFormat.Ascii:
        this.writeAscii(fd);
        break;

      case PlyFormat.Binary:
      default:
        this.writeBinary(fd);
        break;
    }

    fs.closeSync(fd);
  }
}

module.exports.PlyPointCloud = PlyPointCloud;
