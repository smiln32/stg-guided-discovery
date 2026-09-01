# Hermes Implementation Brief — Rebuild Guided Discovery as a Full-Page Gentle Experience

## Objective

Refactor `stg-guided-discovery` so the visitor experience becomes a **single, full-page guided encouragement experience** that can live as an extra page within Simplify to Glorify.

The visitor should be able to arrive from different places on the main site, enter with a need or concern, receive an appropriate Scripture-centered experience, and then simply **scroll through the page at her own pace**.

Do not turn this into a wizard, chatbot sequence, step-by-step questionnaire, or series of screens.

The page should feel spacious, calm, gentle, and beautiful.

---

# 1. Preserve the Core Principle

The experience should follow this rule:

**Show the smallest complete encouragement first. Let deeper material simply exist farther down the page for anyone who wants it.**

Do not repeatedly ask:

- “Would you like to continue?”
- “What would you like to do next?”
- “How much time do you have?”
- “Would you like to explore this?”
- “Choose your next step.”

Avoid large NEXT buttons or anything that makes the visitor feel she is completing a process.

The visitor controls the experience through ordinary scrolling.

---

# 2. Keep the Initial Entry Simple

The top of the page should help the visitor identify what she is carrying without overwhelming her.

Use the existing guided-discovery matching system where practical, but redesign the presentation.

The visitor may arrive in two ways:

### A. General entry

She comes directly to the guided page and sees a gentle starting point such as:

**What are you carrying today?**

Use either:

- the existing need categories presented calmly, or
- a simple input/selection interface if that functionality is already safe and practical.

Do not diagnose her.

Do not tell her what she is experiencing.

If the system proposes a possible category, she must remain in control of confirming what fits.

### B. Deep-linked entry

The main Simplify to Glorify site should eventually be able to send someone directly into a relevant experience.

Examples:

- anxiety page → guided experience related to anxiety/worry
- caregiving article → caregiving pathway
- prayer resource → prayer pathway
- grief product page → grief-related encouragement

Design routing so query parameters, path parameters, or another clean mechanism can preselect an appropriate need without duplicating the page.

Document how the main site would create those links.

---

# 3. Remove the Current 1 / 5 / 15 Minute Structure

The current time-tier model should no longer control the visitor experience.

Do not ask the visitor how much time she has.

Instead, order the page by depth.

The visitor who only wants a minute can read the top.

The visitor who wants more can keep scrolling.

The visitor who wants much more can explore expandable or deeper content farther down.

Retain any useful matching logic from the current tiers internally if necessary, but do not expose the time-tier concept in the user interface.

---

# 4. Page Structure

After the visitor's need is established, build one continuous page in approximately this order.

## Section 1 — Gentle acknowledgment

A very brief acknowledgment of what she chose or shared.

Requirements:

- no diagnosis
- no assumptions about her life
- no exaggerated emotional language
- no clichés
- no promise that everything will work out
- short enough that the Scripture remains the focus

This should orient her without becoming a counseling response.

---

## Section 2 — Scripture

Present the primary Scripture prominently.

This is the visual and theological center of the experience.

Include:

- Scripture text
- reference
- translation
- appropriate poetic line breaks
- proper NASB 2020 treatment of `LORD`
- enough whitespace to make reading comfortable

Do not paraphrase Scripture.

Do not allow generated Scripture text.

Use only approved, verified Scripture from the repository.

---

## Section 3 — Reflection

Display the existing approved short reflection associated with the entry.

It should be immediately visible.

Do not hide the primary reflection behind a button or accordion.

The visitor should naturally encounter:

Scripture  
→ reflection

without making another decision.

---

## Section 4 — Prayer

Display the approved short prayer.

Again, this should simply appear next as part of the page.

The visitor should not have to request the first prayer.

Preserve the project's approved prayer voice and doctrinal guardrails.

---

## Section 5 — One Small Step

Display one practical, low-pressure next step from the approved entry.

This should not sound like homework.

It may involve:

- pausing
- writing one sentence
- reading a passage again
- remembering one truth
- reaching out to someone
- another appropriately small response

Do not create a checklist.

Do not imply spiritual failure if she does not do it.

---

# 5. Deeper Scripture Exploration

Below the core experience, include a visually distinct but natural section for deeper Scripture exploration.

This should not announce itself as the “next step.”

It simply exists farther down the page for someone who keeps scrolling.

Possible content:

### Scripture context

Explain:

- who is speaking
- who is being addressed
- where the passage occurs
- the immediate context
- what is happening in the surrounding passage

### Read around the verse

Provide surrounding verses where appropriate.

Do not reproduce excessive copyrighted Scripture text.

Where licensing limits make full surrounding text inappropriate, provide references and brief contextual explanation instead.

### Related Scriptures

Include a small number of carefully selected related passages.

These should be reviewed associations, not dynamically invented connections.

### Meaning and application

Explain what the passage says and how it relates to the selected need while respecting the text's original context.

Avoid making the verse say more than it says.

---

# 6. Deeper Reflection

