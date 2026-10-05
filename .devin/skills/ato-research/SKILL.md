---
name: ato-research
description: Delegate a bounded research question to the read-only ato-researcher subagent. Returns evidence-separated findings.
agent: ato-researcher
argument-hint: "<research question>"
---

Research the question in the caller's message. Stay read-only.

Before concluding, make sure you have checked `docs/project/PROJECT_STATE.md`
and `docs/project/SOURCE_OF_TRUTH.md` when the question touches product
direction, closed surfaces, or prior decisions.

Report using the ato-researcher output contract: FACT (with file:line or
source citations), OBSERVATION, INFERENCE (with confidence + falsifier),
RECOMMENDATION (labeled opinion), OPEN QUESTIONS.
