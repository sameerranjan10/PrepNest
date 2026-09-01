export const APTITUDE_CATEGORIES = [
  {
    id: 'quantitative',
    name: 'Quantitative Aptitude',
    code: 'QA',
    shortName: 'Quant',
    badge: 'Numerical Analysis',
    tagline: 'Master arithmetic, speed math, algebra & probability',
    color: 'from-indigo-500 to-blue-600',
    borderGlow: 'hover:border-indigo-500/50',
    accentColor: 'indigo',
    iconName: 'Calculator',
    subtopics: [
      'Speed, Distance & Time',
      'Time & Work',
      'Profit & Loss',
      'Permutations & Combinations',
      'Probability',
      'Averages',
      'Compound Interest',
      'Ratios & Mixtures',
      'Number Systems',
      'Pipes & Cisterns'
    ],
    recommendedTimePerQuestion: 60, // seconds
    estimatedDuration: '10-20 mins',
    defaultQuestionsCount: 10,
    targetCompanies: ['TCS Digital', 'Infosys', 'Amazon', 'Wipro Turbo', 'Cognizant']
  },
  {
    id: 'logical',
    name: 'Logical Reasoning',
    code: 'LR',
    shortName: 'Logical',
    badge: 'Deductive & Analytical',
    tagline: 'Sharpen syllogisms, blood relations, puzzles & patterns',
    color: 'from-purple-500 to-violet-600',
    borderGlow: 'hover:border-purple-500/50',
    accentColor: 'purple',
    iconName: 'BrainCircuit',
    subtopics: [
      'Blood Relations',
      'Syllogisms',
      'Coding-Decoding',
      'Seating Arrangements',
      'Direction Sense',
      'Number Series',
      'Statement & Assumptions',
      'Odd One Out',
      'Mathematical Operations',
      'Ordering & Ranking'
    ],
    recommendedTimePerQuestion: 50, // seconds
    estimatedDuration: '10-15 mins',
    defaultQuestionsCount: 10,
    targetCompanies: ['Capgemini', 'Accenture', 'Google', 'Deloitte', 'Adobe']
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    code: 'VA',
    shortName: 'Verbal',
    badge: 'Grammar & Vocab',
    tagline: 'Ace reading comprehension, grammar correction & para-jumbles',
    color: 'from-pink-500 to-rose-600',
    borderGlow: 'hover:border-pink-500/50',
    accentColor: 'pink',
    iconName: 'BookOpen',
    subtopics: [
      'Synonyms',
      'Antonyms',
      'Sentence Correction',
      'Idioms & Phrases',
      'Para Jumbles',
      'Subject-Verb Agreement',
      'One Word Substitution',
      'Error Spotting',
      'Reading Comprehension',
      'Verbal Analogies'
    ],
    recommendedTimePerQuestion: 45, // seconds
    estimatedDuration: '8-12 mins',
    defaultQuestionsCount: 10,
    targetCompanies: ['McKinsey', 'Goldman Sachs', 'Microsoft', 'EY', 'TCS NQT']
  }
];

