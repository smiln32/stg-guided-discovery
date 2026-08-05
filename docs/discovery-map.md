# The discovery map

**What this is:** every topic, every entry point and every destination, and
which of them actually connect. It is a reference — it changes no behaviour and
nothing fails because of it. For *why* the gaps exist and what closes them, see
[topic coverage](topic-coverage.md).

Taken on 2026-08-05, against 15 live entries. The entry-point table was produced
by running the site's own matcher, not by reading the config.

---

## The three lists at a glance

| | Count | Where it lives |
| --- | --- | --- |
| Topics | 20 | [`src/config/topics.mjs`](../src/config/topics.mjs) |
| Entry points (needs) | 9 × 3 tiers = 27 journeys | [`src/config/guided.mjs`](../src/config/guided.mjs) |
| Destinations | 7 free PDFs + 12 collections × 6 = 79 | [`src/config/products.mjs`](../src/config/products.mjs) |

A visitor connects them in one direction only: she picks an **entry point**, the
matcher uses that need's **topic lanes** to open an entry, and the entry's own
topic chooses the **destination**. The lane never picks the product directly.

---

## 1. Topics

All twenty. `Entries` is how many entries have this as their main topic, then how
many touch it as a secondary one. `Reached by` lists the needs whose lanes
include it.

| Topic | Title | Entries | Series covering it | Reached by |
| --- | --- | --- | --- | --- |
| `anxiety` | Anxiety | 2 · 1 | Anxiety | steadiness, not-sure |
| `overwhelm` | Overwhelm | 1 · 2 | Anxiety | steadiness, next-step, not-sure |
| `exhaustion` | Exhaustion | 1 · 3 | Caregiving | encouragement, next-step |
| `caregiving` | Caregiving | 2 · 1 | Caregiving | comfort |
| `grief` | Grief | 1 · 1 | Grief | comfort |
| `loneliness` | Loneliness | 0 · 1 | Grief | comfort |
| `learning-to-pray` | Learning to Pray | 2 · 1 | Prayer | prayer, not-sure |
| `feeling-far-from-god` | Feeling Far From God | 0 · 2 | Prayer, Faith | prayer, time-with-god |
| `faith` | Faith | 2 · 1 | Faith | clarity, encouragement, time-with-god, not-sure |
| `hope` | Hope | 0 · 4 | Faith | encouragement, hope |
| `uncertainty` | Uncertainty | 1 · 2 | Trusting God | steadiness, clarity, next-step |
| `trusting-god` | Trusting God | 0 · 3 | Trusting God | steadiness, clarity, hope, time-with-god |
| `waiting` | Waiting | 2 · 1 | Trusting God, Patience | hope, not-sure |
| `patience` | Patience | 0 · 2 | Patience | **no need** |
| `regret` | Regret | 1 · 0 | Regret | **no need** |
| `forgiveness` | Forgiveness | 0 · 1 | Regret | **no need** |
| `depression` | Depression | **0 · 0** | Depression | comfort, encouragement, hope |
| `chronic-pain` | Chronic Pain | **0 · 0** | Chronic Pain | comfort |
| `gratitude` | Gratitude | **0 · 0** | Gratitude | time-with-god |
| `adhd` | ADHD | **0 · 0** | ADHD | next-step |

Every topic has a series. Four have no writing at all, and three are in no
need's lanes.

---

## 2. Entry points

Nine needs, each asking one question and then offering three capacity tiers.
Every journey shows the [crisis note](../src/components/SafetyNote.astro).

| Need | The choice she clicks | Lanes, in order |
| --- | --- | --- |
| `comfort` | I need comfort. | grief → loneliness → chronic-pain → caregiving → depression |
| `steadiness` | I need steadiness. | anxiety → overwhelm → uncertainty → trusting-god |
| `clarity` | I need clarity. | uncertainty → trusting-god → faith |
| `encouragement` | I need encouragement. | depression → exhaustion → faith → hope |
| `prayer` | I need to pray. | learning-to-pray → feeling-far-from-god |
| `next-step` | I need one practical next step. | overwhelm → adhd → exhaustion → uncertainty |
| `hope` | I need hope. | hope → waiting → depression → trusting-god |
| `time-with-god` | I want to spend time with God. | feeling-far-from-god → gratitude → trusting-god → faith |
| `not-sure` | I don't know where to begin. | faith → learning-to-pray → overwhelm → anxiety → waiting |

`prayer` also sets `prefer_format: prayer_cards` — someone who came to pray and
has a minute is offered prayers to borrow before verses to read. It only reorders
within what the tier already permits.

### The three tiers

| Tier | Requires the entry to have | Offers |
| --- | --- | --- |
| About a minute | scripture, prayer, small step | Scripture cards, prayer cards |
| About five minutes | + gentle word | 7-day First Steps Guide |
| About fifteen minutes | + journal question | Journal, then devotional |

---

## 3. Destinations

### Free PDFs — 7

Offered ahead of anything paid. All seven are reachable.

