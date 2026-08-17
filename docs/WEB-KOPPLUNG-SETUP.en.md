# Set up web pairing (Cloudflare Worker)

> 🇩🇪 **Deutsche Fassung:** [WEB-KOPPLUNG-SETUP.md](WEB-KOPPLUNG-SETUP.md)

So that a source can be typed **in a browser on your PC or phone** while SelfStore
picks it up **automatically on the TV**, you need a tiny, free "mailbox" service. You
set it up **once** on Cloudflare — all in the browser, no command line. Takes about
10 minutes.

> The service's code lives in [`pair/worker.js`](../pair/worker.js).

## 1. Free Cloudflare account
- Sign up at **dash.cloudflare.com** (free, no credit card required).

## 2. Create the KV store (the "mailbox")
1. In the left menu: **Storage & Databases → KV**.
2. **Create a namespace** → name it e.g. `selfstore-pair` → **Add**.

## 3. Create the Worker
1. Left menu: **Workers & Pages → Create → Create Worker**.
2. Name it e.g. `selfstore-pair` → **Deploy** (with the sample code for now).
3. Then open **Edit code**, paste the **entire** contents of `pair/worker.js`
   (replacing the old code) → **Deploy**.

## 4. Bind the mailbox to the Worker
1. On the Worker: **Settings → Bindings** (or **Variables**).
2. **Add binding → KV Namespace**.
3. **Variable name:** `PAIR` (exactly this!) · **KV namespace:** `selfstore-pair`.
4. **Save / Deploy**.

## 5. Test the address
The Worker now has an address like:

```
https://selfstore-pair.YOUR-NAME.workers.dev
```

Test: open `https://selfstore-pair.YOUR-NAME.workers.dev/pair/ABCDEF` in a browser.
You should see:

```json
{"pending":true}
```

If so → the mailbox is running. ✅

## 6. Register the address
Enter the **Worker address** (the `…workers.dev` one) as `pairEndpoint` in
`catalog.json`. Both **the app and the web page** read it from there — a single place
to configure.

> If you change the Worker host, also update it in the `connect-src` directive of the
> Content-Security-Policy in `pair/index.html`.

## Optional: a nicer address
Instead of `…workers.dev` you can later give the Worker its own route (e.g.
`pair.selfcoder.de`). For getting started the `workers.dev` address is perfectly fine.

## Security
- **End-to-end encrypted (since SelfStore 1.5.0).** The TV shows a code in two parts:
  `SLOT-KEY` (e.g. `7K2Q9XAB-4H7PNM`). Only the **slot** goes to the Worker; the **key
  part** travels solely through the user's eyes into the browser. The mailbox therefore
  only ever holds ciphertext (AES-256-GCM, key derived with PBKDF2-HMAC-SHA256, 200,000
  rounds) — **the Worker and Cloudflare cannot read link or password**.
- The Worker **no longer accepts unencrypted submissions** (`encryption_required`).
- Data stays in the mailbox for **3 minutes at most** (TTL 180 s) and is **deleted
  immediately** when the TV picks it up (single use).
- Transport is **HTTPS only**; the pairing page runs with a strict CSP and no inline
  script.
- On top of that, SelfStore shows the received source **for confirmation** before
  adding it.

> ⚠️ **Compatibility:** web pairing only works with SelfStore **v1.5.0 or newer**.
> Older installations do not understand the encrypted format — there, update SelfStore
> first or type the source directly on the TV.
>
> ⚠️ **After every change to `pair/worker.js`:** the Worker is **not** updated by a git
> push. Go to dash.cloudflare.com → Workers & Pages → `selfstore-pair` → **Edit code**
> → paste the contents of `pair/worker.js` → **Deploy**. Allow a few seconds for
> propagation, then verify with an unencrypted POST — it must return
> `encryption_required`.
