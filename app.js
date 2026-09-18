const TOPICS = {
  economics: { label: "Economics", symbol: "↗", subtitle: "Money, markets & decisions", accent: "#6f7757", soft: "#e7eadc", concept: "#f3f4ec", search: ["behavioral economics", "microeconomics", "macroeconomics", "economic theory"] },
  art: { label: "Art", symbol: "◒", subtitle: "How to see, not just look", accent: "#9a654f", soft: "#f0e1da", concept: "#f8f0ec", search: ["art movement", "visual art technique", "art history", "design principle"] },
  science: { label: "Science", symbol: "✦", subtitle: "Ideas that explain our world", accent: "#4c7480", soft: "#dce9ec", concept: "#eef5f6", search: ["scientific phenomenon", "physics concept", "biology concept", "chemistry concept"] },
  psychology: { label: "Psychology", symbol: "◇", subtitle: "Mind, behaviour & emotion", accent: "#806885", soft: "#e9e0eb", concept: "#f5f0f6", search: ["cognitive psychology", "social psychology", "cognitive bias", "human behaviour psychology"] },
  history: { label: "History", symbol: "⌛", subtitle: "People, power & turning points", accent: "#8b6e45", soft: "#eee4d4", concept: "#f7f2e8", search: ["ancient history", "modern history", "history of ideas", "world civilization"] },
  philosophy: { label: "Philosophy", symbol: "∴", subtitle: "Big questions, clearer thinking", accent: "#59677d", soft: "#dfe5ee", concept: "#f0f3f7", search: ["philosophical concept", "thought experiment", "ethics philosophy", "philosophy of mind"] },
  technology: { label: "Technology & AI", symbol: "⌘", subtitle: "Systems shaping tomorrow", accent: "#3f7180", soft: "#dbe9ec", concept: "#edf5f6", search: ["artificial intelligence", "computer science concept", "emerging technology", "internet technology"] },
  business: { label: "Business", symbol: "◆", subtitle: "Strategy, value & growth", accent: "#65724a", soft: "#e4e9d8", concept: "#f2f5eb", search: ["business strategy", "management theory", "business model", "innovation management"] },
  health: { label: "Human Body", symbol: "+", subtitle: "Health, biology & performance", accent: "#9b5d62", soft: "#f1dddf", concept: "#f8eeef", search: ["human physiology", "human anatomy", "neuroscience", "exercise physiology"] },
  geography: { label: "Geography", symbol: "◎", subtitle: "Places, people & planet", accent: "#477568", soft: "#dceae5", concept: "#edf6f3", search: ["physical geography", "human geography", "world geography", "urban geography"] },
  culture: { label: "Culture & Society", symbol: "◉", subtitle: "Ideas that shape how we live", accent: "#9a6c42", soft: "#f0e3d5", concept: "#f8f2eb", search: ["cultural anthropology", "social norm", "sociology concept", "cultural history"] },
  aviation: { label: "Aviation", symbol: "✈", subtitle: "Safety, flight & human factors", accent: "#47708f", soft: "#dce7ef", concept: "#edf3f7", search: ["aviation safety", "flight human factors", "aircraft technology", "history of aviation"] }
};