| Resource | Topics |
| --- | --- |
| 5 Days of Scripture for Anxious Hearts | anxiety, overwhelm |
| How to Grieve Without a Timeline | grief |
| When You're Too Tired to Pray | exhaustion, caregiving, learning-to-pray |
| When You Don't Know What to Say | learning-to-pray, feeling-far-from-god |
| When You Cannot Fix It | regret, caregiving |
| Names of God for Hard Days | faith, trusting-god |
| Finding Jesus in the Middle of the Storm | uncertainty, trusting-god, waiting |

### Collections — 12

Each is one series sold six ways: the whole set, plus five printables — Scripture
cards, prayer cards, a 7-day First Steps Guide, a 30-day devotional, and a 30-day
journal. All six share the collection's URL until individual product pages exist.

| Collection | Series title | Topics | Reachable? |
| --- | --- | --- | --- |
| Anxiety | Peace for an Anxious Heart | anxiety, overwhelm | yes |
| Caregiving | Strength for the Caregiver | caregiving, exhaustion | yes |
| Grief | When Someone You Love Is Gone | grief, loneliness | yes |
| Prayer | Learning to Pray | learning-to-pray, feeling-far-from-god | yes |
| Faith | When You Feel Far From God | faith, hope, feeling-far-from-god | yes |
| Trusting God | When You Cannot Control the Outcome | trusting-god, uncertainty, waiting | yes |
| Regret | Grace for What You Cannot Change | regret, forgiveness | **no — no lane** |
| Patience | Patience for the Process | patience, waiting | **no — loses `waiting`** |
| Depression | When Hope Feels Far Away | depression | **no — no entry** |
| Chronic Pain | Still Held on Hard Days | chronic-pain | **no — no entry** |
| Gratitude | Grace in the Small Things | gratitude | **no — no entry** |
| ADHD | Grace for the Busy Mind | adhd | **no — no entry** |

**Six of the twelve cannot be reached from guided discovery**, for three different
reasons. Four have no entry carrying their topic, so the lane falls through.
Regret is in no need's lanes at all — it has both a series and an entry written
for it and still cannot be arrived at. Patience loses every match on `waiting`
to the Trusting God series, which claims the same topic and comes first in
`SERIES`. See [destinations](destinations.md) for the full breakdown.

---

## 4. What each entry point actually gives her

Measured, not inferred: this is `selectCandidates` and `journeyProductIds` run
over the live entries. The collection is the same at every tier; only the
printable changes, because that is the part that answers "how much do you have in
you right now?".

| She picks | Opens | 1 min | 5 min | 15 min | Collection |
| --- | --- | --- | --- | --- | --- |
| comfort | when-the-grief-comes-in-waves | cards | guide | journal | **Grief** |
| steadiness | when-you-are-worried-about-what-comes-next | cards | guide | journal | **Anxiety** |
| clarity | when-you-cannot-see-the-way-forward | cards | guide | journal | **Trusting God** |
| encouragement | for-the-tiredness-sleep-does-not-fix | cards | guide | journal | **Caregiving** |
| prayer | when-the-same-prayer-has-no-answer-yet | cards | guide | journal | **Prayer** |
| next-step | when-the-list-is-longer-than-the-day | cards | guide | journal | **Anxiety** |
| hope | strength-for-the-long-wait | cards | guide | journal | **Trusting God** |
| time-with-god | a-gentle-place-to-begin | cards | guide | journal | **Faith** |
| not-sure | a-gentle-place-to-begin | cards | guide | journal | **Faith** |

Each journey also offers up to two alternates — *"is one of these closer to what
you are carrying?"* — and those carry their own destinations. Together with the
openers they reach the six collections marked reachable above, and all seven free
PDFs.

The free PDF each journey leads with:

| She picks | Free PDF offered first |
| --- | --- |
| comfort | How to Grieve Without a Timeline |
| steadiness, next-step | 5 Days of Scripture for Anxious Hearts |
| clarity, hope | Finding Jesus in the Middle of the Storm |
| encouragement | When You're Too Tired to Pray |
| prayer | When You Don't Know What to Say |
| time-with-god, not-sure | Names of God for Hard Days |

### Where an entry point lands somewhere other than its first lane

Four needs open on a lane that is not their first, because the earlier lane has
no entry behind it:

- **encouragement** lists `depression` first, opens on `exhaustion` → Caregiving.
- **hope** lists `hope` first, opens on `waiting` → Trusting God.
- **time-with-god** lists `feeling-far-from-god` first, opens on `faith` → Faith.
- **next-step** reaches `adhd` second, and never arrives.

Of these, only `hope` is working as designed — it is a topic the Faith Collection
covers, not a line of its own. The rest are in [topic coverage](topic-coverage.md).

---

## Where the numbers come from

[`topics.mjs`](../src/config/topics.mjs) for topics,
[`guided.mjs`](../src/config/guided.mjs) for needs and tiers,
[`products.mjs`](../src/config/products.mjs) for destinations,
[`src/data/entries/`](../src/data/entries/) for the entries.

The entry-point tables were generated by calling
[`selectCandidates`](../src/lib/guided-guards.mjs) and
[`journeyProductIds`](../src/lib/product-match.mjs) — the same functions the
build and `npm run validate` use — so this map cannot disagree with the site
unless the content changes underneath it.
