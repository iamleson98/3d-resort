# Flamingo Cát Bà Resort — Room Photo Collection

Reference photography for every accommodation type published on
[flamingoresorts.vn/flamingo-cat-ba](https://flamingoresorts.vn/flamingo-cat-ba/).

**77 unique high-resolution photographs** across **14 room types**,
organized into one folder per room. Images are original full-resolution uploads
(up to 2560 px wide), de-duplicated by content hash — WordPress `-scaled` copies and
re-upload duplicates were collapsed to a single best-quality file per photo.

## Layout

```
public/rooms/
├── deluxe-mountain-view/    5 photos
├── deluxe-ocean-view/    5 photos
├── premiere-mountain-view/    6 photos
├── premier-ocean-view/    5 photos
├── premiere-beach-front/    5 photos
├── 01-bedroom-deluxe-residence-ocean/    1 photos
├── 01-bedroom-deluxe-residence-mountain/    5 photos
├── 01-bedroom-premier-residence-ocean/    6 photos
├── 01-bedroom-premier-residence-mountain/    6 photos
├── premiere-residence-beach-front/    5 photos
├── 02-bedroom-deluxe-residence-ocean/    7 photos
├── 02-bedroom-premiere-residence-ocean/    5 photos
├── 03-bedroom-premiere-residence-ocean/    8 photos
├── imperial-suite/    8 photos
```

Files are named `<room-slug>-NN.jpg`, numbered in the resort's own image-family order.

## Index

| # | Room | Photos | Detail page |
|---|------|--------|-------------|
| 1 | Deluxe Mountain View | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/deluxe-mountain-view/) |
| 2 | Deluxe Ocean View | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/deluxe-ocean-view/) |
| 3 | Premiere Mountain View | 6 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/premiere-mountain-view/) |
| 4 | Premier Ocean View | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/premier-ocean-view/) |
| 5 | Premiere Beach Front | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/premiere-beach-front/) |
| 6 | 01 Bedroom Deluxe Residence Ocean | 1 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/01-bedroom-deluxe-residence-ocean/) |
| 7 | 01 Bedroom Deluxe Residence Mountain | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/01-bedroom-deluxe-residence-mountain/) |
| 8 | 01 Bedroom Premier Residence Ocean | 6 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/01-bedroom-premier-residence-ocean/) |
| 9 | 01 Bedroom Premier Residence Mountain | 6 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/01-bedroom-premier-residence-mountain/) |
| 10 | Premiere Residence Beach Front | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/premiere-residence-beach-front/) |
| 11 | 02 Bedroom Deluxe Residence Ocean | 7 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/02-bedroom-deluxe-residence-ocean/) |
| 12 | 02 Bedroom Premiere Residence Ocean | 5 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/02-bedroom-premiere-residence-ocean/) |
| 13 | 03 Bedroom Premiere Residence Ocean | 8 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/03-bedroom-premiere-residence-ocean/) |
| 14 | Imperial Suite | 8 | [view](https://flamingoresorts.vn/flamingo-cat-ba/accommodation/imperial-suite/) |

## Notes

- Some room pages on the source site currently display a single hero photo
  (their built-in galleries are marked *"coming soon"*); every image family the
  site's media library exposes for each room has been collected here.
- `01 Bedroom Deluxe Residence Ocean` has exactly one photo published on the site.
- Original filenames (e.g. `Premier-Beachfront-3-scaled.jpg`) were renamed to the
  scheme above; the source filename for each saved photo is recorded in
  `public/rooms/manifest.json` alongside dimensions and provenance.
- These photographs are served as static assets by Vite (`/rooms/<slug>/...`),
  ready to power a real-photo gallery or texture reference workflow in the 3D app.