const CARDS = [
  {
    id: "econ-opportunity-cost", topic: "economics", title: "Every yes has a hidden price", hook: "Opportunity cost is the value of the best alternative you give up when you make a choice.",
    concept: "The real cost of a decision is not only the money spent. It is also the next-best use of your time, cash, or attention that becomes impossible.",
    example: "A €1,000 course costs more than €1,000 if the same money could clear expensive debt—or less if it unlocks a higher salary quickly.",
    takeaway: "Before a meaningful choice, ask: “What is the best thing I can no longer do if I choose this?”"
  },
  {
    id: "econ-compounding", topic: "economics", title: "Compounding rewards consistency", hook: "Returns can generate their own returns, turning time into a financial force multiplier.",
    concept: "With compounding, growth is calculated on the original amount and on past growth. The curve looks slow early on, then accelerates as the base becomes larger.",
    example: "At a hypothetical 7% annual return, €100 becomes about €197 after 10 years and about €387 after 20—without adding more money.",
    takeaway: "A sustainable habit started early often matters more than waiting for the perfect moment or product."
  },
  {
    id: "econ-inflation", topic: "economics", title: "Inflation changes what money can do", hook: "Inflation is a broad rise in prices, which means each euro buys less than before.",
    concept: "Your nominal income is the number on your payslip. Your real income is what that number can actually buy after accounting for price changes.",
    example: "If income rises 3% but prices rise 4%, your pay is higher on paper while your purchasing power has fallen by roughly 1%.",
    takeaway: "Compare salary, savings, and investment growth with inflation—not only with last year’s number."
  },
  {
    id: "econ-sunk-cost", topic: "economics", title: "Past costs should not own future choices", hook: "A sunk cost is time or money already spent that cannot be recovered.",
    concept: "Rational decisions compare future benefits with future costs. Past effort feels important emotionally, but it does not improve a bad option going forward.",
    example: "Finishing a poor course only because you paid for it can waste ten more hours. The payment is gone either way; the ten hours are still yours to protect.",
    takeaway: "Ask: “If I had not already invested in this, would I choose it today?”"
  },
  {
    id: "econ-marginal-thinking", topic: "economics", title: "Big decisions are often made at the margin", hook: "Marginal thinking focuses on the benefit and cost of one additional unit.",
    concept: "The useful question is rarely “Is this good?” It is “Is one more hour, euro, or unit worth more than what it costs me?”",
    example: "The first hour of preparation may prevent major mistakes. The tenth may only polish details. Their value is not equal.",
    takeaway: "When something is already good enough, judge the next increment—not the entire project."
  },
  {
    id: "econ-price-signal", topic: "economics", title: "Prices are compressed information", hook: "A price does more than state cost: it coordinates what buyers want with what sellers can supply.",
    concept: "When demand rises or supply falls, prices often increase. That signal encourages conservation by buyers and greater production by sellers.",
    example: "A sudden rise in hotel prices during an event signals scarce rooms, even if you know nothing about local occupancy data.",
    takeaway: "When a price moves sharply, look for the change in demand, supply, expectations, or all three."
  },
  {
    id: "econ-diversification", topic: "economics", title: "Diversification protects against being precisely wrong", hook: "Spreading exposure reduces the damage caused by any one asset, sector, or outcome.",
    concept: "Diversification cannot remove market-wide risk, but it limits risks specific to a single company or idea. Its value comes from assets not moving identically.",
    example: "Owning ten similar technology stocks may feel diversified, yet they can respond to the same interest-rate shock.",
    takeaway: "Count independent sources of risk, not just the number of things you own."
  },
  {
    id: "econ-incentives", topic: "economics", title: "Incentives explain more than intentions", hook: "People respond to the rewards, costs, and constraints built into a system.",
    concept: "A policy can have a noble goal and still create unintended behavior if the easiest rewarded action differs from the intended one.",
    example: "Rewarding support staff only for short call times may reduce waiting but also encourage rushed, lower-quality help.",
    takeaway: "To predict behavior, identify what the system actually rewards—not what it says it values."
  },
  {
    id: "art-negative-space", topic: "art", title: "Empty space is an active choice", hook: "Negative space is the area around and between subjects—and it shapes what you notice first.",
    concept: "Space creates hierarchy, balance, tension, or calm. A subject surrounded by room can feel precious; a crowded frame can feel urgent or claustrophobic.",
    example: "Luxury advertising often uses generous empty space so one object receives undivided attention and appears more valuable.",
    takeaway: "When viewing an image, notice the shapes made by what is absent. Do they support or compete with the subject?"
  },
  {
    id: "art-chiaroscuro", topic: "art", title: "Light can build drama", hook: "Chiaroscuro uses strong contrast between light and dark to model form and direct emotion.",
    concept: "Bright areas pull the eye forward while deep shadow hides information. Artists use this contrast to make flat surfaces feel three-dimensional and psychologically charged.",
    example: "In many Baroque paintings, a face or hand emerges from darkness, making the gesture feel like the decisive instant of a story.",
    takeaway: "Follow the brightest path through a painting. It often reveals the artist’s intended sequence of attention."
  },
  {
    id: "art-complementary-colors", topic: "art", title: "Opposite colours intensify each other", hook: "Complementary colours sit opposite on a colour wheel, such as blue and orange.",
    concept: "Placed side by side, complementary colours create strong visual energy. Mixed together, they neutralise one another toward muted browns or greys.",
    example: "A small orange light can appear warmer and brighter against a large blue evening sky than it would against beige.",
    takeaway: "Look for colour relationships, not isolated colours: context changes what every colour seems to be."
  },
  {
    id: "art-perspective", topic: "art", title: "Perspective is a designed illusion", hook: "Linear perspective makes parallel lines appear to converge, creating depth on a flat surface.",
    concept: "The horizon corresponds roughly to eye level. Vanishing points organise receding lines, quietly determining where the viewer seems to stand.",
    example: "A road narrowing toward one point can pull you into the image, while a high horizon makes you feel as though you are looking down on the scene.",
    takeaway: "Find the horizon and vanishing point. They reveal the position the artwork has assigned to you."
  },
  {
    id: "art-composition", topic: "art", title: "Composition controls the journey of your eye", hook: "Composition is the arrangement of visual elements—and it determines how an image unfolds over time.",
    concept: "Lines, scale, contrast, repetition, and placement create routes for attention. Balance can be symmetrical and stable or asymmetrical and alive.",
    example: "A diagonal staircase creates movement; a centred figure creates authority; a cropped face can create intimacy or unease.",
    takeaway: "Notice where your eye lands first, second, and third. That route is part of the artwork’s meaning."
  },
  {
    id: "art-context", topic: "art", title: "Context can change an object into art", hook: "Meaning depends not only on what an object is, but on where, when, and why it is presented.",
    concept: "A familiar object placed in a gallery can shift attention from craftsmanship to choice, authorship, institutions, and the definition of art itself.",
    example: "The same chair is furniture in a kitchen, evidence in a courtroom, and a cultural statement in a museum installation.",
    takeaway: "Ask what changed when an ordinary object entered an artistic setting: the object, or the way you were invited to see it?"
  },
  {
    id: "art-patina", topic: "art", title: "Age can become part of beauty", hook: "Patina is the visible change a material develops through time, exposure, and use.",
    concept: "Cracks, oxidation, fading, and wear can carry evidence of history. Conservation often balances original appearance with respect for that history.",
    example: "The green surface of old bronze is not paint; it is a chemical transformation that has become part of how the object is recognised.",
    takeaway: "Before calling wear a flaw, ask whether it destroys the object—or records its life."
  },
  {
    id: "art-abstraction", topic: "art", title: "Abstraction is not the absence of skill", hook: "Abstract art reduces, reshapes, or abandons visible reality to focus on relationships such as colour, rhythm, and form.",
    concept: "The artist may remove literal detail so that structure or sensation becomes the subject. Simplification can be a deliberate result of deep observation.",
    example: "A few curved lines can communicate movement more directly than a carefully rendered body frozen in detail.",
    takeaway: "Instead of asking “What is it?”, ask “What is this arrangement making me notice or feel?”"
  },
  {
    id: "science-bayesian", topic: "science", title: "Good beliefs update with evidence", hook: "Bayesian thinking means adjusting confidence when new evidence arrives—not switching between absolute certainty and doubt.",
    concept: "Evidence matters in relation to what was already plausible. A surprising result should move your belief more when it would be unlikely under alternative explanations.",
    example: "A positive result for a rare condition can still be a false positive if the test is imperfect and the condition was very unlikely beforehand.",
    takeaway: "Ask two questions: “How plausible was this before?” and “How likely is this evidence if I am wrong?”"
  },
  {
    id: "science-correlation", topic: "science", title: "Correlation is a clue, not a cause", hook: "Two things can move together without one producing the other.",
    concept: "A third variable may influence both, the direction may be reversed, or the pattern may be coincidence. Causation needs a mechanism and stronger evidence.",
    example: "Ice-cream sales and sunburns rise together because hot, sunny weather increases both—not because ice cream causes sunburn.",
    takeaway: "When you see a correlation, search for hidden variables and ask what experiment could separate the explanations."
  },
  {
    id: "science-falsifiability", topic: "science", title: "A useful claim must risk being wrong", hook: "A scientific claim should make predictions that evidence could, in principle, contradict.",
    concept: "If every possible outcome is treated as proof, the idea cannot be meaningfully tested. Strong explanations expose themselves to failure.",
    example: "“This treatment improves recovery within two weeks” can be measured; “it works invisibly even when nothing changes” cannot be tested in the same way.",
    takeaway: "Ask: “What result would convince me this explanation is wrong?” If the answer is “nothing,” be cautious."
  },
  {
    id: "science-entropy", topic: "science", title: "Order requires energy", hook: "Entropy describes how energy spreads and how many microscopic arrangements can produce the same overall state.",
    concept: "In an isolated system, highly probable, dispersed states tend to replace concentrated, ordered ones. Local order is possible when energy enters and waste heat leaves.",
    example: "A refrigerator creates a cold, ordered interior by using electricity and releasing more heat into the room.",
    takeaway: "Maintenance is not failure. Homes, bodies, and organisations stay ordered only through continuous energy and work."
  },
  {
    id: "science-scale", topic: "science", title: "Human intuition is poor at huge scales", hook: "We understand differences like ten versus twenty, but struggle to feel the gap between a million and a billion.",
    concept: "A million is 1,000 thousands. A billion is 1,000 millions—three extra zeros that create a thousandfold difference.",
    example: "One million seconds is about 11.6 days. One billion seconds is about 31.7 years.",
    takeaway: "Translate very large numbers into time, distance, or per-person amounts before judging their meaning."
  },
  {
    id: "science-regression", topic: "science", title: "Extreme results often move toward average", hook: "Regression to the mean occurs when an unusually high or low measurement is followed by one closer to typical.",
    concept: "Extreme outcomes often combine a stable cause with temporary luck or noise. When the temporary part fades, the next result looks more ordinary.",
    example: "After an exceptionally poor performance, improvement may happen even without a new intervention—because the original result included bad luck.",
    takeaway: "Do not credit every rebound to the action taken in between. Compare against a control or a longer pattern."
  },
  {
    id: "science-sleep", topic: "science", title: "Sleep is part of learning", hook: "Learning does not end when practice stops; sleep helps stabilise and reorganise new memories.",
    concept: "Different sleep stages support aspects of memory, emotional processing, and skill refinement. Cutting sleep can weaken both attention during learning and later recall.",
    example: "Reviewing an idea briefly before sleep and recalling it the next day can be more effective than extending a tired late-night session.",
    takeaway: "Treat sleep as the final step of study, not as time stolen from it."
  },
  {
    id: "science-emergence", topic: "science", title: "Simple rules can create complex behaviour", hook: "Emergence occurs when interactions among simple parts produce a pattern that no single part controls.",
    concept: "The system-level behaviour comes from relationships and feedback. Understanding each component alone may not reveal the whole pattern.",
    example: "No individual bird designs a flock’s shifting shape. Each follows local rules about distance, alignment, and nearby movement.",
    takeaway: "When a system seems centrally planned, look for simple local incentives that could generate the pattern from the bottom up."
  },
  {
    id: "psychology-predictive-mind", topic: "psychology", title: "Your brain predicts before it perceives", hook: "Perception is not a passive recording of reality; the brain combines sensory input with expectations.",
    concept: "The mind continuously forms predictions about what is likely to be present, then updates them using incoming information. Context therefore changes what we notice and how quickly we interpret it.",
    example: "A hard-to-read word becomes obvious when it appears inside a familiar sentence because the surrounding meaning narrows the possibilities.",
    takeaway: "When your first interpretation feels certain, ask what expectation may have helped create it."
  },
  {
    id: "history-sources", topic: "history", title: "History changes when the question changes", hook: "Historical accounts are built from evidence, but the questions asked determine which evidence becomes important.",
    concept: "Primary sources come from the period being studied; secondary sources interpret them later. Both carry limits, perspectives, and omissions that must be examined.",
    example: "A government record may describe a policy precisely, while a private letter reveals how that policy felt to people living through it.",
    takeaway: "When reading history, ask who created the evidence, for whom, and what voice may be missing."
  },
  {
    id: "philosophy-ship", topic: "philosophy", title: "What makes something remain itself?", hook: "The Ship of Theseus asks whether an object is still the same object after every part has gradually been replaced.",
    concept: "The thought experiment tests competing ideas of identity: continuity through time, physical material, structure, function, or the story we attach to an object.",
    example: "If every component of a restored aircraft is eventually replaced, is it still the original aircraft—or a successor carrying its identity?",
    takeaway: "Notice which kind of continuity matters most when you call a person, organisation, or object “the same.”"
  },
  {
    id: "technology-algorithms", topic: "technology", title: "An algorithm is a recipe, not magic", hook: "An algorithm is a defined sequence of steps for transforming inputs into an output.",
    concept: "Algorithms reflect the goals, data, and trade-offs chosen by people. Even a highly complex system can optimise the wrong outcome if its objective is poorly defined.",
    example: "A recommendation system optimised only for watch time may learn to favour sensational content because attention—not quality—is the target.",
    takeaway: "When technology produces a surprising result, ask what it was instructed to optimise."
  },
  {
    id: "business-moat", topic: "business", title: "A strong business needs more than a good product", hook: "An economic moat is a durable advantage that helps a company defend its value against competitors.",
    concept: "Moats can come from trusted brands, network effects, switching costs, scale, unique data, regulation, or cost advantages. Products can be copied more easily than systems.",
    example: "A payment platform becomes harder to replace as more buyers and sellers depend on the same network.",
    takeaway: "When evaluating a business, ask not only why customers choose it today, but what could keep them choosing it tomorrow."
  },
  {
    id: "health-muscle", topic: "health", title: "Muscle does more than create movement", hook: "Skeletal muscle is active tissue that also influences metabolism, glucose use, balance, and resilience.",
    concept: "Muscle stores and uses glucose, communicates with other tissues, and supports physical function. Preserving it matters across the lifespan, not only for athletic appearance.",
    example: "Regular resistance activity can make everyday actions—carrying, climbing, recovering balance—easier and more efficient.",
    takeaway: "Think of strength as long-term capacity. Small, consistent training supports far more than visible muscle."
  },
  {
    id: "geography-maps", topic: "geography", title: "Every map makes an argument", hook: "A map is a selective model of the world, not a neutral copy of it.",
    concept: "Mapmakers choose projection, scale, boundaries, labels, and what to exclude. Those choices affect which places appear central, large, connected, or important.",
    example: "The Mercator projection preserves direction for navigation but greatly enlarges landmasses near the poles.",
    takeaway: "Before trusting a map, ask what purpose it was designed to serve and what its design distorts."
  },
  {
    id: "culture-norms", topic: "culture", title: "Social norms are invisible instructions", hook: "Norms are shared expectations about behaviour that people often follow without a written rule.",
    concept: "They are reinforced through approval, embarrassment, imitation, and belonging. Because they feel normal, they can be difficult to notice until we enter another group or culture.",
    example: "How closely people stand, when they arrive, or how directly they disagree can signal respect in one setting and rudeness in another.",
    takeaway: "When behaviour feels obviously right or wrong, ask whether you are seeing a universal rule or a learned norm."
  },
  {
    id: "aviation-swiss-cheese", topic: "aviation", title: "Safety depends on layers, not perfection", hook: "The Swiss-cheese model explains accidents as the alignment of weaknesses across several protective layers.",
    concept: "Each defence—training, procedures, technology, supervision—has gaps. An incident can occur when active errors and hidden system weaknesses line up at the same moment.",
    example: "A checklist may catch a setup error, but if time pressure, unclear roles, and a missed cross-check align, several defences can fail together.",
    takeaway: "After an error, look beyond the final person involved and ask which earlier barriers could have prevented it."
  }
];