The original reflection must remain where it appeared earlier.

Farther down the page, provide optional deeper material.

This can be:

- an expanded reflection already stored in the content system
- an expandable “Read more” area
- a deeper teaching section

Do not force the visitor into it.

Do not replace the short reflection with the long one.

The short reflection serves the person who needs little.

The deeper reflection serves the person who chooses to linger.

---

# 7. Longer Prayer

Add an unobtrusive option near or beneath the prayer area for:

**Longer prayer**

This is one of the few places where user-triggered generation may be appropriate.

Architect this carefully.

The generated prayer may use only:

1. the visitor's stated or selected concern
2. the approved primary Scripture
3. approved reflection/context
4. established Simplify to Glorify prayer guidelines

It must not:

- invent Scripture
- claim God told the visitor something
- make promises Scripture does not make
- diagnose the visitor
- assume facts she did not provide
- introduce doctrinal claims not grounded in approved material
- replace professional/crisis support where appropriate

Build a clear boundary between:

**reviewed static content**

and

**AI-generated personalized content**

Generated content should never overwrite or become part of the approved source-of-truth entry.

If live AI generation requires backend infrastructure that this current static Astro build does not have, do not quietly add a complicated backend.

Instead:

1. design the UI location for the feature,
2. create an interface boundary for it,
3. document the backend/API requirement,
4. leave a graceful non-AI fallback until that integration is intentionally approved.

---

# 8. Related Encouragement

Farther down the page, show a small number of related approved entries.

Avoid presenting a giant library.

Aim for approximately 2–4 strong connections.

Examples:

- another Scripture-centered encouragement
- a closely related topic
- an entry offering a slightly different angle

The visitor should be able to follow these if she wants to continue exploring.

---

# 9. Resources

At the bottom portion of the experience, surface relevant resources naturally.

Order:

1. free resource where available
2. appropriate paid resource

Do not make the page feel like a sales funnel.

Do not interrupt the Scripture/reflection/prayer sequence with products.

Products should appear only after meaningful value has already been given.

Continue the existing principle that no visitor must purchase something to complete the experience.

---

# 10. Navigation Behavior

The page should behave like a normal, comfortable webpage.

The visitor must always be able to:

- scroll upward
- reread the Scripture
- reread the reflection
- reread the prayer
- revisit deeper sections
- use the browser Back button normally
- follow related links without losing clarity

Do not replace the page contents each time she interacts.

Prefer progressive disclosure and ordinary page flow over route changes.

Where expandable content is useful, use accessible disclosure controls.

---

# 11. Consider a Gentle Sticky Page Guide

Explore—but do not automatically implement—a very subtle page guide for long pages.

Possible example:

Scripture · Reflection · Prayer · Explore

This must not look like application navigation.

It should only help someone return to an earlier section on a long page.

If it adds visual clutter, leave it out.

The page should work beautifully without it.

---

# 12. Visual Direction

The page needs to feel fully at home within Simplify to Glorify.

Use the existing brand palette and typography where appropriate.

Prioritize:

- generous whitespace
- comfortable line length
- readable Scripture
- restrained use of cards
- soft section transitions
- excellent mobile layout
- calm typography hierarchy
- strong accessibility
- no visual clutter

Avoid:

- dashboard appearance
- excessive boxed cards
- progress indicators
- gamification
- chat bubbles
- chatbot styling
- multi-step form styling
- dense navigation
- too many buttons
- competing calls to action

Think:

**quiet editorial experience**

rather than:

**interactive application**

---

# 13. Mobile First

Assume many visitors will experience this on a phone.

Check:

- Scripture readability
- line length
- vertical spacing
- touch target size
- sticky elements
- expandable sections
- long prayer rendering
- related resource cards
- heading hierarchy
- scrolling behavior

Nothing should require horizontal scrolling.

Do not let the page become an endless series of oversized panels on mobile.

---

# 14. Accessibility

Maintain or improve accessibility.

At minimum:

- semantic heading order
- keyboard-accessible controls
- visible focus states
- accessible disclosure/accordion behavior
- sufficient contrast
- meaningful link text
- no meaning communicated by color alone
- reduced-motion respect
- screen-reader-friendly Scripture presentation

Do not use custom interaction patterns when standard HTML behavior is sufficient.

---

# 15. Preserve Existing Governance

Do not weaken the existing safety and publishing architecture during the redesign.

Preserve:

- approved/published status gates
- Scripture verification requirement
- no-diagnosis safeguards
- stable entry URLs
- draft exclusion
- product/resource mappings
- validation scripts
- tests
- sitemap/canonical handling

The visual redesign must sit on top of the existing governed content system.

Do not create a second copy of Scripture, reflections, prayers, topics, or products just to support the new page.

One fact should continue to have one home.

---

# 16. Fix Existing Launch Issues While Refactoring

Address the known launch items that are directly related to this work.

### Timezone

Change:

`America/Denver`

to:

`America/Chicago`

unless there is a documented reason not to.

### Demonstration metadata

Do not automatically declare content reviewed.

