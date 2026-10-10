# StayCation

An Express/EJS hotel listing and booking application backed by MongoDB. Guests can browse homes, save favourites, and reserve dates. Hosts can create and manage their own listings.

## Run locally

Requires Node.js 22 and a MongoDB database (MongoDB Atlas works).

1. Run `npm ci`.
2. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and a long random `SESSION_SECRET`.
3. Export those values into the process environment, then run `npm start`.

The app listens on `PORT` (default 3001). `/health` returns 200 only while MongoDB is connected.

## Deploy to Render

The repository includes `render.yaml` for a free Node web service. Create a new Render Blueprint from this repository, provide `MONGODB_URI` in Render's secure environment variable prompt, and deploy. Render generates `SESSION_SECRET` automatically. The build command is `npm ci` and the start command is `npm start`.

The old MongoDB credential was embedded in the original Git commit. **Rotate that database user's password in MongoDB Atlas before deployment**, then use the new URI on Render. Removing a secret from the current source does not remove it from Git history.

New image uploads are stored in MongoDB GridFS, so they survive Render redeploys. Images committed in the `uploads` directory remain available for older listings. Render's free filesystem is ephemeral; avoid storing new data on local disk.

## Current limitations

- Listings created before ownership tracking have no `ownerId`; they remain public but are absent from host management until an administrator assigns an owner.
- Booking overlap is checked before saving, but simultaneous requests can still race. A database backed per-night reservation lock or transaction would be needed to guarantee no double booking under concurrency.
- There is no payment flow, email confirmation, password reset, or automated browser test suite.

Run `npm test` for date validation tests.