const QUIZZES = {
  "econ-opportunity-cost": { question: "What is the opportunity cost of a choice?", options: ["Only the money you pay", "The best alternative you give up", "Any past expense you cannot recover"], answer: 1, feedback: "Exactly. The hidden cost is the best path the choice makes unavailable." },
  "econ-compounding": { question: "What makes compounding accelerate over time?", options: ["Returns can earn further returns", "Prices always rise each year", "The original amount stays fixed"], answer: 0, feedback: "Right. Growth joins the base, so future growth is calculated on a larger amount." },
  "econ-inflation": { question: "Income rises 3% while prices rise 4%. What likely happened?", options: ["Purchasing power increased", "Purchasing power stayed identical", "Purchasing power decreased"], answer: 2, feedback: "Correct. Your nominal income rose, but your real purchasing power slipped." },
  "econ-sunk-cost": { question: "What should guide a decision after money has already been spent?", options: ["Future costs and benefits", "The need to justify the past", "How difficult it was to start"], answer: 0, feedback: "Correct. Irrecoverable past costs should not control the next decision." },
  "econ-marginal-thinking": { question: "Marginal thinking evaluates…", options: ["The entire project from the beginning", "One additional unit of effort or cost", "Only the cheapest available choice"], answer: 1, feedback: "Yes. It asks whether the next unit is still worth what it costs." },
  "econ-price-signal": { question: "A sharp price increase can signal…", options: ["Higher demand or lower supply", "Guaranteed higher quality", "That production costs no longer matter"], answer: 0, feedback: "Correct. Prices often compress changes in demand, supply, and expectations." },
  "econ-diversification": { question: "Why might ten technology stocks still be weak diversification?", options: ["Ten assets are always too few", "They may share the same underlying risks", "Technology stocks cannot increase in value"], answer: 1, feedback: "Exactly. Diversification is about independent risks, not simply item count." },
  "econ-incentives": { question: "What best predicts behaviour inside a system?", options: ["Its stated values alone", "What it actually rewards and penalises", "The length of its written rules"], answer: 1, feedback: "Correct. Behaviour often follows the real reward structure, including unintended incentives." },
  "art-negative-space": { question: "In a composition, negative space is…", options: ["An unfinished part", "The area around and between subjects", "Only the darkest region"], answer: 1, feedback: "Right. Empty space is active: it shapes hierarchy, balance, and mood." },
  "art-chiaroscuro": { question: "Chiaroscuro creates drama primarily through…", options: ["Repeated patterns", "Strong light–dark contrast", "Perfect symmetry"], answer: 1, feedback: "Correct. Contrast models form and directs the eye toward key moments." },
  "art-complementary-colors": { question: "Which pair is complementary?", options: ["Blue and orange", "Blue and green", "Red and orange"], answer: 0, feedback: "Exactly. Opposites on the colour wheel intensify one another when placed together." },
  "art-perspective": { question: "In linear perspective, the horizon roughly represents…", options: ["The centre of the canvas", "The viewer’s eye level", "The brightest area"], answer: 1, feedback: "Correct. It helps establish where the artwork positions the viewer." },
  "art-composition": { question: "Composition mainly controls…", options: ["The age of the artwork", "The path and priority of attention", "The price of the materials"], answer: 1, feedback: "Yes. Placement, contrast, and scale choreograph how your eye moves." },
  "art-context": { question: "Why can context change an object’s meaning?", options: ["The material physically changes", "The setting changes how we interpret it", "Museums make every object older"], answer: 1, feedback: "Correct. Presentation can shift attention toward authorship, institutions, and ideas." },
  "art-patina": { question: "Patina is best understood as…", options: ["A modern copy", "Visible change from time, use, and exposure", "A layer that must always be removed"], answer: 1, feedback: "Right. Patina can record an object’s history rather than simply damage it." },
  "art-abstraction": { question: "Abstract art may remove literal detail in order to emphasise…", options: ["Colour, rhythm, and form", "Only technical mistakes", "The frame rather than the artwork"], answer: 0, feedback: "Exactly. Reduction can make structure and sensation more visible." },
  "science-bayesian": { question: "Bayesian thinking combines new evidence with…", options: ["What was already plausible", "Absolute certainty", "The most popular opinion"], answer: 0, feedback: "Correct. Evidence updates a prior level of confidence rather than starting from zero." },
  "science-correlation": { question: "Why doesn’t correlation prove causation?", options: ["All measurements are unreliable", "A third variable or reverse direction may explain it", "Causes never create patterns"], answer: 1, feedback: "Exactly. The pattern is a clue, but alternative explanations must be tested." },
  "science-falsifiability": { question: "A falsifiable claim must…", options: ["Be accepted by everyone", "Risk being contradicted by evidence", "Explain every possible result as proof"], answer: 1, feedback: "Correct. A strong scientific claim exposes itself to a meaningful test." },
  "science-entropy": { question: "How can a refrigerator create a cold interior?", options: ["It destroys heat", "It uses energy and releases more heat outside", "It reverses entropy everywhere"], answer: 1, feedback: "Right. Local order is created by using energy and exporting heat to the room." },
  "science-scale": { question: "A billion is how many millions?", options: ["10", "100", "1,000"], answer: 2, feedback: "Correct. Those three extra zeros make a billion one thousand times a million." },
  "science-regression": { question: "After an extreme result, a more typical result may appear because…", options: ["Temporary luck or noise has faded", "The measurement must be wrong", "Every intervention works"], answer: 0, feedback: "Exactly. Extreme outcomes often contain a temporary component that does not repeat." },
  "science-sleep": { question: "Why is sleep part of effective learning?", options: ["It replaces the need to practise", "It supports memory consolidation and recall", "It prevents all forgetting"], answer: 1, feedback: "Correct. Sleep helps stabilise and reorganise what was learned while awake." },
  "science-emergence": { question: "Emergence describes…", options: ["Complex patterns arising from simple local interactions", "A system controlled by one hidden leader", "Randomness with no underlying rules"], answer: 0, feedback: "Right. System-level order can appear without any single part directing it." },
  "psychology-predictive-mind": { question: "Perception is shaped by sensory input and…", options: ["Expectations and context", "Memory loss", "Chance alone"], answer: 0, feedback: "Correct. The brain uses prior expectations to interpret incomplete sensory information." },
  "history-sources": { question: "A source created during the period being studied is usually called…", options: ["A primary source", "A final source", "A neutral source"], answer: 0, feedback: "Correct. Primary sources come from the time, though they still carry perspective and limitations." },
  "philosophy-ship": { question: "The Ship of Theseus mainly explores…", options: ["Navigation", "Identity through change", "The cost of materials"], answer: 1, feedback: "Exactly. It asks what kind of continuity allows something to remain the same thing." },
  "technology-algorithms": { question: "Why can an algorithm optimise an undesirable outcome?", options: ["It may be given the wrong objective", "Algorithms never use data", "Complex systems have no instructions"], answer: 0, feedback: "Correct. A system can execute its objective well even when that objective is poorly chosen." },
  "business-moat": { question: "An economic moat is…", options: ["A short-term discount", "A durable competitive advantage", "A company’s annual budget"], answer: 1, feedback: "Right. A moat helps protect value from competitors over time." },
  "health-muscle": { question: "Skeletal muscle supports movement and…", options: ["Metabolic health and physical resilience", "Only appearance", "Permanent energy storage"], answer: 0, feedback: "Correct. Muscle also contributes to glucose use, balance, and long-term function." },
  "geography-maps": { question: "Why is a map never completely neutral?", options: ["It selects and distorts information for a purpose", "All maps contain false borders", "Maps cannot represent distance"], answer: 0, feedback: "Exactly. Projection, scale, labels, and omissions all shape the story a map tells." },
  "culture-norms": { question: "Social norms are maintained mainly through…", options: ["Shared expectations and social feedback", "Written law only", "Biology alone"], answer: 0, feedback: "Correct. Approval, imitation, belonging, and embarrassment reinforce unwritten rules." },
  "aviation-swiss-cheese": { question: "In the Swiss-cheese model, an accident occurs when…", options: ["One person makes any mistake", "Weaknesses across several defences align", "Technology is absent"], answer: 1, feedback: "Correct. Safety failures usually involve several gaps lining up, not one isolated cause." }
};

