# Every destination, and whether a journey can reach it

All 79 things guided discovery could offer, and which of them it actually does.
Produced by running the site's own [`selectCandidates`](../src/lib/guided-guards.mjs)
and [`journeyProductIds`](../src/lib/product-match.mjs) across all 9 needs × 3
tiers, following every alternate. It is a reference — nothing fails because of
it. For the topics and entry points behind it, see the
[discovery map](discovery-map.md); for what closes the gaps, see
[topic coverage](topic-coverage.md).

Taken 2026-08-05, against 15 live entries.

## The count

| | Count |
| --- | --- |
| **Reachable** | **33** |
| Unreachable — no entry written for its topic | 24 |
| Unreachable — loses a tie-break | 16 |
| Unreachable — no need points at it | 6 |
| **Total** | **79** |

Three different causes, and they need three different fixes. Only 24 of the 46
are waiting on writing.

---

## All 79

`Set` is the whole collection; the other five are the printables inside it. Every
collection is sold the same six ways.

### Free PDFs — 7 of 7 reachable

| Resource | Topics | Reachable |
| --- | --- | --- |
| 5 Days of Scripture for Anxious Hearts | anxiety, overwhelm | yes |
| How to Grieve Without a Timeline | grief | yes |
| When You're Too Tired to Pray | exhaustion, caregiving, learning-to-pray | yes |
| When You Don't Know What to Say | learning-to-pray, feeling-far-from-god | yes |
| When You Cannot Fix It | regret, caregiving | yes |
| Names of God for Hard Days | faith, trusting-god | yes |
| Finding Jesus in the Middle of the Storm | uncertainty, trusting-god, waiting | yes |

### Anxiety — *Peace for an Anxious Heart* — 4 of 6

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | yes | |
| Scripture cards | yes | |
| First Steps Guide | yes | |
| Journal | yes | |
| Prayer cards | no | loses to Scripture cards at one minute |
| Devotional | no | loses to the journal at fifteen minutes |

### Caregiving — *Strength for the Caregiver* — 4 of 6

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | yes | |
| Scripture cards | yes | |
| First Steps Guide | yes | |
| Journal | yes | |
| Prayer cards | no | loses to Scripture cards at one minute |
| Devotional | no | loses to the journal at fifteen minutes |

### Grief — *When Someone You Love Is Gone* — 4 of 6

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | yes | |
| Scripture cards | yes | |
| First Steps Guide | yes | |
| Journal | yes | |
| Prayer cards | no | loses to Scripture cards at one minute |
| Devotional | no | loses to the journal at fifteen minutes |

### Prayer — *Learning to Pray* — 5 of 6

The only collection whose prayer cards are reachable by design: the `prayer` need
sets `prefer_format: prayer_cards`.

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | yes | |
| Scripture cards | yes | |
| Prayer cards | yes | |
| First Steps Guide | yes | |
| Journal | yes | |
| Devotional | no | loses to the journal at fifteen minutes |

### Faith — *When You Feel Far From God* — 5 of 6

Its prayer cards are reachable second-hand: the `prayer` need's hoist applies to
a Faith alternate reached through `feeling-far-from-god`.

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | yes | |
| Scripture cards | yes | |
| Prayer cards | yes | |
| First Steps Guide | yes | |
| Journal | yes | |
| Devotional | no | loses to the journal at fifteen minutes |

### Trusting God — *When You Cannot Control the Outcome* — 4 of 6

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | yes | |
| Scripture cards | yes | |
| First Steps Guide | yes | |
| Journal | yes | |
| Prayer cards | no | loses to Scripture cards at one minute |
| Devotional | no | loses to the journal at fifteen minutes |

### Patience — *Patience for the Process* — 0 of 6

Not a lane problem: `waiting` is in two needs' lanes, and two live entries carry
it. But the Trusting God series also claims `waiting`, and comes first in
`SERIES`, so it wins every match on that shared topic. Patience only has
`waiting` and `patience`, and nothing is written for `patience`.

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | no | Trusting God wins the shared `waiting` topic |
| Scripture cards | no | same |
| Prayer cards | no | same |
| First Steps Guide | no | same |
| Devotional | no | same |
| Journal | no | same |

