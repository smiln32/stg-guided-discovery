# Topic coverage

**What this is:** a picture of where the twenty topics, the sixteen entries and
the twelve shop series line up — and where they do not. It is for deciding what
to write next. It changes no behaviour and nothing fails because of it.

Every topic resolves to *something*, so no page is broken. What is broken is
narrower and more expensive: **four collections that are fully made cannot be
reached from guided discovery at all.**

Counts were taken on 2026-08-05, against the entries approved at that date.

---

## The four collections discovery cannot reach

`depression`, `chronic-pain`, `adhd` and `gratitude` each have a series with the
full five-format kit. Not one entry carries any of those four topics — not as a
main topic, not even as a secondary mention. And the product a journey offers is
chosen from **the topic of the entry it opened**, never from the lane the
visitor's need pointed at (see [`product-match.mjs`](../src/lib/product-match.mjs)).

So a lane with no entry behind it fails twice. The matcher falls through to the
next topic, and then the collection offered is whichever one *that* topic
belongs to. The visitor is not told; she simply gets someone else's resource.

| She picks | The lane meant to catch her | What she is actually given |
| --- | --- | --- |
| *I need comfort.* | `chronic-pain`, `depression` | a grief entry → **Grief Collection** |
| *I need encouragement.* | `depression` | an exhaustion entry → **Caregiving Collection** |
| *I need hope.* | `depression` | a waiting entry → **Trusting God, Patience** |
| *I need one practical next step.* | `adhd` | an overwhelm entry → **Anxiety Collection** |
| *I want to spend time with God.* | `gratitude` | → **Prayer, Faith** |

`depression` is the sharpest of the four: three separate needs list it in their
lanes — comfort, encouragement and hope — and none of them can arrive.

This is the gap that costs the most, because the product is already made. The
shop link ends up doing work the writing should be doing, and it is the wrong
shop link.

### Why the fix is writing, not matching

It would be easy to make the *need* choose the product — to offer the Depression
Collection to anyone who clicked *"I need encouragement."* That is inferring a
condition from a need, which is precisely what
[`DIAGNOSIS_PATTERNS`](../src/config/guided.mjs) exists to prevent. A visitor who
asked for encouragement has not told us she is depressed, and the site does not
guess. The door opens with an entry, or it does not open.

---

## Writing one of the four

Three things decide whether a new entry actually closes the gap.

**1. Set `topic:` to the slug itself** — `depression`, `chronic-pain`, `adhd`,
`gratitude`. A main topic outranks every secondary match
([`laneRank`](../src/lib/guided-guards.mjs)), and it is also what makes
`formatForTier` prefer that topic's own series over a neighbour's. A secondary
mention is not enough to do either reliably.

**2. Fill all five tier fields** — `scripture_text`, `gentle_word`, `prayer`,
`small_step`, `journal_question`. With all five the entry serves all three
capacity tiers. Leave out `journal_question` and it silently never appears at
fifteen minutes, which is the tier where the journal and devotional are offered.

**3. Know where it will land.** Lanes are tried in order, so writing the entry is
not always the same as opening the journey with it:

| Entry to write | Opens | Appears as an alternate on |
| --- | --- | --- |
| `gratitude` | **time-with-god** | — |
| `depression` | **encouragement** | hope, offered third |
| `chronic-pain` | — | comfort, offered second |
| `adhd` | — | next-step, offered second |

Those positions were checked by running the real matcher
([`selectCandidates`](../src/lib/guided-guards.mjs)) against the approved
entries with one full entry added per topic.

`chronic-pain` and `adhd` sit behind `grief` and `overwhelm` in their needs'
lanes, so they will be offered as *"is one of these closer to what you are
carrying?"* rather than as the page that opens. That may well be right — someone
asking for comfort is more often grieving than in pain. If you want one of them
to lead instead, move its slug earlier in that need's `lanes` in
[`src/config/guided.mjs`](../src/config/guided.mjs); it is one line.

One caution on `comfort`: it already has five lanes and a journey offers at most
three entries. Once `chronic-pain` is written, `depression` — last in that need's
lanes — will be cut from the comfort journey entirely. It still opens
`encouragement`, so the collection stays reachable, but comfort will not be the
route.

### What is already in flight

**`gratitude` — drafted, not live.**
[`looking-for-the-light-in-the-middle-of-it`](../src/data/entries/looking-for-the-light-in-the-middle-of-it.yaml),
on 1 Thessalonians 5:18. It is held at `needs_scripture_verification` with the
placeholder still in `scripture_text`, so the publish gate keeps it out of
discovery and the Gratitude Collection stays unreachable until the verified
NASB 2020 text is pasted in and both reviews are approved.