const STORAGE_KEY = "daily-knowledge-v1";
const DEFAULT_STATE = {
  topics: ["economics", "art", "science"],
  completed: {},
  saved: [],
  quizAnswers: {},
  discoveredCards: [],
  dailyCardIds: {},
  discoveryIndex: 0,
  onboardingSeen: false
};
let state = loadState();
let currentFilter = "all";
let activeDialogCardId = null;
let toastTimer;
let dailyLoading = false;
let discoveryLoading = false;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...DEFAULT_STATE,
      ...stored,
      completed: stored?.completed || {},
      saved: stored?.saved || [],
      quizAnswers: stored?.quizAnswers || {},
      discoveredCards: stored?.discoveredCards || [],
      dailyCardIds: stored?.dailyCardIds || {}
    };
  } catch { return { ...DEFAULT_STATE }; }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayNumber(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function allCards() {
  return [...state.discoveredCards, ...CARDS];
}

function findCard(id) {
  return allCards().find(card => card.id === id);
}

function filteredCards() {
  const topics = state.topics.length ? state.topics : DEFAULT_STATE.topics;
  return allCards().filter(card => topics.includes(card.topic));
}

function todaysCards() {
  const ids = state.dailyCardIds[dateKey()] || {};
  return state.topics.map(topicId => findCard(ids[topicId])).filter(Boolean);
}

function fallbackCard(topicId, topicIndex = 0) {
  const list = CARDS.filter(card => card.topic === topicId);
  const seed = dayNumber() + new Date().getUTCFullYear() * 17 + topicIndex * 3;
  return list[seed % list.length];
}

function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) || [text]).map(sentence => sentence.trim()).filter(Boolean);
}

