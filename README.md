# ResolveDesk

[![CI](https://github.com/kvvraju24/resolvedesk/actions/workflows/ci.yml/badge.svg)](https://github.com/kvvraju24/resolvedesk/actions/workflows/ci.yml)

A support-request routing and review platform. Customers submit requests, a machine-learning classifier suggests a category, and requests the model is confident about are routed straight to the right team. Uncertain ones go to a human review inbox. An adjustable **confidence threshold** controls the tradeoff between automatic routing and wrong assignments. A **model-health page** watches live traffic for drift and warns when the model stops behaving as it did on validation data.

Built around the [CLINC150](https://github.com/clinc/oos-eval) intent benchmark, which also includes out-of-scope ("unsupported") requests.

## Results (held-out test set, model `v1-baseline`)

| Metric | Value |
|---|---|
| Accuracy, 20 in-scope categories (600 test requests) | **95.3%** (macro F1 95.3%) |
| Routed automatically at threshold 0.57 | **90.3%** of in-scope requests |
| Accuracy of the auto-routed requests | **99.1%** |
| Unsupported requests accepted incorrectly (CLINC `oos_test`, n=1000) | **6.0%** |
| Unsupported requests accepted incorrectly (the other 130 CLINC intents, n=3900) | **9.8%** |

The threshold was chosen on **validation data only**: it is the lowest confidence at which ≥95% of auto-routed validation requests are correct. Unsupported requests that get auto-routed count as errors. The test set was scored once, after the threshold was fixed.

On a test mix of 600 in-scope and 1000 out-of-scope requests (much more out-of-scope traffic than in validation), 37.6% of requests are auto-routed and 10.8% of those are wrong. The dashboard lets you see how this changes as you move the threshold.

<details>
<summary>Per-category results (test set, 30 requests each)</summary>

| Category | Team | Precision | Recall | F1 |
|---|---|---|---|---|
| pay_bill | billing | 0.853 | 0.967 | 0.906 |
| report_fraud | banking | 0.963 | 0.867 | 0.912 |
| bill_due | billing | 0.931 | 0.900 | 0.915 |
| report_lost_card | cards | 0.931 | 0.900 | 0.915 |
| spending_history | billing | 0.931 | 0.900 | 0.915 |
| international_visa | travel | 0.964 | 0.900 | 0.931 |
| replacement_card_duration | cards | 0.933 | 0.933 | 0.933 |
| transfer | banking | 0.933 | 0.933 | 0.933 |
| travel_alert | travel | 0.906 | 0.967 | 0.935 |
| card_declined | cards | 1.000 | 0.900 | 0.947 |
| credit_limit_change | cards | 0.909 | 1.000 | 0.952 |
| tire_pressure | auto | 0.909 | 1.000 | 0.952 |
| balance | banking | 1.000 | 0.967 | 0.983 |
| lost_luggage | travel | 1.000 | 0.967 | 0.983 |
| schedule_maintenance | auto | 1.000 | 0.967 | 0.983 |
| book_flight | travel | 0.968 | 1.000 | 0.984 |
| freeze_account | banking | 0.968 | 1.000 | 0.984 |
| jump_start | auto | 1.000 | 1.000 | 1.000 |
| oil_change_how | auto | 1.000 | 1.000 | 1.000 |
| order_checks | billing | 1.000 | 1.000 | 1.000 |

The full metrics, including threshold curves, are in [`backend/data/model/v1-baseline.metrics.json`](backend/data/model/v1-baseline.metrics.json).
</details>

## Model comparison: TF-IDF vs pretrained embeddings

[`compare_embeddings.py`](backend/python/compare_embeddings.py) trains logistic regression on frozen [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) sentence embeddings. It uses **the same splits, threshold rule and evaluation code** as `train.py` (both call `train.evaluate`), so the numbers line up exactly.

| Held-out test | TF-IDF + LR (`v1-baseline`) | MiniLM + LR |
|---|---:|---:|
| In-scope accuracy (600) | 95.3% | **98.3%** |
| Routed automatically (in-scope) | 90.3% | **97.3%** |
| Accuracy of auto-routed requests | 99.1% | 99.1% |
| Unsupported accepted, CLINC `oos` (1,000) | **6.0%** | 9.9% |
| Unsupported accepted, other 130 intents (3,900) | **9.8%** | 15.5% |
| Wrong among auto-routed, mixed set (600 in + 1,000 oos) | **10.8%** | 15.2% |
| Threshold picked on validation | 0.57 | 0.55 |
| Latency per request, p50 (Apple Silicon CPU) | **0.007 ms** (Node) | 2.45 ms (Python) |
| Model size | **0.47 MB** JSON | ~90 MB + PyTorch |

**Decision: keep TF-IDF in production.** The embedding model classifies in-scope requests better, but it is also more confident about requests it should *refuse*, so more unsupported requests get auto-routed to a team. In a support desk a wrongly routed request costs more than a trip through review. TF-IDF also runs inside the Node API with no Python service. The embedding model is the better starting point if unsupported traffic is filtered first, for example by a separate in-scope/out-of-scope detector.

Full metrics: [`embeddings.metrics.json`](backend/data/model/embeddings.metrics.json). Both models appear in the dashboard's comparison table.

## Model health and drift monitoring

Offline test scores say nothing about next month's traffic. The **Model health** page (`/monitoring`, `GET /api/monitoring`) compares recent live predictions with the validation data the threshold was tuned on:

| Check | How | Needs labels? | Alert |
|---|---|---|---|
| Confidence drift | Population Stability Index (PSI) between live and validation confidence (5 bins, trailing 7 days, at least 100 predictions) | No | watch ≥ 0.10, act ≥ 0.25 |
| Review load | share sent to review vs the share expected at the active threshold (36% at 0.57) | No | more than 15 points above expected |
| Auto-route precision (est.) | auto-routed requests later corrected or rejected by an agent count as wrong | Agent reviews | below the 95% target |
| Retraining hint | agent corrections collected in the window | — | 20 or more |

The validation reference comes from the threshold sweep already stored in the metrics file, so no extra data is shipped. Drift and review-load checks need no labels, so they warn before agents have reviewed anything.

**Drift drill.** `npm run simulate` replays three weeks of real held-out CLINC150 test requests through the API (12 simulated customers, 30 requests a day, backdated), and simulated agents review every one with its true label. For 13 days the mix matches validation (about one in three unsupported). Then unsupported traffic jumps to 65%, as if a product launch sent unrelated questions to support:

- During the stable weeks, PSI stays between 0.03 and 0.06 and no alert fires.
- Daily review share rises from around the expected 36% to 50–77%.
- PSI crosses the 0.10 *watch* line on day 4 of the shift and the 0.25 *act* line on day 7.
- Estimated auto-route precision falls to 89.6% (target 95%). The page recommends raising the threshold or retraining.

The subject lines the simulator uses contain only words outside the model's vocabulary, so every prediction equals the prediction on the original CLINC text. The script checks this.

## Project structure

```
resolvedesk/
├── frontend/                 Next.js 16 (App Router), plain CSS
│   ├── app/                  routes: /, /login, /requests, /requests/[id],
│   │                         /agent/inbox, /agent/board, /analytics, /monitoring, 404, error
│   ├── components/           UI components + API client (api.js)
│   └── public/               logo, robots.txt
├── backend/
│   ├── src/                  Express 5 API (Node ≥ 22.13, built-in node:sqlite)
│   │   ├── routes/           core.js (auth, teams, analytics, settings), requests.js
│   │   ├── classifier.js     serves the exported model in pure JS
│   │   ├── routing.js        assignment rules + status transitions
│   │   ├── monitoring.js     drift + model-health checks (PSI, review load, precision)
│   │   ├── simulate.js       three weeks of backdated CLINC traffic with a drift event
│   │   ├── db.js             schema
│   │   ├── baseData.js       teams, staff, model version
│   │   └── seed.js           demo workload replayed through the real API
│   ├── python/               reproducible ML pipeline (train, compare, export corrections)
│   ├── data/model/           exported model JSON + metrics (committed)
│   └── tests/                API + model-parity tests (node:test)
├── temp/                     scratch space (git-ignored)
├── render.yaml               API deploy config
└── .gitignore
```

## Quick start

Requirements: Node ≥ 22.13, Python ≥ 3.10.

```bash
cd backend && npm install && npm run seed && npm run simulate && npm run dev
```

`npm run dev` runs in development mode, which needs no configuration. `npm start` runs in **production mode** and refuses to start until `JWT_SECRET` (at least 32 bytes) and `CORS_ORIGIN` are set; an unset `NODE_ENV` counts as production. See [Configuration](#configuration).

`npm run simulate` is optional. It adds three weeks of backdated traffic with a drift event so the Model health page has data (see above). It reads the cached CLINC150 file, or downloads it.

```bash
cd frontend && npm install && cp .env.example .env.local && npm run dev
```

Open http://localhost:3000. All demo accounts use the password `demo1234`:

| Role | Email | Can |
|---|---|---|
| Customer | alex@example.com (also jordan@, sam@) | submit requests, see **only their own** requests, reply, close resolved requests |
| Agent | maya@resolvedesk.dev (+ omar, lena, raj, sofia, kwame) | review inbox, confirm/correct categories, assign, change status, internal notes, analytics, model health |
| Admin | admin@resolvedesk.dev | everything agents can do, plus change the live threshold |

Self-registration always creates a customer account.

## ML pipeline

```bash
cd backend/python
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python train.py                     # TF-IDF baseline
pip install sentence-transformers   # optional
python compare_embeddings.py        # MiniLM comparison
```

1. Downloads CLINC150 `data_full.json` (cached in `backend/python/data/`).
2. Uses **20 intents in 5 teams** ([`categories.py`](backend/python/categories.py)). Every other intent, plus the `oos` split, counts as unsupported.
3. Trains TF-IDF (1–2 grams, sublinear tf, min_df=2) + logistic regression (C=10, seed 13) on 2,000 training requests.
4. Picks the threshold on validation data: 400 in-scope, 100 oos and 100 sampled other-intent requests.
5. Scores the test set and writes `v1-baseline.json` (the model) and `.metrics.json`.

The Node API serves the exported JSON directly (`src/classifier.js`). The test suite checks that the JS predictions match the Python predictions on 25 fixtures (±0.001).

**Retraining with agent feedback:**

```bash
python export_corrections.py > ../../temp/corrections.csv
python train.py --corrections ../../temp/corrections.csv --version v2-corrections
```

Corrections are only added to the **training** split. Any correction whose text also appears in the validation or test sets is dropped, so agent feedback never reaches the final test set.

## API

All endpoints are under `/api`. Authentication uses `Authorization: Bearer <token>`.

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/auth/register`, `/auth/login` | anyone | get a token |
| POST | `/requests` | customer | **submit request** → classify → auto-route or send to review |
| POST | `/classify` | signed in | **classify text** without creating a request |
| GET | `/requests`, `/requests/:id` | customer (own) / staff | list & detail (`?status=`, `?team=`, `?mine=1`) |
| POST | `/requests/:id/review` | staff | confirm or **record correction**, then route |
| POST | `/requests/:id/assign` | staff | **assign agent** |
| PATCH | `/requests/:id/status` | role-checked transitions | **update status** |
| POST | `/requests/:id/messages` | owner / staff | comments (staff can add internal notes) |
| GET | `/analytics`, `/models`, `/agents`, `/teams` | staff | dashboard data |
| GET | `/monitoring?days=7` | staff | **model health**: drift (PSI), review load, estimated precision, alerts, 30-day series |
| PUT | `/settings/threshold` | admin | change the live threshold |

**Routing rules:** if confidence ≥ threshold, the request goes to the category's team and to the agent on that team with the fewest open requests. Otherwise it goes to `needs_review`. When an agent reviews a request, it is routed the same way, and any category change is stored in `corrections`.

**Database tables:** `users, teams, requests, messages, predictions, assignments, corrections, model_versions`.

## Tests

```bash
cd backend && npm test
```

There are 27 tests covering auth, the permission matrix (customer isolation, role checks), auto-routing vs review, input validation, corrections, status transitions, internal-note visibility, manual assignment, analytics, threshold changes, Python↔JS model parity, and the monitoring maths: PSI, the validation reference, stable vs drifted traffic, the precision estimate and the time window.

GitHub Actions ([`ci.yml`](.github/workflows/ci.yml)) runs the tests, a seed + simulation smoke test, and the frontend lint and build on every push and pull request.

## Deploy

- **API:** [Render](https://render.com), using the included `render.yaml`, which sets `NODE_ENV=production`, `DEMO_MODE=true` (it is the public demo) and generates `JWT_SECRET`. The build seeds the demo and runs the simulation. **Set `CORS_ORIGIN` to the frontend origin before deploying**, or both the build and the API refuse to run.
- **Frontend:** [Vercel](https://vercel.com) with the root directory set to `frontend`. Set `NEXT_PUBLIC_API_URL=https://<api-host>/api`, and optionally `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL` and `NEXT_PUBLIC_SUPPORT_PHONE`, which show clickable `mailto:`/`tel:` links in the footer.

## Configuration

The API validates its settings at startup ([`backend/src/config.js`](backend/src/config.js)) and fails closed: an unset `NODE_ENV` counts as production.

| Variable | Production | Development / test |
|---|---|---|
| `NODE_ENV` | `production` or unset | `development` (`npm run dev`, `seed`, `simulate`) or `test` (`npm test`) |
| `JWT_SECRET` | **required**, at least 32 bytes, not the development secret | optional; a built-in development secret is used |
| `CORS_ORIGIN` | **required**, comma-separated origins such as `https://app.example.com` (no paths) | optional; any origin is allowed |
| `DEMO_MODE` | `false` unless set to `true` | `true` unless set to `false` |
| `DB_FILE` | optional, default `backend/data/resolvedesk.db` | same |
| `PORT` | optional, default 4000 | same |

**Demo mode** creates the demo staff and customers with the published password `demo1234`, shows the demo sign-in buttons and a "Public demo" warning banner, and is the only mode in which `npm run seed` and `npm run simulate` run (they refuse otherwise, before touching the database). Never enable it where real data is stored.

**First administrator without demo mode:** a fresh database has no accounts. Create one administrator with

```bash
cd backend && npm run bootstrap-admin
```

It asks for an email, a name and a password (at least 12 characters, hidden while typing), or reads `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` and `BOOTSTRAP_ADMIN_NAME`. It refuses if an administrator already exists. Remove those variables afterwards. Until staff management exists (backlog T-015/T-024), agents still come only from demo mode.

Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

Every API response carries `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and a restrictive `Content-Security-Policy`; production adds `Strict-Transport-Security`.

## Limitations

- SQLite on a single instance. On Render's free tier the demo database resets on each deploy.
- CLINC150 requests are short, single-intent queries. Real support tickets are longer and messier, so expect lower accuracy on them.
- The drift drill is a simulation. The traffic is real CLINC150 test text, but the timeline, the size of the shift and the agents (who catch every mistake) are made up. With real agents who miss some mistakes, the precision estimate is an upper bound.
- PSI on a week of traffic is noisy. The checks wait for 100 predictions and use 5 coarse bins to keep false alarms down.
- The embedding latency was measured on one Apple Silicon laptop CPU, one request at a time.
