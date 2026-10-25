---
date: 2026-10-05
---

# Helpful Ideas to Think About AI


This article is still work in ~~procrastination~~ progress

---

We're living in an era where thinking, decisions, and creative work can be replaced with machine efforts. That would impact how we work, value works, and value values.

Specifically, machines can think, can improve themselves, and are improving fast.

Consider this scenario. A work you start today completes 2 days later, but if you start tomorrow it completes in 1 day. Would you start today? Why?

If you start today, but the very same work is started tomorrow by someone else, would you change your answer?

The scenario is set up in a balanced setting. In an extreme case, work started today completes in a year, while work started at the end of the year completes in one day. Would you wait?

Are there rules in this rules world? Are there invariants in the ever-changing landscape? Here is a collection of ideas I found helpful in thinking things through.

## How to use intelligence

### The Bitter Lesson

Helpfulness: 5 stars.

Richard Sutton's 2019 piece is a good place to start [@sutton-bitter-lesson-2019]. A recurring theme in machine learning is that general-purpose models beat special-purpose ones.

I wish I could collect a list of The Bitter Lessons in different fields. A commonly quoted one is AI chess playing. Early chess models tried to learn moves from human experts. Early AlphaGo trained on human expert games. AlphaGo Zero escaped the dependence on human domain knowledge and built its strategy with algorithmic search. MuZero even started from scratch without knowing the rules of Go, and topped the rankings anyway.

Multiple ideas can be drawn from this.

- We should turn thinking into a problem of searching. This works better because Moore's law makes computation cheap.
- Prefer machine-searched solutions over domain knowledge.

When we hear a project description like this, we know we might be making a wrong turn:

- **Human Expertise Fetish**: "Our project baked in our experts' domain knowledge," "It requires our experts' evaluation based on their experience."
    - Ask: is there context out of reach of AI? Can your expert still do better when AI has that context?
- **Product Specialization Fetish**: "Our model is fine-tuned for the semiconductor industry."
    - Ask: Why can't a general-purpose model perform better? What problem is so hard that a smart model can't solve it?
    - If it is a data problem, it is a privacy and context issue.

Exceptions:

- Computation budget is binding. The general-purpose model wins on the premise of cheap computation. When a task requires fast or limited computation, we might want a specialized design. I think System One models like Jev are a valid case like this.

I'm not a believer that humans should retire, take UBI, play video games all day, work only in the sense of working out, live in the Matrix, or live like a pet. I think humans should still pursue something meaningful, whatever that means to each individual. Yet The Bitter Lesson forms a strong baseline that thinking machines can usually do better than thinking humans. When we want to justify human value, we should try to beat that baseline.

### The Dynamo and Computers

Helpfulness: 4 stars.

When electric motors were introduced, productivity didn't boost for many years [@davidDynamoComputerHistorical1990]. Why? Because factories took time to be redesigned for the optimal use of electric motors.

Same for computers. If the whole business logic is not optimized toward computers' capabilities, we won't see a real productivity boost.

Be mindful of which processes are currently designed to optimize for human productivity, but not for AI's.

Examples:

- Programming languages were designed to optimize humans' ability to reason about computation. With AI's cheap and powerful mental labor, we can ask AI to write machine code and formal verification code, aka the "Final Form."
- GitHub is designed for humans to collaborate on code projects. A pull request is meant to be read and understood. What would source code management mean with AIs? Who should AI collaborate with? Redesigns should be en route. Update 2026-10-13: we're seeing exactly these changes happen [@anthropic-source-control-2026]. At over 30,000 changes merged per day, git's model of every clone being a full copy of the repo no longer fits.

## What stays scarce when intelligence is cheap

### Jevons Paradox

Making efficient use of resource X might cause a greater total consumption of X [@jevons-coal-question-1865].

Examples:

- Efficient coal-burning factories caused more consumption of coal.
- Fuel-efficient cars lead to more fuel use.
- Tokens: more efficient use of computation would cause more demand.


## Why the economy doesn't grow instantly

Software is about 2% of the economy. So imagine you have unlimited software: the economy only grows by 2%. That's because the economy has weakest links [@jones-ai-economic-future-2026].


## Security: where weakest links flip

For security, weakest links behave differently, so viruses, info attacks, and nuclear weapons are dangerous.

:::{bibliography}
:::