async function fetchKnowledgeCard(topicId, offsetSeed) {
  const topic = TOPICS[topicId];
  const queryIndex = Math.abs(offsetSeed) % topic.search.length;
  const resultOffset = Math.floor(Math.abs(offsetSeed) / topic.search.length) % 200;
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: topic.search[queryIndex],
    gsrnamespace: "0",
    gsrlimit: "1",
    gsroffset: String(resultOffset),
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "7",
    inprop: "url",
    redirects: "1",
    origin: "*",
    format: "json"
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) throw new Error("Knowledge source unavailable");
  const data = await response.json();
  const page = Object.values(data?.query?.pages || {})[0];
  if (!page?.extract || page.extract.length < 120) throw new Error("No suitable article found");
  if (/^(List|Outline|Index) of /i.test(page.title) || /may refer to:/i.test(page.extract.slice(0, 180))) throw new Error("Reference page skipped");
  const sentences = splitSentences(page.extract);
  const hook = sentences[0] || page.extract.slice(0, 220);
  const concept = sentences.slice(1, 4).join(" ") || sentences[0];
  const context = sentences.slice(4, 7).join(" ") || `This idea belongs to the wider study of ${topic.label.toLowerCase()} and connects to many related questions.`;
  return {
    id: `source-${topicId}-${page.pageid}`,
    topic: topicId,
    title: page.title,
    hook,
    concept,
    example: context,
    takeaway: `Close the card and explain ${page.title} in one clear sentence. If you can do that, the idea is already becoming yours.`,
    sourceName: "Wikipedia",
    sourceUrl: page.fullurl,
    discovered: true
  };
}