export const FALLBACK_APTITUDE_QUESTIONS = [
  // -------------------------------------------------------------
  // QUANTITATIVE APTITUDE
  // -------------------------------------------------------------
  {
    id: 1,
    category: 'quantitative',
    subtopic: 'Speed, Distance & Time',
    difficulty: 'Easy',
    question_text: 'A train running at a uniform speed of 60 km/hr crosses a stationary electric pole in 9 seconds. What is the length of the train?',
    options: {
      A: '120 meters',
      B: '150 meters',
      C: '175 meters',
      D: '180 meters'
    },
    correct_option: 'B',
    explanation: 'Speed = 60 km/hr = 60 * (5/18) m/sec = 50/3 m/sec. Length of the train = Speed * Time = (50/3) * 9 = 150 meters.'
  },
  {
    id: 2,
    category: 'quantitative',
    subtopic: 'Time & Work',
    difficulty: 'Medium',
    question_text: 'If 12 men or 18 women can complete a piece of work in 14 days, in how many days can 8 men and 16 women complete the same work?',
    options: {
      A: '7 days',
      B: '9 days',
      C: '10 days',
      D: '12 days'
    },
    correct_option: 'B',
    explanation: '12 men = 18 women => 1 man = 1.5 women. Therefore, 8 men + 16 women = (8 * 1.5) + 16 = 12 + 16 = 28 women. If 18 women take 14 days, then 28 women will take (18 * 14) / 28 = 9 days.'
  },
  {
    id: 3,
    category: 'quantitative',
    subtopic: 'Profit & Loss',
    difficulty: 'Medium',
    question_text: 'A retailer marks an item 30% above the cost price and allows a discount of 10% on the marked price. What is his net profit percentage?',
    options: {
      A: '15%',
      B: '17%',
      C: '20%',
      D: '22%'
    },
    correct_option: 'B',
    explanation: 'Let Cost Price (CP) = 100. Marked Price (MP) = 130. Selling Price (SP) after 10% discount = 130 - (10% of 130) = 130 - 13 = 117. Net Profit = 117 - 100 = 17%.'
  },
  {
    id: 4,
    category: 'quantitative',
    subtopic: 'Permutations & Combinations',
    difficulty: 'Hard',
    question_text: "In how many different ways can the letters of the word 'LEADING' be arranged such that the vowels always appear together?",
    options: {
      A: '360',
      B: '480',
      C: '720',
      D: '5040'
    },
    correct_option: 'C',
    explanation: "Word 'LEADING' has 7 letters with vowels: E, A, I (3 vowels) and consonants: L, D, N, G (4 consonants). Treating the 3 vowels as a single group, we have 5 units (4 consonants + 1 group) which can be arranged in 5! = 120 ways. The 3 vowels among themselves can be arranged in 3! = 6 ways. Total arrangements = 120 * 6 = 720."
  },
  {
    id: 5,
    category: 'quantitative',
    subtopic: 'Probability',
    difficulty: 'Medium',
    question_text: 'Two unbiased dice are rolled simultaneously. What is the probability that the product of the numbers appearing on the dice is even?',
    options: {
      A: '1/4',
      B: '1/2',
      C: '3/4',
      D: '5/6'
    },
    correct_option: 'C',
    explanation: 'Total possible outcomes when rolling 2 dice = 6 * 6 = 36. The product is odd only when both dice show odd numbers ({1, 3, 5} x {1, 3, 5} = 9 outcomes). Therefore, outcomes with an even product = 36 - 9 = 27. Probability = 27/36 = 3/4.'
  },
  {
    id: 6,
    category: 'quantitative',
    subtopic: 'Averages',
    difficulty: 'Easy',
    question_text: "The average age of a group of 24 students is 16 years. When the teacher's age is included, the average age increases by 1 year. What is the teacher's age?",
    options: {
      A: '39 years',
      B: '40 years',
      C: '41 years',
      D: '45 years'
    },
    correct_option: 'C',
    explanation: "Total age of 24 students = 24 * 16 = 384 years. New average for 25 people = 17 years. Total age of 25 people = 25 * 17 = 425 years. Teacher's age = 425 - 384 = 41 years."
  },
  {
    id: 7,
    category: 'quantitative',
    subtopic: 'Compound Interest',
    difficulty: 'Medium',
    question_text: 'A sum of money invested under compound interest doubles itself in 4 years. In how many years will it become 8 times itself at the same compound interest rate?',
    options: {
      A: '8 years',
      B: '12 years',
      C: '16 years',
      D: '24 years'
    },
    correct_option: 'B',
    explanation: 'At compound interest, if P becomes 2P in 4 years, it will become 4P (2^2) in 8 years, and 8P (2^3) in 4 * 3 = 12 years.'
  },
  {
    id: 8,
    category: 'quantitative',
    subtopic: 'Ratios & Mixtures',
    difficulty: 'Medium',
    question_text: 'A 50-liter solution contains 20% alcohol by volume. How much pure water must be added to dilute the alcohol concentration down to 10%?',
    options: {
      A: '25 liters',
      B: '40 liters',
      C: '50 liters',
      D: '60 liters'
    },
    correct_option: 'C',
    explanation: 'Amount of alcohol in 50L = 20% of 50 = 10 liters. If water is added, alcohol remains 10L. For 10L to be 10% of total volume V: 0.10 * V = 10 => V = 100 liters. Added water = 100 - 50 = 50 liters.'
  },
  {
    id: 9,
    category: 'quantitative',
    subtopic: 'Number Systems',
    difficulty: 'Easy',
    question_text: 'What is the smallest number which when divided by 12, 15, and 20 leaves a remainder of 4 in each case?',
    options: {
      A: '60',
      B: '64',
      C: '124',
      D: '184'
    },
    correct_option: 'B',
    explanation: 'LCM of (12, 15, 20) = 60. The required number = LCM + remainder = 60 + 4 = 64.'
  },
  {
    id: 10,
    category: 'quantitative',
    subtopic: 'Pipes & Cisterns',
    difficulty: 'Medium',
    question_text: 'Inlet Pipe A can fill an empty reservoir in 6 hours, while outlet Pipe B can empty it in 9 hours. If both pipes are opened together, how long will it take to fill the reservoir?',
    options: {
      A: '12 hours',
      B: '15 hours',
      C: '18 hours',
      D: '24 hours'
    },
    correct_option: 'C',
    explanation: 'Net fraction filled per hour = (1/6) - (1/9) = (3 - 2)/18 = 1/18. Therefore, the entire reservoir will be filled in 18 hours.'
  },

  // -------------------------------------------------------------
  // LOGICAL REASONING
  // -------------------------------------------------------------
  {
    id: 11,
    category: 'logical',
    subtopic: 'Blood Relations',
    difficulty: 'Easy',
    question_text: "Pointing to a photograph of a gentleman, Rohan said: 'His mother is the only daughter of my maternal grandfather.' How is Rohan related to the gentleman in the photograph?",
    options: {
      A: 'Brother',
      B: 'Son',
      C: 'Uncle',
      D: 'Father'
    },
    correct_option: 'A',
    explanation: "The only daughter of Rohan's maternal grandfather is Rohan's mother. Since the gentleman's mother is Rohan's mother, Rohan is his brother."
  },
  {
    id: 12,
    category: 'logical',
    subtopic: 'Syllogisms',
    difficulty: 'Medium',
    question_text: 'Statements:\n1. All cars are vehicles.\n2. No vehicle is an airplane.\nConclusions:\nI. No car is an airplane.\nII. Some vehicles are cars.\nWhich of the conclusions logically follows?',
    options: {
      A: 'Only conclusion I follows',
      B: 'Only conclusion II follows',
      C: 'Neither I nor II follows',
      D: 'Both conclusions I and II follow'
    },
    correct_option: 'D',
    explanation: 'Since all cars are within vehicles and no vehicle is an airplane, no car can be an airplane (I follows). Since all cars are vehicles, some vehicles are cars (II follows). Both follow.'
  },
  {
    id: 13,
    category: 'logical',
    subtopic: 'Coding-Decoding',
    difficulty: 'Easy',
    question_text: "In a certain code language, if 'CLOUD' is coded as 'DMPVE', how will 'STORM' be written in that code?",
    options: {
      A: 'TUNSN',
      B: 'TUPSN',
      C: 'TVQSN',
      D: 'TUQSN'
    },
    correct_option: 'B',
    explanation: 'Each letter shifts forward by +1: C->D, L->M, O->P, U->V, D->E. For STORM: S->T, T->U, O->P, R->S, M->N => TUPSN.'
  },
  {
    id: 14,
    category: 'logical',
    subtopic: 'Seating Arrangements',
    difficulty: 'Hard',
    question_text: 'Six individuals (P, Q, R, S, T, and U) are seated in a circle facing the center. P is opposite to S. Q is sitting to the immediate right of P. T is sitting between S and U. Who is sitting to the immediate left of R?',
    options: {
      A: 'P',
      B: 'S',
      C: 'Q',
      D: 'T'
    },
    correct_option: 'A',
    explanation: 'Arranging the circle with P at top, S at bottom, Q at immediate right of P, and T between S and U places R adjacent to P. Facing center, the person to the immediate left of R is P.'
  },
  {
    id: 15,
    category: 'logical',
    subtopic: 'Direction Sense',
    difficulty: 'Easy',
    question_text: 'Ananya walks 15 meters towards the North. She takes a right turn and walks 20 meters. She then turns right again and walks 15 meters. In which direction and at what distance is she now from her initial starting position?',
    options: {
      A: '20 meters, East',
      B: '20 meters, West',
      C: '35 meters, North-East',
      D: '15 meters, South'
    },
    correct_option: 'A',
    explanation: 'North (+15m) and South (-15m) cancel out. The horizontal displacement is purely 20m East.'
  },
  {
    id: 16,
    category: 'logical',
    subtopic: 'Number Series',
    difficulty: 'Medium',
    question_text: 'Find the missing term in the sequence: 4, 18, 48, 100, 180, ?',
    options: {
      A: '248',
      B: '284',
      C: '294',
      D: '312'
    },
    correct_option: 'C',
    explanation: 'The pattern is n^3 - n^2 for n = 2, 3, 4, 5, 6, 7:\n2^3 - 4 = 4\n3^3 - 9 = 18\n4^3 - 16 = 48\n5^3 - 25 = 100\n6^3 - 36 = 180\n7^3 - 49 = 343 - 49 = 294.'
  },
  {
    id: 17,
    category: 'logical',
    subtopic: 'Statement & Assumptions',
    difficulty: 'Medium',
    question_text: "Statement: 'Enroll in PrepNest\\'s campus placement boot-camp to boost your interview clearance probability by 90%.' - Advertisement.\nAssumptions:\nI. Students desire to increase their probability of getting placed.\nII. PrepNest has proven modules that prepare candidates effectively.",
    options: {
      A: 'Only assumption I is implicit',
      B: 'Only assumption II is implicit',
      C: 'Neither I nor II is implicit',
      D: 'Both assumptions I and II are implicit'
    },
    correct_option: 'D',
    explanation: 'An effective advertisement implicitly assumes the audience desires the advertised outcome and that the program has the credibility to deliver it. Both are implicit.'
  },
  {
    id: 18,
    category: 'logical',
    subtopic: 'Odd One Out',
    difficulty: 'Easy',
    question_text: 'Find the odd one out among the given options: 28, 65, 126, 215, 344',
    options: {
      A: '28',
      B: '65',
      C: '215',
      D: '344'
    },
    correct_option: 'C',
    explanation: 'Pattern is n^3 + 1:\n3^3 + 1 = 28\n4^3 + 1 = 65\n5^3 + 1 = 126\n6^3 + 1 = 217 (here 215 is 6^3 - 1)\n7^3 + 1 = 344.\nHence, 215 is the odd one out.'
  },
  {
    id: 19,
    category: 'logical',
    subtopic: 'Mathematical Operations',
    difficulty: 'Easy',
    question_text: "If '+' denotes '÷', '-' denotes '×', '×' denotes '+', and '÷' denotes '-', evaluate the expression: 45 + 5 - 3 × 12 ÷ 8",
    options: {
      A: '27',
      B: '31',
      C: '35',
      D: '39'
    },
    correct_option: 'B',
    explanation: 'Expression becomes: 45 ÷ 5 × 3 + 12 - 8 = 9 × 3 + 12 - 8 = 27 + 12 - 8 = 31.'
  },
  {
    id: 20,
    category: 'logical',
    subtopic: 'Ordering & Ranking',
    difficulty: 'Medium',
    question_text: 'In a row of 50 students facing North, Aarav is ranked 18th from the left end and Divya is ranked 15th from the right end. How many students are seated between Aarav and Divya?',
    options: {
      A: '15',
      B: '16',
      C: '17',
      D: '18'
    },
    correct_option: 'C',
    explanation: 'Total = 50. Left position + Right position = 18 + 15 = 33. Middle students = 50 - 33 = 17.'
  },

  // -------------------------------------------------------------
  // VERBAL ABILITY
  // -------------------------------------------------------------
  {
    id: 21,
    category: 'verbal',
    subtopic: 'Synonyms',
    difficulty: 'Easy',
    question_text: "Select the word that is closest in meaning (SYNONYM) to 'METICULOUS':",
    options: {
      A: 'Hasty',
      B: 'Diligent & Thorough',
      C: 'Ambiguous',
      D: 'Nonchalant'
    },
    correct_option: 'B',
    explanation: "'Meticulous' means showing extreme care and attention to detail. 'Diligent & Thorough' is the exact synonym."
  },
  {
    id: 22,
    category: 'verbal',
    subtopic: 'Antonyms',
    difficulty: 'Easy',
    question_text: "Select the word that is opposite in meaning (ANTONYM) to 'CANDID':",
    options: {
      A: 'Frank',
      B: 'Evasive',
      C: 'Outspoken',
      D: 'Sincere'
    },
    correct_option: 'B',
    explanation: "'Candid' means straightforward and truthful. 'Evasive' means deliberately avoiding directness, which is its opposite."
  },
  {
    id: 23,
    category: 'verbal',
    subtopic: 'Sentence Correction',
    difficulty: 'Medium',
    question_text: "Identify the grammatically correct version of the following sentence:\n'Neither the engineering team nor the product manager were satisfied with the release notes.'",
    options: {
      A: 'Neither the engineering team or the product manager was satisfied with the release notes.',
      B: 'Neither the engineering team nor the product manager was satisfied with the release notes.',
      C: 'Neither the engineering team nor the product manager were being satisfied with the release notes.',
      D: 'Neither the engineering team nor the product manager are satisfied with the release notes.'
    },
    correct_option: 'B',
    explanation: "In 'neither... nor...' constructions, the verb agrees with the closer subject ('product manager' is singular, requiring 'was')."
  },
  {
    id: 24,
    category: 'verbal',
    subtopic: 'Idioms & Phrases',
    difficulty: 'Easy',
    question_text: "What does the idiom 'To burn the midnight oil' mean?",
    options: {
      A: 'To waste precious energy on trivial matters',
      B: 'To work or study late into the night',
      C: 'To set unrealistic financial goals',
      D: 'To ignite an unresolved conflict'
    },
    correct_option: 'B',
    explanation: "'To burn the midnight oil' refers to studying or working late into the night."
  },
  {
    id: 25,
    category: 'verbal',
    subtopic: 'Para Jumbles',
    difficulty: 'Hard',
    question_text: 'Rearrange the following sentences into a coherent paragraph:\nP: This rapid technological advancement has revolutionized traditional recruitment.\nQ: Artificial Intelligence algorithms can now screen thousands of resumes in seconds.\nR: As a result, candidates must optimize their technical profiles for automated screening.\nS: Modern hiring practices have shifted heavily towards automated candidate filtering.',
    options: {
      A: 'S - Q - P - R',
      B: 'Q - S - R - P',
      C: 'P - S - Q - R',
      D: 'S - R - Q - P'
    },
    correct_option: 'A',
    explanation: 'S establishes the topic of automated filtering. Q details how AI screens resumes. P comments on this shift. R provides the resulting action required. Order is S-Q-P-R.'
  },
  {
    id: 26,
    category: 'verbal',
    subtopic: 'Subject-Verb Agreement',
    difficulty: 'Medium',
    question_text: "Choose the correct option to fill in the blank:\n'A wide array of software development tools _____ introduced during yesterday\\'s developer conference.'",
    options: {
      A: 'was',
      B: 'were',
      C: 'have been',
      D: 'are'
    },
    correct_option: 'A',
    explanation: "The head subject is 'array' (singular), taking the singular past verb 'was'."
  },
  {
    id: 27,
    category: 'verbal',
    subtopic: 'One Word Substitution',
    difficulty: 'Easy',
    question_text: "What is the one-word substitution for 'A person who is capable of using both the left and right hand with equal skill'?",
    options: {
      A: 'Ambivalent',
      B: 'Ambidextrous',
      C: 'Omnipotent',
      D: 'Dexterous'
    },
    correct_option: 'B',
    explanation: "'Ambidextrous' describes a person capable of using both hands with equal skill."
  },
  {
    id: 28,
    category: 'verbal',
    subtopic: 'Error Spotting',
    difficulty: 'Medium',
    question_text: 'Identify which segment of the sentence contains an error:\n(A) Despite of the heavy monsoon showers, / (B) the placement orientation session / (C) commenced strictly on schedule / (D) in the auditorium.',
    options: {
      A: '(A)',
      B: '(B)',
      C: '(C)',
      D: '(D)'
    },
    correct_option: 'A',
    explanation: "'Despite' does not take 'of'. The correct phrase is either 'Despite the heavy...' or 'In spite of the heavy...'."
  },
  {
    id: 29,
    category: 'verbal',
    subtopic: 'Reading Comprehension',
    difficulty: 'Medium',
    question_text: "Passage: 'Distributed microservices architecture provides horizontal scalability and decoupled deployments. However, it introduces operational complexity around inter-service communication latency and eventual data consistency.'\nWhat is the author's primary cautionary note regarding microservices?",
    options: {
      A: 'They do not scale horizontally across cloud clusters.',
      B: 'They eliminate the need for containerization tools.',
      C: 'They trade operational simplicity for distributed complexity and consistency challenges.',
      D: 'They are inferior to legacy monolithic codebases.'
    },
    correct_option: 'C',
    explanation: 'The passage cautions that microservices introduce operational complexity concerning communication latency and consistency.'
  },
  {
    id: 30,
    category: 'verbal',
    subtopic: 'Verbal Analogies',
    difficulty: 'Easy',
    question_text: "Complete the analogy:\n'COMPILER : CODE :: TRANSLATOR : ?'",
    options: {
      A: 'Processor',
      B: 'Language',
      C: 'Memory',
      D: 'Algorithm'
    },
    correct_option: 'B',
    explanation: 'A compiler translates source code; a translator translates language.'
  }
];

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const calculateTestGrade = (scorePercentage) => {
  if (scorePercentage >= 90) return { label: 'Mastery Tier (Top 1%)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (scorePercentage >= 75) return { label: 'Placement Ready (Top 10%)', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
  if (scorePercentage >= 50) return { label: 'Intermediate (Passing)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  return { label: 'Needs Practice', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
};