### Regret — *Grace for What You Cannot Change* — 0 of 6

The frustrating one. It has a series *and* a published entry written for it, and
still cannot be arrived at, because neither `regret` nor `forgiveness` appears in
any need's lanes. One line in [`guided.mjs`](../src/config/guided.mjs) fixes all
six at once.

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | no | no need's lanes include `regret` or `forgiveness` |
| Scripture cards | no | same |
| Prayer cards | no | same |
| First Steps Guide | no | same |
| Devotional | no | same |
| Journal | no | same |

### Depression — *When Hope Feels Far Away* — 0 of 6

Listed in three needs' lanes — comfort, encouragement, hope — and reached by
none, because no live entry carries `depression`.

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | no | no entry carries `depression` |
| Scripture cards | no | same |
| Prayer cards | no | same |
| First Steps Guide | no | same |
| Devotional | no | same |
| Journal | no | same |

### Chronic Pain — *Still Held on Hard Days* — 0 of 6

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | no | no entry carries `chronic-pain` |
| Scripture cards | no | same |
| Prayer cards | no | same |
| First Steps Guide | no | same |
| Devotional | no | same |
| Journal | no | same |

### Gratitude — *Grace in the Small Things* — 0 of 6

An entry is drafted (`looking-for-the-light-in-the-middle-of-it`) but is not live yet — it is
awaiting verified Scripture, so it does not count here.

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | no | no live entry carries `gratitude` |
| Scripture cards | no | same |
| Prayer cards | no | same |
| First Steps Guide | no | same |
| Devotional | no | same |
| Journal | no | same |

### ADHD — *Grace for the Busy Mind* — 0 of 6

| Item | Reachable | Why not |
| --- | --- | --- |
| Set | no | no entry carries `adhd` |
| Scripture cards | no | same |
| Prayer cards | no | same |
| First Steps Guide | no | same |
| Devotional | no | same |
| Journal | no | same |

---

## The 46 that cannot be reached

### Waiting on writing — 24

Four collections, six items each. Nothing is wrong with the routing; the lane
falls through because no entry carries the topic, and then the collection offered
is whichever one the *replacement* entry belongs to.

- **Depression** — set, Scripture cards, prayer cards, First Steps Guide, devotional, journal
- **Chronic Pain** — set, Scripture cards, prayer cards, First Steps Guide, devotional, journal
- **Gratitude** — set, Scripture cards, prayer cards, First Steps Guide, devotional, journal
- **ADHD** — set, Scripture cards, prayer cards, First Steps Guide, devotional, journal

### Losing a tie-break — 16

No writing needed. These are reachable in principle and lose to a sibling every
time.

| Item | Loses to |
| --- | --- |
| Devotional × 6 — Anxiety, Caregiving, Grief, Prayer, Faith, Trusting God | the journal, which is listed first at the fifteen-minute tier |
| Prayer cards × 4 — Anxiety, Caregiving, Grief, Trusting God | Scripture cards, listed first at the one-minute tier |
| Patience × 6 — the whole collection | the Trusting God series, which also claims `waiting` and comes first in `SERIES` |

**The devotional is unreachable in all twelve collections** — six here, six in the
four unwritten collections plus Regret and Patience. It has no pathway anywhere
on the site.

### Nothing points at it — 6

- **Regret** — set, Scripture cards, prayer cards, First Steps Guide, devotional, journal

`regret` and `forgiveness` are in no need's `lanes`, so no answer to *"Where do
you need help today?"* leads to them.

---

## How this was measured

For every need × tier, the opening entry and both alternates were resolved with
`selectCandidates`, then `journeyProductIds` was called on each — the same
functions the Astro build and `npm run validate` use. A destination counts as
reachable if any of those 81 journeys offers it.

"Loses a tie-break" was distinguished from the other two causes by testing each
product's topics against the union of every need's lanes and the topics of every
live entry: a product whose topics appear in both, and is still not offered, is
losing a sort rather than missing a route.
