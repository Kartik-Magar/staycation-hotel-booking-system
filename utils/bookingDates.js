function parseBookingDates(checkin, checkout) {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDate.test(checkin || "") || !isoDate.test(checkout || "")) return null;
  const start = new Date(`${checkin}T00:00:00.000Z`);
  const end = new Date(`${checkout}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (start.toISOString().slice(0, 10) !== checkin || end.toISOString().slice(0, 10) !== checkout) return null;
  const today = new Date().toISOString().slice(0, 10);
  const nights = (end - start) / 86_400_000;
  if (checkin < today || nights < 1 || nights > 365) return null;
  return { start, end, nights };
}

module.exports = { parseBookingDates };