function addDiscoveredCard(card) {
  if (!card?.discovered) return;
  const existingIndex = state.discoveredCards.findIndex(item => item.id === card.id);
  if (existingIndex >= 0) state.discoveredCards[existingIndex] = card;
  else state.discoveredCards.unshift(card);
}

async function ensureDailyCards() {
  if (dailyLoading) return;
  const today = dateKey();
  if (!state.dailyCardIds[today]) state.dailyCardIds[today] = {};
  const missing = state.topics.filter(topicId => !findCard(state.dailyCardIds[today][topicId]));
  if (!missing.length) return;
  dailyLoading = true;
  renderToday();
  const topicKeys = Object.keys(TOPICS);
  const results = await Promise.allSettled(missing.map(topicId => fetchKnowledgeCard(topicId, dayNumber() * 11 + topicKeys.indexOf(topicId) * 23)));
  results.forEach((result, index) => {
    const topicId = missing[index];
    const card = result.status === "fulfilled" ? result.value : fallbackCard(topicId, topicKeys.indexOf(topicId));
    addDiscoveredCard(card);
    state.dailyCardIds[today][topicId] = card.id;
  });
  const retainedDates = Object.keys(state.dailyCardIds).sort().slice(-45);
  state.dailyCardIds = Object.fromEntries(retainedDates.map(key => [key, state.dailyCardIds[key]]));
  dailyLoading = false;
  saveState();
  renderAll();
}

async function discoverFreshCard() {
  if (discoveryLoading || !state.topics.length) return;
  discoveryLoading = true;
  const button = document.querySelector("#discover-button");
  button.disabled = true;
  button.textContent = "Finding something useful…";
  const topicId = currentFilter !== "all" ? currentFilter : state.topics[state.discoveryIndex % state.topics.length];
  let card = null;
  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const candidate = await fetchKnowledgeCard(topicId, dayNumber() * 17 + (state.discoveryIndex + attempt) * 29);
        card = candidate;
        if (!findCard(candidate.id)) break;
      } catch { /* Try another result before using the offline fallback. */ }
    }
    if (!card) throw new Error("No fresh card found");
    state.discoveryIndex += 1;
    addDiscoveredCard(card);
    saveState();
    renderLibrary();
    openCard(card.id);
    showToast(`A new ${TOPICS[topicId].label} idea was added`);
  } catch {
    showToast("The knowledge source is unavailable. Try again shortly.");
  } finally {
    discoveryLoading = false;
    button.disabled = false;
    button.textContent = "Discover another idea";
  }
}

function isComplete(id) { return Boolean(state.completed[id]); }
function isSaved(id) { return state.saved.includes(id); }

