const { GridFSBucket, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Readable } = require("stream");

function bucket() {
  return new GridFSBucket(mongoose.connection.db, { bucketName: "photos" });
}

function imageId(photo) {
  const match = /^uploads\/([a-f\d]{24})$/i.exec(photo || "");
  return match ? new ObjectId(match[1]) : null;
}

function validImage(file) {
  const data = file.buffer;
  if (file.mimetype === "image/jpeg") return data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (file.mimetype === "image/png") return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === "image/webp") return data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP";
  return false;
}

async function saveImage(file) {
  if (!validImage(file)) throw Object.assign(new Error("Invalid image file"), { status: 422 });
  const upload = bucket().openUploadStream(file.originalname, {
    metadata: { contentType: file.mimetype },
  });
  await new Promise((resolve, reject) => {
    Readable.from(file.buffer).pipe(upload).on("finish", resolve).on("error", reject);
  });
  return `uploads/${upload.id}`;
}

async function deleteImage(photo) {
  const id = imageId(photo);
  if (id) await bucket().delete(id);
}

async function serveImage(req, res, next) {
  if (!ObjectId.isValid(req.params.id) || req.params.id.length !== 24) return next();
  try {
    const id = new ObjectId(req.params.id);
    const files = await bucket().find({ _id: id }).toArray();
    if (!files.length) return res.sendStatus(404);
    res.set("X-Content-Type-Options", "nosniff");
    res.type(files[0].metadata?.contentType || "application/octet-stream");
    bucket().openDownloadStream(id).on("error", next).pipe(res);
  } catch (error) {
    next(error);
  }
}

module.exports = { saveImage, deleteImage, serveImage, validImage };
