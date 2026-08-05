# Topic coverage

**What this is:** a picture of where the twenty topics, the sixteen entries and
the twelve shop series line up — and where they do not. It is for deciding what
to make next. It changes no behaviour and nothing fails because of it.

Every topic resolves to *something*, so nothing here is broken. What this shows
is where a visitor is met by a resource named for someone else's situation.

Counts were taken on 2026-08-05, against the entries approved at that date.

---

## The short version

- **Twelve topics have a series of their own.** Eight are answered by borrowing
  one named for a neighbouring topic.
- **The sharpest gap is `hope`.** A visitor clicks *"I need hope."* and is
  offered the **Faith Collection**. No entry has hope as its main topic either,
  though four touch it.
- **Six topics have a series but no encouragement of their own** —
  `chronic-pain`, `depression`, `adhd`, `gratitude`, `trusting-god`, `patience`.
  The product exists; the writing has not caught up to it.
- **Three topics are unreachable from guided discovery** — `regret`,
  `forgiveness`, `patience` are in no need's lanes, so they can only be found by
  browsing or searching.

---

## Every topic

`Entries` counts entries whose **main** topic this is, then how many touch it as
a secondary topic. `Needs` are the guided-discovery entry points whose lanes
include it.

| Topic | Series | Entries | Needs |
|---|---|---|---|
| `anxiety` | **its own** | 2 · 1 | steadiness, not-sure |
| `caregiving` | **its own** | 2 · 1 | comfort |
| `faith` | **its own** | 2 · 1 | clarity, encouragement, time-with-god, not-sure |
| `learning-to-pray` | **its own** (Prayer) | 2 · 1 | prayer, not-sure |
| `grief` | **its own** | 1 · 1 | comfort |
| `regret` | **its own** | 1 · 0 | — |
| `trusting-god` | **its own** | 0 · 3 | steadiness, clarity, hope, time-with-god |
| `patience` | **its own** | 0 · 2 | — |
| `depression` | **its own** | 0 · 0 | comfort, encouragement, hope |
| `chronic-pain` | **its own** | 0 · 0 | comfort |
| `gratitude` | **its own** | 0 · 0 | time-with-god |
| `adhd` | **its own** | 0 · 0 | next-step |
| `waiting` | borrows Trusting God, Patience | 2 · 1 | hope, not-sure |
| `overwhelm` | borrows Anxiety | 1 · 2 | steadiness, next-step, not-sure |
| `exhaustion` | borrows Caregiving | 1 · 3 | encouragement, next-step |
| `uncertainty` | borrows Trusting God | 1 · 2 | steadiness, clarity, next-step |
| `feeling-far-from-god` | borrows Prayer, Faith | 0 · 2 | prayer, time-with-god |
| `hope` | borrows Faith | 0 · 4 | encouragement, hope |
| `loneliness` | borrows Grief | 0 · 1 | comfort |
| `forgiveness` | borrows Regret | 0 · 1 | — |

---

## The three kinds of gap

### 1. A topic answered by a collection named for something else

Borrowing is not automatically wrong — the fit is what matters, and it varies a
lot:

**Reasonable.** `uncertainty` and `waiting` → Trusting God; `feeling-far-from-god`
→ Prayer and Faith. These are close enough that a visitor is unlikely to feel
misread.

**Worth looking at.** `overwhelm` → Anxiety and `exhaustion` → Caregiving are
near-misses. Being overwhelmed is not the same as being anxious, and plenty of
people are exhausted without caring for anyone. Both are also the busiest
borrowed lanes: `overwhelm` is reached by three needs, `exhaustion` by two.

**The awkward ones.**

- `hope` → **Faith Collection.** A visitor picks *"I need hope."* and the thing
  offered is named for faith. Reached by two needs, and touched by four entries
  — more than any other borrowed topic. If one gap is worth closing, this is it.
- `loneliness` → **Grief Collection.** Loneliness often arrives without a death.
  Someone lonely who is not grieving is being handed the wrong word for what she
  is carrying.
- `forgiveness` → **Regret Collection.** Adjacent but not the same: regret is
  about what you did, forgiveness usually about what someone else did.

### 2. A series with nothing written for it

`chronic-pain`, `depression`, `adhd` and `gratitude` have a full five-format kit
and **no entry at all** — not even a secondary mention. `trusting-god` and
`patience` have entries that touch them but none that is *about* them.

This is the gap that costs the most, because the product is already made. Every
journey that reaches one of these lanes falls through to a neighbouring topic's
entry, and the shop link ends up doing work the writing should be doing.

`depression` is the notable one: three separate needs (comfort, encouragement,
hope) list it in their lanes, and it has nothing of its own to open.

### 3. A topic guided discovery cannot reach

`regret`, `forgiveness` and `patience` appear in no need's `lanes`, so no answer
to *"Where do you need help today?"* leads to them. They are reachable only from
`/daily/topics/` or search.

`regret` is the odd one out here — it has both a dedicated series and an entry
written for it, and guided discovery still cannot get there. Adding it to a
need's lanes costs one line in [`src/config/guided.mjs`](../src/config/guided.mjs).

---

## If you want to close a gap

- **A missing entry** — write one, the ordinary way. See the
  [owner's guide](owner-guide.md).
- **A topic guided discovery cannot reach** — add the topic slug to a need's
  `lanes` in [`src/config/guided.mjs`](../src/config/guided.mjs). Lanes are tried
  in order, so put it where it belongs, not at the end.
- **A borrowed topic that deserves its own resource** — that is a decision about
  the shop, not about this repo. When the series exists, add it to `SERIES` in
  [`src/config/products.mjs`](../src/config/products.mjs); the five formats and
  the tier matching come with it.

## Where the numbers come from

Topics are [`src/config/topics.mjs`](../src/config/topics.mjs); needs and their
lanes are [`src/config/guided.mjs`](../src/config/guided.mjs); series and their
topics are [`src/config/products.mjs`](../src/config/products.mjs); entry counts
are the approved entries in [`src/data/entries/`](../src/data/entries/).

A topic's series list is every collection whose `topics` include it. "Its own"
means a series is named for that topic — for `learning-to-pray` that is the
Prayer Collection, whose source catalog calls the topic `prayer`. The two names
mean the same thing and are matched deliberately; the topic slug is not renamed,
because `/daily/topics/learning-to-pray/` is a permanent URL.
