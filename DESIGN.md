---
version: alpha
name: StayCation
description: A bright travel catalog with dark listing surfaces and direct booking actions.
colors:
  ink: "#1B1B1B"
  coral: "#EF4444"
  gold: "#FACC15"
  paper: "#FFFFFF"
  action: "#16A34A"
typography:
  sans:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
rounded:
  card: "1rem"
  control: "0.5rem"
spacing:
  card-gap: "1.5rem"
components:
  listing-card: {}
  booking-form: {}
---

# StayCation Design System

## Overview

StayCation serves guests browsing homes and hosts maintaining listings. The existing UI uses a travel-poster feel: prominent photography, dark listing panels, bright red actions, and warm yellow headings. The landing page carries the most expression; booking and host forms should favor clear tasks and legible feedback. This file records the existing direction rather than a redesign.

The EJS templates use Tailwind CDN utilities directly. Those templates are the current runtime token source; the frontmatter above mirrors their most repeated values. A future shared stylesheet should become the single token owner before changing the palette.

## Colors

`ink` is the dark card surface, `paper` the light form surface, `coral` the main action, `gold` the display accent, and `action` the booking action. Existing pages also use blue and gray gradients; keep those as page backgrounds until a deliberate shared theme pass. Text on dark panels must remain light and readable.

## Typography

The app currently relies on Tailwind's system sans stack. Large headings give the travel catalog its character; form labels and prices use smaller, direct type. Use normal sentence case for new controls and error messages.

## Layout

Listings use responsive one-to-three-column grids and a maximum width near 72rem. Forms use a centered narrow column. Reserve image dimensions so card layout stays stable. Maintain usable widths on a phone.

## Elevation & Depth

Listing and form cards use shadows over gradient backgrounds. Keep the task-critical controls visually steadier than decorative hover effects.

## Shapes

Cards use rounded corners near 1rem; inputs and buttons use a smaller radius near 0.5rem. Do not add new shape families for a single screen.

## Components

Booking and host forms should show accepted file types, date constraints, and specific validation errors. Keep navigation links as anchors and mutations as buttons. The current views use emoji as supporting icons, with text labels carrying meaning. Focus states must be visible; motion should respect reduced-motion settings in future shared-style work.

## Do's and Don'ts

- Do keep the listing photo and price easy to scan.
- Do preserve the existing dark-card and bright-action language across guest and host flows.
- Don't use color alone to communicate a booking or upload error.
- Don't add new decorative animation to task forms.
