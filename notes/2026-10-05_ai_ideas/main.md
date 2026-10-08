---
date: 2026-10-05
---

# Helpful ideas to think about AI

We're living in an era where thinking, decisions, and creative work can be replaced with machine efforts. That would impact how we work, value works, and value values.

Sepcifically, machines can think, can improve themselves, and improving fast.

Consider this scenario. A work you start today completes in 2 days later, but tomorrow completes in 1 day. Would you start today? Why?

If you start today, but the very same work is started tomorrow by someone else, would you change your answer?

The scenario is setup in a balanced setting. In an extreme case, the work starts today completes in a year, starts the end of the year completes in one day. Would you wait?

Are there rules in this rules world? Are there invariants in the ever changing landscape? Here are collections of ideas I felt helpful in thinking things.

## Validating Good Ideas

### The Bitter Lesson

Helpfulness: 5 stars.

Richard Sutton's 2019 piece is a good place to start. A recurring theme in machine learning is that general purpose models beats special purpose ones. 

I wish I could collect a list of The Bitter Lessons in different fields. A commonly quoted one is AI chess playing. Early chess model tried to learn moves from human experts. Alpha Go escaped the dependence on human domain knowlegde and built its strategy with algorithmic search. Alpha Zero even started from scratch without knowing the rules of Go -- top the rank anyway.

Multiple ideas can be drawn from this.

- We should turn thinking into a problem of searching. This works better because Moore's law makes computation cheap.
- Prefer machine searched solutions over domain knowledge.

When we hear project description like this, we know we might be making a wrong turn:

- **Human Expertise Fetish**: "Our project baked in our experts' domain knowledge," "It requires our experts evaluation based on their experience."
    - Ask: are there context out of reach of AI? Can your expert still do better when AI have those context?
- **Product Specialization Fetish**: "Our model is fine-tuned in semi-conductor specific industry." 
    - Ask: Why can't a general purpose model perform better? What problem is so hard that a smart model can't solve?
    - If it is a data problem, it is a privacy and context issue. 

Exceptions:

- Computation budget is binding. The general purpose model wins on the premise of cheap computation power. When a task require fast or limited computation, we might want to specialize design. I think System One models like Jev is a valid case like this.

I'm not a beliver that humans should retire, take UBI, play video games all days, work in the sense of work out, live in Matrix, or live like a pet. I think human should still pursue on something meaningful, whatever that means to individuals. Yet, The Bitter Lesson forms a strong baseline that thinking machines can usually do better than thinking humans. When we want to justify human values we should try to beat that baseline.

### The Dynamo and Computers

Helpfulness: 4 stars.

When electric motors were introduced, productivity didn't boost for many years. Why? Because the factories take time to redesign for the optimal use of electric motors.

Same for the computers. If the whole business logic is not optimized toward computers capability, we won't see a real productivity boost.

Be mindful on what process is currently designed to optimize for human productivity, but not for AI's. 

Examples:

- Programing languages were designed to optimize human's ability to reason with computation. With AI's cheap and powerful mental labors, we can ask AI to write machine code and formal verification codes, aka the "Final Form."
- Github is designed for human to collaborate on code projects. A pull request is meant to be read and understood. What would souce code management mean with AIs? Who should AI collaborate? Redesigns should be en route.

## Seeing where this is going

### Jevons Paradox

Making an efficient use of resource X might cause a greater total consumption of X.

Examples:

- Efficient coal buring factories caused more consumption of coal.
- Fuel efficient cars lead to more fuel use.
- Tokens, or efficient use of computations would cause more demands.