Instead, provide a clear report listing:

- entries still marked `is_sample: true`
- demonstration reviewer values
- drafts
- missing approvals

These require real human review before public launch.

### Deployment gate

Recommend changing the production build process from:

`npm run build`

to:

`npm run validate && npm test && npm run build`

unless a documented technical reason prevents it.

The final recommendation should explain any tradeoff.

### Scripture rendering

Implement the documented Scripture rendering fixes:

- `LORD` small-cap presentation without corrupting underlying text
- preserve poetic line breaks appropriately

Do not alter Scripture words to fix typography.

---

# 17. Revisit Guided Matching

Audit the current guided matching system under this new experience.

The current system has known unreachable destinations and tie-break issues.

Do not solve this by forcing every product to appear.

Instead determine:

- whether each emotional need reaches the most appropriate approved entries
- whether the visitor receives relevant content before products
- whether product recommendations actually fit the content she just read
- whether devotional/journal/card/First Steps recommendations are being excluded merely because of old tier logic

Remove assumptions that existed solely because of the 1/5/15-minute structure.

Document unreachable destinations after the refactor and categorize them as:

- intentionally unreachable
- lacking content
- matching issue
- missing mapping

Do not artificially increase “coverage” at the expense of relevance.

---

# 18. Integration With the Main Website

Treat this repo as the feature engine.

The main site should eventually be able to link visitors into it from multiple places.

Design/document examples such as:

`/daily/`

general guided entry

`/daily/?need=caregiving`

preselected need

or another routing approach if technically cleaner.

The important requirement is:

**one implementation of the guided experience, many entry points from the main website.**

Do not duplicate separate versions of the page for anxiety, caregiving, grief, etc.

---

# 19. Do Not Fold This Into the Main Website Repo Yet

Do not port this project into the main Simplify to Glorify codebase as part of this task.

Keep the existing Astro module intact while redesigning the experience.

The immediate goal is to create a polished feature that can later be mounted, proxied, linked, or otherwise integrated cleanly.

Avoid creating unnecessary integration work before the visitor experience itself is settled.

---

# 20. Development Method

Work incrementally.

Before changing code:

1. Read the README.
2. Read `docs/HANDOFF.md`.
3. Read the owner guide.
4. Inspect the guided-discovery configuration and matching code.
5. Inspect the current guided pages/components.
6. Inspect content schemas and validation gates.
7. Inspect current tests.
8. Identify what can be reused versus removed.

Then create a short implementation plan.

Do not begin by rewriting the project.

Prefer small refactors that preserve working behavior.

---

# 21. Testing Requirements

Add or update tests for the redesigned experience.

At minimum verify:

- every public guided need produces a usable page
- no public path dead-ends
- required Scripture exists and is approved
- prayer exists
- reflection exists
- small step exists
- drafts never surface
- sample/unapproved content cannot accidentally publish
- related entry links resolve
- resource links resolve where testable
- old 1/5/15-minute URLs either redirect cleanly or remain intentionally supported
- keyboard/disclosure markup is structurally accessible
- deep links into needs work
- no generated content is stored as approved static content
- sitemap behavior remains intentional

Run:

`npm run validate`

`npm test`

`npm run build`

before declaring the work complete.

---

# 22. Preserve Old URLs

Before removing the current guided routes, inventory them.

If any may already have been shared or indexed, create appropriate redirects rather than simply deleting them.

Do not break permanent `/daily/[slug]/` entry URLs.

Document every route change.

---

# 23. Deliverables

When complete, provide:

### A. Working implementation

The redesigned full-page guided experience.

### B. Before/after summary

Explain what changed in plain English.

### C. Route map

Show:

- general entry URL
- need-specific deep-link format
- permanent entry URLs
- any redirected legacy routes

### D. Content/governance report

List anything still blocking public launch, especially:

- sample flags
- demonstration reviewers
- drafts
- missing approvals
- missing content areas

### E. Matching report

Show what needs and products/resources are now reachable and explain remaining gaps.

### F. Integration instructions

Explain exactly how the main Simplify to Glorify site can link visitors into this page from:

- navigation
- articles
- product pages
- free resources
- homepage sections
- topic pages

Do not modify the main site during this task.

### G. Screenshots or visual review notes

Review desktop and mobile presentation and identify anything that still feels visually inconsistent with Simplify to Glorify.

---

# Definition of Done

This task is complete when a visitor can:

1. enter the page generally or through a relevant deep link,
2. identify what she is carrying without being diagnosed,
3. receive one matched Scripture,
4. naturally scroll into a reflection,
5. naturally scroll into a prayer,
6. naturally scroll into one small step,
7. continue scrolling into deeper Scripture/context if she wants,
8. revisit anything above without losing it,
9. optionally request or access a longer prayer through a clearly separated personalization feature,
10. discover a few relevant related encouragements/resources,
11. leave at any point without feeling she failed to complete something.

The finished experience should feel like a **beautiful, quiet Scripture-centered page a woman can spend thirty seconds or thirty minutes with**, entirely at her own pace.