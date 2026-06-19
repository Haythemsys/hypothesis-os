# Customer Interview Guide — HypothesisOS

**Phase P validation document**
**Date:** 2026-06-19
**Purpose:** Structured discovery interviews to validate or kill the commercial thesis.
**Ground rule:** These interviews are NOT demos. Do not explain the product until the interview is complete.

---

## Interview Objective

Discover whether the target's decision-making process contains a genuine, recurring falsification problem that they currently experience as painful — and whether they would pay to solve it.

The interview fails if:
- The interviewee is telling you what you want to hear
- You are pitching, explaining, or describing the product
- The conversation stays hypothetical ("I would imagine that...")
- You walk away without knowing whether the problem is real, how often it occurs, and what it currently costs them

---

## Who to Interview

**Screen for:**
- Makes or influences go/no-go decisions with resource consequences (not just recommendations)
- Has made at least one decision in the past 12 months that turned out to be wrong
- Has access to evidence before making decisions (not pure intuition decisions)

**Do not interview:**
- People who describe their work as "strategic" without making specific resource-allocation calls
- People who delegate all decisions upward
- Friends and colleagues who will be supportive regardless of what you're building

**Target:** 3–5 interviews per segment, 5 segments = 15–25 total minimum.

---

## Part 1 — Context (5 minutes)

Ask these before anything else. Listen without interrupting.

**Q1.1:** "Walk me through a major go/no-go decision you made in the last 6 months — something where you had to choose between continuing and stopping."

*What you're listening for:* Is the decision real (money, time, headcount at stake)? Did they have evidence? How did they make the call?

**Q1.2:** "What information did you have when you made that decision?"

*What you're listening for:* Was the evidence structured or unstructured? How confident were they? Did they know what was missing?

**Q1.3:** "How did you decide what 'enough evidence' looked like?"

*What you're listening for:* Do they have an explicit standard? Or is it a gut feeling dressed up as a process? This is the core question — most people do not have an explicit standard.

---

## Part 2 — The Problem (10 minutes)

**Q2.1:** "Tell me about a decision you made that turned out to be wrong — where you committed and later regretted it."

*What you're listening for:* Real pain. Specifics: what was committed, how much, for how long. If they can't name one, the problem may not be painful enough.

**Q2.2:** "When you look back on it now, what evidence was there at the time that should have stopped you?"

*What you're listening for:* Do they recognize, in retrospect, that there was a signal they missed or discounted? This is evidence that the falsification problem is real for them.

**Q2.3:** "Why do you think that evidence wasn't weighted correctly?"

*What you're listening for:* Process failure (no structure), social failure (team wanted to proceed), time failure (moved too fast), or genuine uncertainty. These map to different product interventions.

**Q2.4:** "How much did that cost — in time, money, or credibility?"

*What you're listening for:* Is there a number? Or is it vague? Vague = low pain, high pain = high number easily recited. A person who immediately says "about six weeks of engineering and a missed quarter" has felt it.

---

## Part 3 — Current Workflow (10 minutes)

**Q3.1:** "When you're about to make a go/no-go call today, what do you actually do? Walk me through your last one step by step."

*What you're listening for:* What tools, documents, people, frameworks are involved? Where is the friction? Where does the process break down?

**Q3.2:** "What documents or outputs does that process produce?"

*What you're listening for:* Do they produce something written? A verdict? An audit trail? Or just a decision that happens in a meeting?

**Q3.3:** "If you had to defend that decision to someone who disagreed, what would you show them?"

*What you're listening for:* Do they have a reproducible artifact? Or is the defense "I trusted my judgment"? People who can't point to a structured artifact are in the market for structured falsification — they just don't know it yet.

**Q3.4:** "What tools do you currently use to help make these decisions?"

*What you're listening for:* Notion, spreadsheets, frameworks, consultants, ChatGPT. Understand what they're already spending time and money on.

**Q3.5:** "How much time per week do you spend on go/no-go decision-making, including the prep work?"

*What you're listening for:* If it's under 2 hours/week, the frequency may not support habit formation for a new tool. If it's 5+ hours, you have a wedge.

---

## Part 4 — The Gap (5 minutes)

**Q4.1:** "Has there ever been a decision where you had all the evidence but still weren't sure what to do with it?"

*What you're listening for:* Ambiguous evidence that should have produced a KILL but felt like UNRESOLVED, or vice versa. This is the specific problem HypothesisOS addresses.

**Q4.2:** "What would it mean to you to have a process that could look at your evidence and tell you definitively whether it was GO or not-GO?"

*What you're listening for:* Do they light up at this? Or do they say "I already sort of do that"? The response tells you whether they experience the falsification gap.

**Q4.3:** "Who else would care about that verdict in your organization?"

*What you're listening for:* Is there a team around this decision? Could the tool serve multiple people? This informs team vs. individual pricing.

---

## Part 5 — WTP and Switching Behavior (5 minutes)

Do not name a price. Let them anchor first.

**Q5.1:** "If a tool existed that structured your go/no-go decisions and produced a defensible verdict automatically — what would a tool like that be worth to you?"

*What you're listening for:* Any number is useful. "I'd expect it to be free" = no WTP. "$10/month seems fair" = low WTP, maybe individual use. "$50–100/month is what we spend on tools in this category" = target range. "$500/month" = team use case.

**Q5.2:** "What would need to be true for you to pay for something like that?"

*What you're listening for:* Specific conditions (it works on my domain, my team can use it, it integrates with X). These are your product requirements.

**Q5.3:** "What other tools have you adopted in the last year — and what tipped you over into paying?"

*What you're listening for:* What's their tool adoption pattern? What's the trigger to pay?

---

## After the Interview — Scoring

Score each interview on these dimensions (1–5):

| Dimension | What to score |
|-----------|--------------|
| **Pain severity** | How bad was the false GO story? (1 = vague, 5 = specific $ cost named) |
| **Problem frequency** | How often do these decisions happen? (1 = rarely, 5 = weekly) |
| **Current solution inadequacy** | How bad is their current process? (1 = they have a good process, 5 = pure gut feel) |
| **WTP signal** | Did they suggest a real number unprompted? (1 = no, 5 = yes and it was $50+/month) |
| **Switching likelihood** | Would they try a tool like this? (1 = "interesting," 5 = "send me the link now") |

A total score below 12: this person is not an early adopter. Do not build for them first.
A total score above 18: this person is a target early user. Follow up within 48 hours with access.

---

## Red Flags — Vanity Feedback to Ignore

- "This sounds really interesting" — not a buying signal
- "I'd definitely use something like that" — not a commitment
- "My team would love this" — unless they are the buyer, not a signal
- "Have you thought about adding X feature?" — feature requests in interviews are distractions, not validation
- "I think the market for this is huge" — irrelevant, the interview is about their pain, not market sizing
- Any answer that is about the product you described rather than the problem they experienced — if they're reacting to your pitch, you're getting product feedback, not customer discovery

---

## The Interview is Done When You Know:

1. A specific decision they made in the last 12 months, the evidence they had, and the outcome
2. The cost of one bad decision (time, money, credibility — in specific terms)
3. Their current process for go/no-go decisions, including what tools they use
4. Whether they would pay for structured falsification, and at what price point
5. What would need to be true for them to actually switch to a new tool

If you don't have these five things at the end of the interview, it didn't work. Schedule a follow-up.
