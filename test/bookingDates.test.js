const test = require("node:test");
const assert = require("node:assert/strict");
const { parseBookingDates } = require("../utils/bookingDates");

const future = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
const later = new Date(Date.now() + 13 * 86_400_000).toISOString().slice(0, 10);

test("accepts a valid stay and calculates nights", () => {
  assert.equal(parseBookingDates(future, later).nights, 3);
});

test("rejects invalid, reversed, and past dates", () => {
  assert.equal(parseBookingDates("2026-02-30", later), null);
  assert.equal(parseBookingDates(later, future), null);
  assert.equal(parseBookingDates("2020-01-01", "2020-01-02"), null);
});
