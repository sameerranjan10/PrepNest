import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

SEED_QUESTIONS = [
    # -------------------------------------------------------------
    # QUANTITATIVE APTITUDE
    # -------------------------------------------------------------
    {
        "category": "quantitative",
        "subtopic": "Speed, Distance & Time",
        "difficulty": "Easy",
        "question_text": "A train running at a uniform speed of 60 km/hr crosses a stationary electric pole in 9 seconds. What is the length of the train?",
        "option_a": "120 meters",
        "option_b": "150 meters",
        "option_c": "175 meters",
        "option_d": "180 meters",
        "correct_option": "B",
        "explanation": "Speed = 60 km/hr = 60 * (5/18) m/sec = 50/3 m/sec. Length of the train = Speed * Time = (50/3) * 9 = 150 meters."
    },
    {
        "category": "quantitative",
        "subtopic": "Time & Work",
        "difficulty": "Medium",
        "question_text": "If 12 men or 18 women can complete a piece of work in 14 days, in how many days can 8 men and 16 women complete the same work?",
        "option_a": "7 days",
        "option_b": "9 days",
        "option_c": "10 days",
        "option_d": "12 days",
        "correct_option": "B",
        "explanation": "12 men = 18 women => 1 man = 1.5 women. Therefore, 8 men + 16 women = (8 * 1.5) + 16 = 12 + 16 = 28 women. If 18 women take 14 days, then 28 women will take (18 * 14) / 28 = 9 days."
    },
    {
        "category": "quantitative",
        "subtopic": "Profit & Loss",
        "difficulty": "Medium",
        "question_text": "A retailer marks an item 30% above the cost price and allows a discount of 10% on the marked price. What is his net profit percentage?",
        "option_a": "15%",
        "option_b": "17%",
        "option_c": "20%",
        "option_d": "22%",
        "correct_option": "B",
        "explanation": "Let Cost Price (CP) = 100. Marked Price (MP) = 130. Selling Price (SP) after 10% discount = 130 - (10% of 130) = 130 - 13 = 117. Net Profit = 117 - 100 = 17%."
    },
    {
        "category": "quantitative",
        "subtopic": "Permutations & Combinations",
        "difficulty": "Hard",
        "question_text": "In how many different ways can the letters of the word 'LEADING' be arranged such that the vowels always appear together?",
        "option_a": "360",
        "option_b": "480",
        "option_c": "720",
        "option_d": "5040",
        "correct_option": "C",
        "explanation": "Word 'LEADING' has 7 letters with vowels: E, A, I (3 vowels) and consonants: L, D, N, G (4 consonants). Treating the 3 vowels as a single unit, we have 5 units (4 consonants + 1 group) which can be arranged in 5! = 120 ways. The 3 vowels among themselves can be arranged in 3! = 6 ways. Total arrangements = 120 * 6 = 720."
    },
    {
        "category": "quantitative",
        "subtopic": "Probability",
        "difficulty": "Medium",
        "question_text": "Two unbiased dice are rolled simultaneously. What is the probability that the product of the numbers appearing on the dice is even?",
        "option_a": "1/4",
        "option_b": "1/2",
        "option_c": "3/4",
        "option_d": "5/6",
        "correct_option": "C",
        "explanation": "Total possible outcomes when rolling 2 dice = 6 * 6 = 36. The product is odd only when both dice show odd numbers ({1, 3, 5} x {1, 3, 5} = 9 outcomes). Therefore, outcomes with an even product = 36 - 9 = 27. Probability = 27/36 = 3/4."
    },
    {
        "category": "quantitative",
        "subtopic": "Averages",
        "difficulty": "Easy",
        "question_text": "The average age of a group of 24 students is 16 years. When the teacher's age is included, the average age increases by 1 year. What is the teacher's age?",
        "option_a": "39 years",
        "option_b": "40 years",
        "option_c": "41 years",
        "option_d": "45 years",
        "correct_option": "C",
        "explanation": "Total age of 24 students = 24 * 16 = 384 years. New average for 25 people = 17 years. Total age of 25 people = 25 * 17 = 425 years. Teacher's age = 425 - 384 = 41 years."
    },
    {
        "category": "quantitative",
        "subtopic": "Compound Interest",
        "difficulty": "Medium",
        "question_text": "A sum of money invested under compound interest doubles itself in 4 years. In how many years will it become 8 times itself at the same compound interest rate?",
        "option_a": "8 years",
        "option_b": "12 years",
        "option_c": "16 years",
        "option_d": "24 years",
        "correct_option": "B",
        "explanation": "At compound interest, if P becomes 2P in 4 years, it will become 4P (2^2) in 8 years, and 8P (2^3) in 4 * 3 = 12 years."
    },
    {
        "category": "quantitative",
        "subtopic": "Ratios & Mixtures",
        "difficulty": "Medium",
        "question_text": "A 50-liter solution contains 20% alcohol by volume. How much pure water must be added to dilute the alcohol concentration down to 10%?",
        "option_a": "25 liters",
        "option_b": "40 liters",
        "option_c": "50 liters",
        "option_d": "60 liters",
        "correct_option": "C",
        "explanation": "Amount of alcohol in 50L = 20% of 50 = 10 liters. If water is added, alcohol remains 10L. For 10L to be 10% of total volume V: 0.10 * V = 10 => V = 100 liters. Added water = 100 - 50 = 50 liters."
    },
    {
        "category": "quantitative",
        "subtopic": "Number Systems",
        "difficulty": "Easy",
        "question_text": "What is the smallest number which when divided by 12, 15, and 20 leaves a remainder of 4 in each case?",
        "option_a": "60",
        "option_b": "64",
        "option_c": "124",
        "option_d": "184",
        "correct_option": "B",
        "explanation": "LCM of (12, 15, 20) = 60. The required number = LCM + remainder = 60 + 4 = 64."
    },
    {
        "category": "quantitative",
        "subtopic": "Pipes & Cisterns",
        "difficulty": "Medium",
        "question_text": "Inlet Pipe A can fill an empty reservoir in 6 hours, while outlet Pipe B can empty it in 9 hours. If both pipes are opened together, how long will it take to fill the reservoir?",
        "option_a": "12 hours",
        "option_b": "15 hours",
        "option_c": "18 hours",
        "option_d": "24 hours",
        "correct_option": "C",
        "explanation": "Net fraction filled per hour = (1/6) - (1/9) = (3 - 2)/18 = 1/18. Therefore, the entire reservoir will be filled in 18 hours."
    },

    # -------------------------------------------------------------
    # LOGICAL REASONING
    # -------------------------------------------------------------
    {
        "category": "logical",
        "subtopic": "Blood Relations",
        "difficulty": "Easy",
        "question_text": "Pointing to a photograph of a gentleman, Rohan said: 'His mother is the only daughter of my maternal grandfather.' How is Rohan related to the gentleman in the photograph?",
        "option_a": "Brother",
        "option_b": "Son",
        "option_c": "Uncle",
        "option_d": "Father",
        "correct_option": "A",
        "explanation": "The only daughter of Rohan's maternal grandfather is Rohan's mother. Since the gentleman's mother is Rohan's mother, Rohan is the brother (or Rohan and the gentleman share the same mother)."
    },
    {
        "category": "logical",
        "subtopic": "Syllogisms",
        "difficulty": "Medium",
        "question_text": "Statements:\n1. All cars are vehicles.\n2. No vehicle is an airplane.\nConclusions:\nI. No car is an airplane.\nII. Some vehicles are cars.\nWhich of the conclusions logically follows?",
        "option_a": "Only conclusion I follows",
        "option_b": "Only conclusion II follows",
        "option_c": "Neither I nor II follows",
        "option_d": "Both conclusions I and II follow",
        "correct_option": "D",
        "explanation": "Since all cars are inside the set of vehicles, and no vehicle overlaps with airplanes, no car can be an airplane (Conclusion I follows). Also, since all cars are vehicles, some vehicles are certainly cars (Conclusion II follows). Hence, both follow."
    },
    {
        "category": "logical",
        "subtopic": "Coding-Decoding",
        "difficulty": "Easy",
        "question_text": "In a certain code language, if 'CLOUD' is coded as 'DMPVE', how will 'STORM' be written in that code?",
        "option_a": "TUNSN",
        "option_b": "TUPSN",
        "option_c": "TVQSN",
        "option_d": "TUQSN",
        "correct_option": "B",
        "explanation": "Each letter is shifted forward by +1 position in the alphabet: C->D, L->M, O->P, U->V, D->E. Applying +1 to STORM: S->T, T->U, O->P, R->S, M->N => TUPSN."
    },
    {
        "category": "logical",
        "subtopic": "Seating Arrangements",
        "difficulty": "Hard",
        "question_text": "Six individuals (P, Q, R, S, T, and U) are seated in a circle facing the center. P is opposite to S. Q is sitting to the immediate right of P. T is sitting between S and U. Who is sitting to the immediate left of R?",
        "option_a": "P",
        "option_b": "S",
        "option_c": "Q",
        "option_d": "T",
        "correct_option": "A",
        "explanation": "Placing P at top (12 o'clock), S is at bottom (6 o'clock). Q is right of P (counter-clockwise or 10 o'clock). T is between S and U. Thus R must be placed at 2 o'clock, to the left of P. Facing the center, the person to the immediate left of R is P."
    },
    {
        "category": "logical",
        "subtopic": "Direction Sense",
        "difficulty": "Easy",
        "question_text": "Ananya walks 15 meters towards the North. She takes a right turn and walks 20 meters. She then turns right again and walks 15 meters. In which direction and at what distance is she now from her initial starting position?",
        "option_a": "20 meters, East",
        "option_b": "20 meters, West",
        "option_c": "35 meters, North-East",
        "option_d": "15 meters, South",
        "correct_option": "A",
        "explanation": "North movement (+15m) is cancelled by the subsequent South movement (-15m). She is displaced purely horizontally 20m towards the East."
    },
    {
        "category": "logical",
        "subtopic": "Number Series",
        "difficulty": "Medium",
        "question_text": "Find the missing term in the sequence: 4, 18, 48, 100, 180, ?",
        "option_a": "248",
        "option_b": "284",
        "option_c": "294",
        "option_d": "312",
        "correct_option": "C",
        "explanation": "The nth term follows the pattern n^3 - n^2 (or n^2 * (n - 1) for n starting at 2):\n2^3 - 2^2 = 8 - 4 = 4\n3^3 - 3^2 = 27 - 9 = 18\n4^3 - 4^2 = 64 - 16 = 48\n5^3 - 5^2 = 125 - 25 = 100\n6^3 - 6^2 = 216 - 36 = 180\n7^3 - 7^2 = 343 - 49 = 294."
    },
    {
        "category": "logical",
        "subtopic": "Statement & Assumptions",
        "difficulty": "Medium",
        "question_text": "Statement: 'Enroll in PrepNest's campus placement boot-camp to boost your interview clearance probability by 90%.' - Advertisement.\nAssumptions:\nI. Students desire to increase their probability of getting placed.\nII. PrepNest has proven modules that prepare candidates effectively.",
        "option_a": "Only assumption I is implicit",
        "option_b": "Only assumption II is implicit",
        "option_c": "Neither I nor II is implicit",
        "option_d": "Both assumptions I and II are implicit",
        "correct_option": "D",
        "explanation": "An advertiser assumes both that the target audience desires the outcome advertised (higher clearance rate) and that the offering has the competency to deliver that promised outcome. Both assumptions are implicit."
    },
    {
        "category": "logical",
        "subtopic": "Odd One Out",
        "difficulty": "Easy",
        "question_text": "Find the odd one out among the given options: 28, 65, 126, 215, 344",
        "option_a": "28",
        "option_b": "65",
        "option_c": "215",
        "option_d": "344",
        "correct_option": "C",
        "explanation": "Pattern is n^3 + 1:\n3^3 + 1 = 28\n4^3 + 1 = 65\n5^3 + 1 = 126\n6^3 + 1 = 217 (here 215 is 6^3 - 1)\n7^3 + 1 = 344.\nTherefore, 215 is the odd one out."
    },
    {
        "category": "logical",
        "subtopic": "Mathematical Operations",
        "difficulty": "Easy",
        "question_text": "If '+' denotes '÷', '-' denotes '×', '×' denotes '+', and '÷' denotes '-', evaluate the expression: 45 + 5 - 3 × 12 ÷ 8",
        "option_a": "27",
        "option_b": "31",
        "option_c": "35",
        "option_d": "39",
        "correct_option": "B",
        "explanation": "Replacing symbols: 45 ÷ 5 × 3 + 12 - 8. Following BODMAS: 9 × 3 + 12 - 8 = 27 + 12 - 8 = 39 - 8 = 31."
    },
    {
        "category": "logical",
        "subtopic": "Ordering & Ranking",
        "difficulty": "Medium",
        "question_text": "In a row of 50 students facing North, Aarav is ranked 18th from the left end and Divya is ranked 15th from the right end. How many students are seated between Aarav and Divya?",
        "option_a": "15",
        "option_b": "16",
        "option_c": "17",
        "option_d": "18",
        "correct_option": "C",
        "explanation": "Total students = 50. Sum of positions from both ends = 18 + 15 = 33. Since 33 < 50, there is no overlap. Number of students between them = 50 - 33 = 17."
    },

    # -------------------------------------------------------------
    # VERBAL ABILITY
    # -------------------------------------------------------------
    {
        "category": "verbal",
        "subtopic": "Synonyms",
        "difficulty": "Easy",
        "question_text": "Select the word that is closest in meaning (SYNONYM) to 'METICULOUS':",
        "option_a": "Hasty",
        "option_b": "Diligent & Thorough",
        "option_c": "Ambiguous",
        "option_d": "Nonchalant",
        "correct_option": "B",
        "explanation": "'Meticulous' means showing great attention to detail and being very careful and precise; diligent and thorough is the exact synonym."
    },
    {
        "category": "verbal",
        "subtopic": "Antonyms",
        "difficulty": "Easy",
        "question_text": "Select the word that is opposite in meaning (ANTONYM) to 'CANDID':",
        "option_a": "Frank",
        "option_b": "Evasive",
        "option_c": "Outspoken",
        "option_d": "Sincere",
        "correct_option": "B",
        "explanation": "'Candid' means truthful, open, and straightforward. 'Evasive' means deliberately vague, ambiguous, or secretive, making it the antonym."
    },
    {
        "category": "verbal",
        "subtopic": "Sentence Correction",
        "difficulty": "Medium",
        "question_text": "Identify the grammatically correct version of the following sentence:\n'Neither the engineering team nor the product manager were satisfied with the release notes.'",
        "option_a": "Neither the engineering team or the product manager was satisfied with the release notes.",
        "option_b": "Neither the engineering team nor the product manager was satisfied with the release notes.",
        "option_c": "Neither the engineering team nor the product manager were being satisfied with the release notes.",
        "option_d": "Neither the engineering team nor the product manager are satisfied with the release notes.",
        "correct_option": "B",
        "explanation": "When subjects are joined by 'neither... nor...', the verb agrees with the closer subject. 'Product manager' is singular, so the singular verb 'was' must be used."
    },
    {
        "category": "verbal",
        "subtopic": "Idioms & Phrases",
        "difficulty": "Easy",
        "question_text": "What does the idiom 'To burn the midnight oil' mean?",
        "option_a": "To waste precious energy on trivial matters",
        "option_b": "To work or study late into the night",
        "option_c": "To set unrealistic financial goals",
        "option_d": "To ignite an unresolved conflict",
        "correct_option": "B",
        "explanation": "'To burn the midnight oil' means to work or study late into the night, referring historically to burning oil lamps to study after sunset."
    },
    {
        "category": "verbal",
        "subtopic": "Para Jumbles",
        "difficulty": "Hard",
        "question_text": "Rearrange the following sentences into a coherent paragraph:\nP: This rapid technological advancement has revolutionized traditional recruitment.\nQ: Artificial Intelligence algorithms can now screen thousands of resumes in seconds.\nR: As a result, candidates must optimize their technical profiles for automated screening.\nS: Modern hiring practices have shifted heavily towards automated candidate filtering.",
        "option_a": "S - Q - P - R",
        "option_b": "Q - S - R - P",
        "option_c": "P - S - Q - R",
        "option_d": "S - R - Q - P",
        "correct_option": "A",
        "explanation": "Sentence S introduces the broad topic (automated hiring). Q provides a specific example of the technology (AI screening resumes). P comments on the impact of this advancement. R concludes with the logical consequence for job candidates. Order: S-Q-P-R."
    },
    {
        "category": "verbal",
        "subtopic": "Subject-Verb Agreement",
        "difficulty": "Medium",
        "question_text": "Choose the correct option to fill in the blank:\n'A wide array of software development tools _____ introduced during yesterday's developer conference.'",
        "option_a": "was",
        "option_b": "were",
        "option_c": "have been",
        "option_d": "are",
        "correct_option": "A",
        "explanation": "The head noun of the subject is 'array' (singular), modified by 'a wide array of...'. In formal standard grammar with collective phrases denoting a single set, 'was' is appropriate for past event."
    },
    {
        "category": "verbal",
        "subtopic": "One Word Substitution",
        "difficulty": "Easy",
        "question_text": "What is the one-word substitution for 'A person who is capable of using both the left and right hand with equal skill'?",
        "option_a": "Ambivalent",
        "option_b": "Ambidextrous",
        "option_c": "Omnipotent",
        "option_d": "Dexterous",
        "correct_option": "B",
        "explanation": "'Ambidextrous' (from Latin ambi = both, dexter = right-handed/skillful) refers to someone who can use both hands with equal facility."
    },
    {
        "category": "verbal",
        "subtopic": "Error Spotting",
        "difficulty": "Medium",
        "question_text": "Identify which segment of the sentence contains an error:\n(A) Despite of the heavy monsoon showers, / (B) the placement orientation session / (C) commenced strictly on schedule / (D) in the auditorium.",
        "option_a": "(A)",
        "option_b": "(B)",
        "option_c": "(C)",
        "option_d": "(D)",
        "correct_option": "A",
        "explanation": "'Despite' is a preposition that never takes 'of'. The correct usage is either 'Despite the heavy...' or 'In spite of the heavy...'."
    },
    {
        "category": "verbal",
        "subtopic": "Reading Comprehension",
        "difficulty": "Medium",
        "question_text": "Passage: 'Distributed microservices architecture provides horizontal scalability and decoupled deployments. However, it introduces operational complexity around inter-service communication latency and eventual data consistency.'\nWhat is the author's primary cautionary note regarding microservices?",
        "option_a": "They do not scale horizontally across cloud clusters.",
        "option_b": "They eliminate the need for containerization tools.",
        "option_c": "They trade operational simplicity for distributed complexity and consistency challenges.",
        "option_d": "They are inferior to legacy monolithic codebases.",
        "correct_option": "C",
        "explanation": "The author highlights that while microservices give scalability, they introduce operational complexity concerning communication latency and eventual consistency."
    },
    {
        "category": "verbal",
        "subtopic": "Verbal Analogies",
        "difficulty": "Easy",
        "question_text": "Complete the analogy:\n'COMPILER : CODE :: TRANSLATOR : ?'",
        "option_a": "Processor",
        "option_b": "Language",
        "option_c": "Memory",
        "option_d": "Algorithm",
        "correct_option": "B",
        "explanation": "A compiler converts programming code from one form to another; a translator converts spoken/written language from one form to another."
    }
]

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            plan TEXT DEFAULT 'Pro',
            credits INTEGER DEFAULT 250,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 2. Aptitude Questions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS aptitude_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            subtopic TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            question_text TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_option TEXT NOT NULL,
            explanation TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 3. Aptitude Test Results table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS aptitude_test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            category TEXT NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            incorrect_answers INTEGER NOT NULL,
            unattempted INTEGER NOT NULL,
            score_percentage REAL NOT NULL,
            time_taken_seconds INTEGER NOT NULL,
            answers_json TEXT NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Check if questions need seeding
    cursor.execute("SELECT COUNT(*) as count FROM aptitude_questions")
    count = cursor.fetchone()["count"]
    if count == 0:
        for q in SEED_QUESTIONS:
            cursor.execute("""
                INSERT INTO aptitude_questions 
                (category, subtopic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                q["category"],
                q["subtopic"],
                q["difficulty"],
                q["question_text"],
                q["option_a"],
                q["option_b"],
                q["option_c"],
                q["option_d"],
                q["correct_option"],
                q["explanation"]
            ))
            
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully with aptitude tables & seed questions.")
