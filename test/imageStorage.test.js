const test = require("node:test");
const assert = require("node:assert/strict");
const { validImage } = require("../utils/imageStorage");

test("accepts supported image signatures", () => {
  assert.equal(validImage({ mimetype: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]) }), true);
  assert.equal(validImage({ mimetype: "image/png", buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) }), true);
  assert.equal(validImage({ mimetype: "image/webp", buffer: Buffer.from("RIFF....WEBP") }), true);
});

test("rejects a spoofed image", () => {
  assert.equal(validImage({ mimetype: "image/jpeg", buffer: Buffer.from("<script>") }), false);
});