**`gratitude`, second entry — Colossians 3:15.** A different angle on the same
topic, kept deliberately separate rather than swapped in. 1 Thessalonians leads
with the instruction to give thanks in everything, which is why the drafted
entry spends a paragraph making clear that is not a demand to pretend. Colossians
leads with peace and arrives at thankfulness as what follows from it — the answer
to *"I want peace and I do not know where to start"* rather than to *"I have been
told to be thankful and it feels like pretending."*

One entry will not carry a five-printable collection for long, and these are two
genuinely different women. Neither verse's text is recorded here: Scripture is
never stored anywhere but an entry, and never until it is verified.

---

## Every topic

`Entries` counts entries whose **main** topic this is, then how many touch it as
a secondary topic. `Needs` are the guided-discovery entry points whose lanes
include it.

| Topic | Series | Entries | Needs |
| --- | --- | --- | --- |
| `anxiety` | **its own** | 2 · 1 | steadiness, not-sure |
| `caregiving` | **its own** | 2 · 1 | comfort |
| `faith` | **its own** | 2 · 1 | clarity, encouragement, time-with-god, not-sure |
| `learning-to-pray` | **its own** (Prayer) | 2 · 1 | prayer, not-sure |
| `grief` | **its own** | 1 · 1 | comfort |
| `regret` | **its own** | 1 · 0 | — |
| `trusting-god` | **its own** | 0 · 3 | steadiness, clarity, hope, time-with-god |
| `patience` | **its own** | 0 · 2 | — |
| `depression` | **its own** | **0 · 0** | comfort, encouragement, hope |
| `chronic-pain` | **its own** | **0 · 0** | comfort |
| `gratitude` | **its own** | **0 · 0** | time-with-god |
| `adhd` | **its own** | **0 · 0** | next-step |
| `waiting` | borrows Trusting God, Patience | 2 · 1 | hope, not-sure |
| `overwhelm` | borrows Anxiety | 1 · 2 | steadiness, next-step, not-sure |
| `exhaustion` | borrows Caregiving | 1 · 3 | encouragement, next-step |
| `uncertainty` | borrows Trusting God | 1 · 2 | steadiness, clarity, next-step |
| `feeling-far-from-god` | borrows Prayer, Faith | 0 · 2 | prayer, time-with-god |
| `hope` | borrows Faith | 0 · 4 | encouragement, hope |
| `loneliness` | borrows Grief | 0 · 1 | comfort |
| `forgiveness` | borrows Regret | 0 · 1 | — |

The four rows in bold are the ones above. Everything below them borrows by
design, which is a different thing.

---

## The smaller gaps

### A series with no writing of its own

`trusting-god` and `patience` have series and have entries that *touch* them, but
none that is about them. Less urgent than the four, because a neighbouring
entry's collection is at least in the right family — but the same shape of
problem, one degree milder.

### Topics answered by a collection named for something else

Borrowing is not a fault. Several of these topics were never meant to be product
lines, and the collection that covers them is the right one:

**Working as intended.** `hope` → Faith, `uncertainty` and `waiting` → Trusting
God, `feeling-far-from-god` → Prayer and Faith. `hope` in particular is a topic
the Faith Collection covers, not a line waiting to be made; four entries touch it
and a visitor asking for hope is well served.

**Worth a look.** `overwhelm` → Anxiety and `exhaustion` → Caregiving are
near-misses. Being overwhelmed is not the same as being anxious, and plenty of
people are exhausted without caring for anyone. Both are also busy lanes —
`overwhelm` is reached by three needs, `exhaustion` by two.

**The awkward ones.**

- `loneliness` → **Grief Collection.** Loneliness often arrives without a death.
  Someone lonely who is not grieving is handed the wrong word for what she is
  carrying.
- `forgiveness` → **Regret Collection.** Adjacent but not the same: regret is
  about what you did, forgiveness usually about what someone else did.

### A topic guided discovery cannot reach

`regret`, `forgiveness` and `patience` appear in no need's `lanes`, so no answer
to *"Where do you need help today?"* leads to them. They are reachable only from
`/daily/topics/` or search.

`regret` is the odd one out — it has both a dedicated series and an entry written
for it, and guided discovery still cannot get there. Adding it to a need's lanes
costs one line in [`src/config/guided.mjs`](../src/config/guided.mjs).

---

## If you want to close a gap

- **A missing entry** — write one, the ordinary way. See the
  [owner's guide](owner-guide.md), and the three rules under *Writing one of the
  four* above.
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