function quizMarkup(card) {
  const quiz = QUIZZES[card.id];
  if (!quiz) {
    const revealed = state.quizAnswers[card.id] === "recalled";
    return `
      <section class="quiz-box recall-box ${revealed ? "answered" : ""}">
        <div class="quiz-heading"><span>Memory check</span><strong>Pause before you reveal.</strong></div>
        <p class="quiz-question">How would you explain “${escapeHtml(card.title)}” in one sentence?</p>
        ${revealed
          ? `<div class="quiz-feedback correct"><strong>Memory cue ✦</strong><p>${escapeHtml(card.hook)}</p></div>`
          : `<button class="recall-button" type="button" data-recall="${escapeHtml(card.id)}">I have my answer — reveal the cue</button>`}
      </section>`;
  }
  const hasAnswer = Object.prototype.hasOwnProperty.call(state.quizAnswers, card.id);
  const selected = state.quizAnswers[card.id];
  const isCorrect = hasAnswer && selected === quiz.answer;
  const options = quiz.options.map((option, index) => {
    const classes = ["quiz-option"];
    if (hasAnswer && index === quiz.answer) classes.push("correct");
    if (hasAnswer && index === selected && index !== quiz.answer) classes.push("incorrect");
    return `<button class="${classes.join(" ")}" type="button" data-quiz-card="${escapeHtml(card.id)}" data-quiz-choice="${index}" ${hasAnswer ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`;
  }).join("");
  return `
    <section class="quiz-box ${hasAnswer ? "answered" : ""}">
      <div class="quiz-heading"><span>Quick check</span><strong>One tap. Make it stick.</strong></div>
      <p class="quiz-question">${escapeHtml(quiz.question)}</p>
      <div class="quiz-options">${options}</div>
      ${hasAnswer ? `<div class="quiz-feedback ${isCorrect ? "correct" : "incorrect"}"><strong>${isCorrect ? "That’s it ✦" : "Almost—good guess."}</strong><p>${escapeHtml(quiz.feedback)}</p>${!isCorrect ? `<button type="button" data-quiz-reset="${escapeHtml(card.id)}">Try again</button>` : ""}</div>` : ""}
    </section>`;
}

