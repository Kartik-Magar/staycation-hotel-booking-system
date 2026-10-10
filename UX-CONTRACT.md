# StayCation UX Contract

## Product context

Guests browse homes, save favourites, and reserve nights. Hosts add and manage homes. The app is currently English-only and displays prices in rupees. There is no payment flow.

## Business-context sources

The Express routes, `User.userType`, `Home.ownerId`, and booking date checks are the current implemented domain rules. There is no separate product brief or permission policy in this repository. Legacy homes without an owner remain visible but cannot be edited from a host account.

## Canonical UI map

| Capability | Current owner | Behavior |
| --- | --- | --- |
| Date | Native date inputs in `views/store/book-now.ejs` | Server validates ISO dates and stay length. |
| Form | EJS forms | Server is authoritative for input checks. |
| CRUD | Host routes and `hostController` | Return to the host list after create, edit, or delete. |
| Navigation | `views/partials/nav.ejs` | Guest and host links follow account role. |

## Flow ledger

| Operation | Trigger | Success | Failure |
| --- | --- | --- | --- |
| Add home | Host submits the form with an image | Redirect to host list | Invalid input is rejected; server errors keep the user on an error response. |
| Edit home | Owner submits changed details | Redirect to host list | Non-owner gets 404; invalid input is rejected. |
| Delete home | Owner submits delete | Redirect to host list | Non-owner gets 404. |
| Book home | Guest submits valid dates | Redirect to bookings | Invalid dates get 400; an occupied stay gets 409. |

## Permission and data behavior

Guest-only routes redirect anonymous visitors to login and return 403 for hosts. Host routes redirect anonymous visitors to login and return 403 for guests. Home edits and deletion require `ownerId` to match the signed-in host. Server-side checks are authoritative; navigation visibility is only a convenience.

## Verification and open work

The current repository has date-unit tests and EJS compilation checks. Browser-level accessibility and complete create/edit/delete flow tests require a connected MongoDB test database. The current views still need a future shared validation and feedback system, app-owned delete confirmation, and booking concurrency protection.
