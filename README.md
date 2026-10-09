# One Card Wiser

A static daily-learning app at https://onecardwiser.com, hosted on GitHub Pages.

## This upgrade

- 33 written cards with further-reading links and existing quick quizzes.
- Written daily cards first; least recently seen review once a topic's collection is exhausted.
- Wikipedia discovery remains optional and is labelled as an adapted source preview, with attribution.
- Progress remains under the existing `daily-knowledge-v1` localStorage key. Dated completion logs preserve streak history when revisiting a card.
- Native sharing or clipboard fallback; 1080 × 1920 story PNG downloads.
- Install manifest and service worker for written cards offline after the first successful cache installation.
- 12 topic collections, 33 public card pages, two learning guides, privacy page, canonical URLs, social preview, robots.txt and sitemap.xml.
- Optional Google Analytics wiring. It is disabled by default and loads only after a measurement ID is configured and the visitor allows analytics.

## Maintain and check

Edit the written content and quizzes in `content.js`. Add the corresponding further-reading URL in `CARD_SOURCES`.

Run the automated logic and static checks with Node.js:

```sh
node scripts/test-logic.cjs
```

To regenerate public pages, sitemap and PNG assets, use Python with Pillow installed and Node.js on PATH:

```sh
python scripts/build-public.py
```

Preview using a local static server:

```sh
python -m http.server 8765
```

The tests exercise allocation, legacy progress, saving, completion, streak retention, undo, invalid state, duplicate rejection, unavailable storage, public share URLs, sitemap assets and the service worker's offline branches. They use a lightweight DOM stub and do not substitute for real browser testing. Verify the dialog layout, native share flow, story download, device installation and offline reload in a real browser before broad promotion.

## External setup still needed

Google Search Console ownership verification and sitemap submission require the owner's Google account. Google Analytics requires a measurement ID in `analytics-config.js`; review the privacy notice before enabling it. Google indexing/ranking is not guaranteed by these files.

Accounts, cross-device sync, notification delivery and a continually expanding reviewed content pipeline are not included in this upgrade. The written collection is finite, especially in the nine topics with one written card each. Wikipedia previews are extra reading, not automatically reviewed daily content.

## Deploy

GitHub Pages serves the default branch. Merging this upgrade into that branch publishes it. Keep `CNAME` set to `onecardwiser.com`. When changing cached app assets in a later release, increment the service worker cache version. The worker waits for existing app tabs to close before activating an updated worker.