function cardMarkup(card, { dialog = false } = {}) {
  const topic = TOPICS[card.topic];
  const complete = isComplete(card.id);
  const saved = isSaved(card.id);
  const sourceUrl = safeUrl(card.sourceUrl);
  return `
    <article class="learning-card" style="--accent:${topic.accent};--tag-bg:${topic.soft};--concept-bg:${topic.concept}">
      <div class="card-inner">
        <div class="card-topline">
          <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
          <span class="read-time">2 min read</span>
        </div>
        <h2 class="card-title">${escapeHtml(card.title)}</h2>
        <p class="card-hook">${escapeHtml(card.hook)}</p>
        <div class="concept-box"><strong>The idea</strong><p>${escapeHtml(card.concept)}</p></div>
        <div class="why-row">
          <div><span>${card.discovered ? "In context" : "In real life"}</span><p>${escapeHtml(card.example)}</p></div>
          <div><span>Make it stick</span><p>${escapeHtml(card.takeaway)}</p></div>
        </div>
        ${sourceUrl ? `<a class="source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Source: ${escapeHtml(card.sourceName || "Read more")} ↗</a>` : ""}
        ${quizMarkup(card)}
        <div class="card-actions">
          <button class="primary-button ${complete ? "completed" : ""}" type="button" data-complete="${escapeHtml(card.id)}">${complete ? "✓ Completed" : "Mark as complete"}</button>
          <button class="secondary-button ${saved ? "saved" : ""}" type="button" data-save="${escapeHtml(card.id)}">${saved ? "★ Saved" : "☆ Save for later"}</button>
        </div>
      </div>
    </article>`;
}

function dailyCardMarkup(card, index) {
  const topic = TOPICS[card.topic];
  const complete = isComplete(card.id);
  return `
    <button class="daily-topic-card ${complete ? "complete" : ""}" type="button" data-open-card="${escapeHtml(card.id)}" style="--accent:${topic.accent};--tag-bg:${topic.soft};--concept-bg:${topic.concept}">
      <span class="daily-card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="topic-symbol daily-symbol" style="--symbol-bg:${topic.soft}">${escapeHtml(topic.symbol)}</span>
      <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
      <strong>${escapeHtml(card.title)}</strong>
      <span class="daily-card-hook">${escapeHtml(card.hook)}</span>
      <span class="daily-card-action">${complete ? "Learned today ✓" : "Open card →"}</span>
    </button>`;
}

function miniCardMarkup(card) {
  const topic = TOPICS[card.topic];
  return `
    <button class="mini-card" type="button" data-open-card="${escapeHtml(card.id)}" style="--accent:${topic.accent};--tag-bg:${topic.soft}">
      <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.hook)}</p>
      <span class="mini-meta"><span>${card.discovered ? "Fresh · sourced" : "2 min"}</span><span class="mini-state">${isComplete(card.id) ? "✓ Learned" : isSaved(card.id) ? "★ Saved" : "Read →"}</span></span>
    </button>`;
}

function dailySkeletonMarkup(topicId, index) {
  const topic = TOPICS[topicId];
  return `
    <div class="daily-topic-card daily-skeleton" style="--accent:${topic.accent};--tag-bg:${topic.soft}">
      <span class="daily-card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="topic-symbol daily-symbol" style="--symbol-bg:${topic.soft}">${escapeHtml(topic.symbol)}</span>
      <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
      <span class="skeleton-line wide"></span><span class="skeleton-line"></span><span class="skeleton-line short"></span>
      <span class="daily-card-action">Finding today’s idea…</span>
    </div>`;
}

function renderToday() {
  const date = new Date();
  const todayIds = state.dailyCardIds[dateKey()] || {};
  const slots = state.topics.map(topicId => ({ topicId, card: findCard(todayIds[topicId]) }));
  const cards = slots.map(slot => slot.card).filter(Boolean);
  const completed = cards.filter(card => isComplete(card.id)).length;
  const total = state.topics.length;
  const allDone = total > 0 && cards.length === total && completed === total;
  document.querySelector("#today-date").textContent = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  document.querySelector("#today-heading").textContent = total === 3 ? "Your daily three" : "Your daily set";
  document.querySelector("#daily-deck").innerHTML = slots.map((slot, index) => slot.card ? dailyCardMarkup(slot.card, index) : dailySkeletonMarkup(slot.topicId, index)).join("");
  document.querySelector("#daily-progress-label").textContent = `${completed} / ${total}`;
  document.querySelector("#daily-progress-message").textContent = dailyLoading && cards.length < total ? "Curating today’s fresh ideas…" : allDone ? "Challenge complete. Your streak is secure." : completed ? "Keep going—finish today’s set." : `Today’s challenge: master ${total} ${total === 1 ? "idea" : "ideas"}.`;
  document.querySelector("#daily-progress-fill").style.width = `${total ? (completed / total) * 100 : 0}%`;
  document.querySelector("#daily-progress").classList.toggle("complete", allDone);
  document.querySelector("#streak-count").textContent = calculateStreak();
}

function calculateStreak() {
  const completedDates = new Set(Object.values(state.completed));
  let streak = 0;
  const cursor = new Date();
  if (!completedDates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (completedDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderFilters() {
  const available = ["all", ...state.topics];
  if (!available.includes(currentFilter)) currentFilter = "all";
  document.querySelector("#library-filters").innerHTML = available.map(topic => {
    const label = topic === "all" ? "All topics" : TOPICS[topic].label;
    return `<button class="filter-button ${currentFilter === topic ? "active" : ""}" type="button" data-filter="${topic}">${label}</button>`;
  }).join("");
}

function renderLibrary() {
  const list = filteredCards().filter(card => currentFilter === "all" || card.topic === currentFilter);
  document.querySelector("#library-count").textContent = "Keeps growing";
  document.querySelector("#library-grid").innerHTML = list.map(miniCardMarkup).join("");
}

function renderSaved() {
  const list = state.saved.map(findCard).filter(Boolean);
  document.querySelector("#saved-count").textContent = `${list.length} saved`;
  document.querySelector("#saved-grid").innerHTML = list.length ? list.map(miniCardMarkup).join("") : `
    <div class="empty-state"><h3>Your collection is waiting</h3><p>Save an idea you want to remember, revisit, or put into practice.</p></div>`;
}

function renderTopicOptions() {
  document.querySelector("#topic-options").innerHTML = Object.entries(TOPICS).map(([id, topic]) => `
    <label class="topic-option">
      <input type="checkbox" name="topic" value="${id}" ${state.topics.includes(id) ? "checked" : ""}>
      <span class="topic-choice">
        <span class="topic-symbol" style="--symbol-bg:${topic.soft}">${topic.symbol}</span>
        <span class="topic-copy"><strong>${topic.label}</strong><small>${topic.subtitle}</small></span>
        <span class="topic-check" aria-hidden="true"></span>
      </span>
    </label>`).join("");
}

function renderAll() {
  renderToday(); renderFilters(); renderLibrary(); renderSaved(); renderTopicOptions();
  if (activeDialogCardId && document.querySelector("#card-dialog").open) {
    const card = findCard(activeDialogCardId);
    if (card) document.querySelector("#dialog-card").innerHTML = cardMarkup(card);
  }
}

function showView(name) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `${name}-view`));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.viewLink === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCard(id) {
  const card = findCard(id);
  if (!card) return;
  activeDialogCardId = id;
  document.querySelector("#dialog-card").innerHTML = cardMarkup(card, { dialog: true });
  document.querySelector("#card-dialog").showModal();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.addEventListener("click", event => {
  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) showView(viewLink.dataset.viewLink);

  const completeButton = event.target.closest("[data-complete]");
  if (completeButton) {
    const id = completeButton.dataset.complete;
    const completing = !isComplete(id);
    if (isComplete(id)) {
      delete state.completed[id];
    } else {
      state.completed[id] = dateKey();
    }
    saveState(); renderAll();
    const dailyIds = todaysCards().map(card => card.id);
    const dailySetComplete = dailyIds.includes(id) && dailyIds.every(cardId => isComplete(cardId));
    showToast(!completing ? "Marked as not completed" : dailySetComplete ? "Daily set complete — brilliant work ✦" : "One down. Keep your curiosity moving.");
  }

  const quizChoice = event.target.closest("[data-quiz-choice]");
  if (quizChoice) {
    const id = quizChoice.dataset.quizCard;
    const choice = Number(quizChoice.dataset.quizChoice);
    state.quizAnswers[id] = choice;
    saveState(); renderAll();
    if (choice === QUIZZES[id].answer) showToast("Correct — that idea is yours now.");
  }

  const recallButton = event.target.closest("[data-recall]");
  if (recallButton) {
    state.quizAnswers[recallButton.dataset.recall] = "recalled";
    saveState(); renderAll();
    showToast("Good. Active recall makes knowledge last.");
  }

  const quizReset = event.target.closest("[data-quiz-reset]");
  if (quizReset) {
    delete state.quizAnswers[quizReset.dataset.quizReset];
    saveState(); renderAll();
  }

  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    const id = saveButton.dataset.save;
    if (isSaved(id)) {
      state.saved = state.saved.filter(item => item !== id);
      showToast("Removed from saved");
    } else {
      state.saved.unshift(id);
      showToast("Saved for later");
    }
    saveState(); renderAll();
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) { currentFilter = filterButton.dataset.filter; renderFilters(); renderLibrary(); }

  const miniCard = event.target.closest("[data-open-card]");
  if (miniCard) openCard(miniCard.dataset.openCard);
});

document.querySelector("#settings-button").addEventListener("click", () => {
  renderTopicOptions();
  document.querySelector("#topic-error").textContent = "";
  document.querySelector("#topic-dialog").showModal();
});

document.querySelector("#topic-form").addEventListener("submit", event => {
  event.preventDefault();
  const selected = [...new FormData(event.currentTarget).getAll("topic")];
  if (!selected.length) {
    document.querySelector("#topic-error").textContent = "Choose at least one topic.";
    return;
  }
  state.topics = selected;
  state.onboardingSeen = true;
  saveState();
  currentFilter = "all";
  document.querySelector("#topic-dialog").close();
  renderAll();
  ensureDailyCards();
  showToast("Your daily mix is ready");
});

document.querySelector("#discover-button").addEventListener("click", discoverFreshCard);

document.querySelector(".dialog-close").addEventListener("click", () => document.querySelector("#card-dialog").close());
document.querySelector("#card-dialog").addEventListener("click", event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

renderAll();
ensureDailyCards();
if (!state.onboardingSeen) setTimeout(() => document.querySelector("#topic-dialog").showModal(), 350);
