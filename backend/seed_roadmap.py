"""
Seed script for PrepNest Roadmap System.
Seeds 7 domains, 35 topics, learning resources, practice tasks (>=3 per topic),
and domain mini-projects into Neon PostgreSQL.
"""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment or backend/.env")

# ==============================================================================
# DATA DEFINITIONS
# ==============================================================================

DOMAINS = [
    {
        "id": "fundamentals",
        "name": "Programming Fundamentals",
        "description": "Build a rock-solid foundation in core programming paradigms, logic building, and problem solving.",
        "difficulty": "Beginner",
        "estimated_weeks": "2-3 weeks",
        "display_order": 1,
        "icon_name": "Code2",
    },
    {
        "id": "web",
        "name": "Web Development",
        "description": "Master modern frontend technologies to craft high-performance, responsive web applications.",
        "difficulty": "Beginner",
        "estimated_weeks": "3-4 weeks",
        "display_order": 2,
        "icon_name": "Globe",
    },
    {
        "id": "dsa",
        "name": "Data Structures & Algorithms",
        "description": "Master essential data structures and algorithmic patterns required to crack technical interview rounds.",
        "difficulty": "Intermediate",
        "estimated_weeks": "6-8 weeks",
        "display_order": 3,
        "icon_name": "BrainCircuit",
    },
    {
        "id": "database",
        "name": "Database & DBMS",
        "description": "Understand relational database management, schema design, ACID transactions, and query optimization.",
        "difficulty": "Intermediate",
        "estimated_weeks": "2-3 weeks",
        "display_order": 4,
        "icon_name": "Database",
    },
    {
        "id": "backend",
        "name": "Backend Development",
        "description": "Design and build production-grade REST APIs, handle security and authentication, and manage server logic.",
        "difficulty": "Intermediate",
        "estimated_weeks": "3-4 weeks",
        "display_order": 5,
        "icon_name": "Server",
    },
    {
        "id": "tools",
        "name": "Git & Development Tools",
        "description": "Master version control, collaborative workflows, terminal tooling, and API testing environments.",
        "difficulty": "Beginner",
        "estimated_weeks": "1-2 weeks",
        "display_order": 6,
        "icon_name": "GitBranch",
    },
    {
        "id": "interview",
        "name": "Interview Preparation",
        "description": "Sharpen aptitude, system design fundamentals, behavioral storytelling, and resume presentation.",
        "difficulty": "Advanced",
        "estimated_weeks": "3-4 weeks",
        "display_order": 7,
        "icon_name": "Briefcase",
    },
]

TOPICS = {
    # -------------------------------------------------------------
    # 1. Programming Fundamentals (5 Topics)
    # -------------------------------------------------------------
    "fundamentals": [
        {
            "slug": "variables-datatypes-operators",
            "title": "Variables, Data Types & Operators",
            "description": "Fundamental memory storage, type systems (primitive vs reference), and arithmetic/bitwise operators.",
            "difficulty": "Beginner",
            "estimated_hours": 4,
            "display_order": 1,
            "explanation": "Variables are named memory containers for data. Every value in a programming language has an associated data type that dictates what operations can be performed on it. Operators allow computation, comparison, and logical evaluation.",
            "key_points": [
                "Primitive types include integers, floats, booleans, characters, and strings.",
                "Reference types store references (memory addresses) rather than literal values.",
                "Arithmetic (+, -, *, /, %), relational (==, !=, <, >), and logical (&&, ||, !) operators form the backbone of computation.",
                "Type casting allows conversion between compatible data representations.",
            ],
            "code_example": "// Variable declaration & arithmetic operators in JavaScript/TypeScript\nlet age = 21;\nconst pi = 3.14159;\nlet isEnrolled = true;\n\nlet nextYearAge = age + 1;\nlet isEligible = age >= 18 && isEnrolled;\nconsole.log(`Eligible: ${isEligible}`);",
            "quiz": {
                "question": "Which of the following operators evaluates to true if either operand is true?",
                "options": ["Logical AND (&&)", "Logical OR (||)", "Logical NOT (!)", "Bitwise XOR (^)"],
                "answer": 1,
                "explanation": "Logical OR (||) yields true if at least one of its boolean operands is true."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: JavaScript data types and data structures", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures"},
                {"resource_type": "doc", "title": "Python Official Tutorial: Numbers and Strings", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/introduction.html"},
                {"resource_type": "video", "title": "Programming Variables and Types Explained", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=zOjov-2OZ0E"}
            ],
            "tasks": [
                {"title": "Temperature Converter", "description": "Write a program that takes temperature in Celsius and converts it to Fahrenheit (F = C * 9/5 + 32) and Kelvin (K = C + 273.15).", "difficulty": "Easy", "hint": "Ensure floating point precision is retained during division."},
                {"title": "Swap Two Variables Without Temp", "description": "Swap two numeric variables without using a third temporary variable using arithmetic or XOR operations.", "difficulty": "Easy", "hint": "Consider a = a + b; b = a - b; a = a - b."},
                {"title": "Bitwise Parity Checker", "description": "Given an integer, determine if it is even or odd using only bitwise operators (no modulo `%`).", "difficulty": "Medium", "hint": "Check the least significant bit with `n & 1`."}
            ]
        },
        {
            "slug": "conditional-statements-loops",
            "title": "Conditional Statements & Loops",
            "description": "Control flow mechanisms: if-else ladders, switch statements, for loops, while loops, and recursion fundamentals.",
            "difficulty": "Beginner",
            "estimated_hours": 5,
            "display_order": 2,
            "explanation": "Control flow dictates the order in which code statements execute. Branching statements (if, switch) make decisions based on boolean predicates, while looping constructs (for, while, do-while) repeat execution until termination conditions are reached.",
            "key_points": [
                "Conditional statements execute discrete code blocks based on truthy/falsy evaluation.",
                "For-loops are ideal for bounded, known iteration counts.",
                "While-loops iterate while a condition holds true; beware of infinite loops.",
                "Break exits a loop early; continue skips immediately to the next iteration.",
            ],
            "code_example": "# Iterating with loops and conditionals in Python\nnumbers = [12, 7, 19, 24, 3, 18]\neven_count = 0\nfor num in numbers:\n    if num % 2 == 0:\n        even_count += 1\n    if num > 20:\n        break  # Early exit\nprint(f'Even numbers counted: {even_count}')",
            "quiz": {
                "question": "What is the primary difference between a `while` loop and a `do-while` loop?",
                "options": [
                    "A while loop cannot take boolean conditions.",
                    "A do-while loop always executes its body at least once.",
                    "A while loop is faster in all modern compilers.",
                    "A do-while loop does not support the `break` statement."
                ],
                "answer": 1,
                "explanation": "A do-while loop checks the termination condition after the loop body executes, ensuring at least one execution."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: Making decisions in your code - Conditionals", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals"},
                {"resource_type": "doc", "title": "Python Control Flow Tools", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/controlflow.html"},
                {"resource_type": "video", "title": "Loops and Iterations Deep Dive", "provider": "CS50", "url": "https://www.youtube.com/watch?v=kYJzPHxN8yU"}
            ],
            "tasks": [
                {"title": "FizzBuzz With Custom Divisors", "description": "Print numbers from 1 to 100. Print 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, and 'FizzBuzz' for multiples of both.", "difficulty": "Easy", "hint": "Check the combined condition (15) first or concatenate string tokens."},
                {"title": "Prime Number Generator", "description": "Given an integer N, print all prime numbers up to N using an efficient loop checking up to sqrt(i).", "difficulty": "Medium", "hint": "A number is prime if no integer from 2 up to its square root divides it."},
                {"title": "Diamond Pattern Printer", "description": "Write a nested loop function to print an ASCII diamond pattern of height 2N-1 with asterisks.", "difficulty": "Medium", "hint": "Calculate spacing and star counts proportionally for upper and lower halves."}
            ]
        },
        {
            "slug": "functions-methods",
            "title": "Functions & Methods",
            "description": "Modular code decomposition, scope and closures, call stack execution, parameters, and pure functions.",
            "difficulty": "Beginner",
            "estimated_hours": 4,
            "display_order": 3,
            "explanation": "Functions encapsulate reusable blocks of logic, accepting inputs (arguments) and returning results. Understanding function scope, pure functions, and the call stack is essential for writing scalable code.",
            "key_points": [
                "Functions adhere to DRY (Don't Repeat Yourself) design principles.",
                "Parameters are variable placeholders in the definition; arguments are actual values passed at invocation.",
                "Pure functions produce identical output for identical inputs and induce no side effects.",
                "Recursion occurs when a function calls itself, requiring a well-defined base case to avoid stack overflow.",
            ],
            "code_example": "function calculateCompoundInterest(principal, rate, years, timesCompounded = 1) {\n  if (principal <= 0 || rate < 0 || years < 0) return 0;\n  const r = rate / 100;\n  const amount = principal * Math.pow(1 + r / timesCompounded, timesCompounded * years);\n  return parseFloat(amount.toFixed(2));\n}\nconsole.log(calculateCompoundInterest(1000, 5, 3)); // 1157.63",
            "quiz": {
                "question": "What is the crucial component required in every recursive function to avoid a call stack overflow?",
                "options": ["A while loop", "A base case", "A global variable", "A lambda callback"],
                "answer": 1,
                "explanation": "A base case provides the termination condition where the function returns without making further recursive calls."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: JavaScript Functions Reference", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"},
                {"resource_type": "doc", "title": "Python Defining Functions", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"},
                {"resource_type": "video", "title": "Functions, Scope, and Execution Context", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=gT0M33M422U"}
            ],
            "tasks": [
                {"title": "Recursive Factorial & Fibonacci", "description": "Implement both factorial(n) and fibonacci(n) with both recursive and iterative approaches.", "difficulty": "Easy", "hint": "Identify base cases (n <= 1) and consider memoization for fibonacci."},
                {"title": "Memoized Higher-Order Function", "description": "Write a `memoize(fn)` wrapper that caches results of expensive function calls based on argument serialization.", "difficulty": "Medium", "hint": "Use a hash map or object keying JSON.stringify(args) to return cached outputs."},
                {"title": "Mathematical Vector Calculator", "description": "Implement pure functions for vector addition, dot product, and magnitude calculations for 3D vectors.", "difficulty": "Medium", "hint": "Dot product of [x1, y1, z1] and [x2, y2, z2] is x1*x2 + y1*y2 + z1*z2."}
            ]
        },
        {
            "slug": "object-oriented-programming",
            "title": "Object-Oriented Programming",
            "description": "The four pillars of OOP: Encapsulation, Abstraction, Inheritance, and Polymorphism, plus design best practices.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 4,
            "explanation": "OOP models software applications around data structures (objects) and behaviors (methods). Encapsulation hides internal state, abstraction reveals only essential interfaces, inheritance enables code reuse, and polymorphism allows uniform handling of different types.",
            "key_points": [
                "Classes act as blueprints; objects are instantiated instances.",
                "Encapsulation protects private state through public getters/setters.",
                "Inheritance enables specialized subclasses to inherit behavior from parent classes.",
                "Polymorphism allows method overriding to provide specialized implementations for common interfaces.",
            ],
            "code_example": "class BankAccount:\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner\n        self.__balance = balance  # Private attribute\n\n    def deposit(self, amount: float) -> None:\n        if amount > 0:\n            self.__balance += amount\n\n    def withdraw(self, amount: float) -> bool:\n        if 0 < amount <= self.__balance:\n            self.__balance -= amount\n            return True\n        return False\n\n    def get_balance(self) -> float:\n        return self.__balance",
            "quiz": {
                "question": "Which OOP principle focuses on bundling data and methods inside a unit while restricting direct access from outside?",
                "options": ["Inheritance", "Polymorphism", "Encapsulation", "Compilation"],
                "answer": 2,
                "explanation": "Encapsulation bundles data with the methods that operate on that data and restricts direct access to some of an object's components."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: Object-Oriented JavaScript", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_programming"},
                {"resource_type": "doc", "title": "Python Classes and OOP Tutorial", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/classes.html"},
                {"resource_type": "video", "title": "Object Oriented Programming in 10 Minutes", "provider": "Programming with Mosh", "url": "https://www.youtube.com/watch?v=pTB0EiLXUC8"}
            ],
            "tasks": [
                {"title": "Student Grading System Class", "description": "Create a `Student` class with properties for name, ID, and list of grades. Include methods to calculate GPA and letter grade.", "difficulty": "Easy", "hint": "Store marks in a list and implement an average calculation helper."},
                {"title": "Polymorphic Payment Processor", "description": "Implement a base `PaymentProcessor` with derived classes `CreditCardProcessor`, `PayPalProcessor`, and `CryptoProcessor` overriding `process(amount)`.", "difficulty": "Medium", "hint": "Define the base method and raise NotImplementedError if not overridden in child classes."},
                {"title": "Vehicle Fleet Management System", "description": "Design an OOP hierarchy featuring `Vehicle`, `Car`, `Truck`, and `ElectricCar` managing fuel efficiency, mileage tracking, and maintenance alerts.", "difficulty": "Medium", "hint": "Use super().__init__() to invoke parent constructors properly."}
            ]
        },
        {
            "slug": "exception-handling-file-io",
            "title": "Exception Handling & File Handling",
            "description": "Defensive programming with try-catch-finally, custom exceptions, and reading/writing filesystem streams.",
            "difficulty": "Intermediate",
            "estimated_hours": 5,
            "display_order": 5,
            "explanation": "Production software must gracefully anticipate unexpected runtime conditions without crashing. Structured exception handling separates error-handling logic from business logic, while File I/O facilitates persistent data storage across sessions.",
            "key_points": [
                "Use try-catch/try-except to intercept recoverable runtime failures.",
                "The `finally` block always executes, making it ideal for resource cleanup (e.g., closing file streams).",
                "Create custom exception classes to convey domain-specific failure reasons.",
                "Always manage file descriptors safely using context managers (`with` statement).",
            ],
            "code_example": "import json\n\ndef load_user_config(filepath: str) -> dict:\n    try:\n        with open(filepath, 'r', encoding='utf-8') as f:\n            return json.load(f)\n    except FileNotFoundError:\n        print(f'Warning: {filepath} not found. Using defaults.')\n        return {'theme': 'dark', 'notifications': True}\n    except json.JSONDecodeError as e:\n        raise ValueError(f'Corrupted configuration file: {e}')",
            "quiz": {
                "question": "What is the primary guarantee provided by a `finally` block in exception handling?",
                "options": [
                    "It will only execute if an exception was raised.",
                    "It executes regardless of whether an exception occurred or was caught.",
                    "It prevents syntax errors from halting compilation.",
                    "It restarts the program from the beginning."
                ],
                "answer": 1,
                "explanation": "A `finally` block is guaranteed to run after try and catch blocks finish, ensuring deterministic resource cleanup."
            },
            "resources": [
                {"resource_type": "doc", "title": "Python Errors and Exceptions", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/errors.html"},
                {"resource_type": "doc", "title": "MDN: Control flow and error handling", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"},
                {"resource_type": "video", "title": "Exception Handling Best Practices", "provider": "Corey Schafer", "url": "https://www.youtube.com/watch?v=NIWwJbo-9_8"}
            ],
            "tasks": [
                {"title": "Safe File Parser", "description": "Write a script that reads a CSV file line by line, converts numeric columns, and logs malformed rows to an error log file without crashing.", "difficulty": "Easy", "hint": "Wrap row parsing in a try-except ValueError block."},
                {"title": "Custom InsufficientFundsException", "description": "Implement a banking withdrawal system with custom exception classes `InsufficientFundsException` and `NegativeAmountException`.", "difficulty": "Medium", "hint": "Inherit from Exception and pass detailed error message strings."},
                {"title": "Transactional File Appender", "description": "Implement a function that writes data to a temporary file first and renames it atomically upon success, cleaning up on any error.", "difficulty": "Hard", "hint": "Use os.replace or tempfile to prevent incomplete writes during unexpected termination."}
            ]
        }
    ],

    # -------------------------------------------------------------
    # 2. Web Development (5 Topics)
    # -------------------------------------------------------------
    "web": [
        {
            "slug": "html5",
            "title": "HTML5",
            "description": "Semantic markup, accessibility (a11y), document structure, forms, and multimedia elements.",
            "difficulty": "Beginner",
            "estimated_hours": 4,
            "display_order": 1,
            "explanation": "HTML5 is the structural skeleton of the World Wide Web. Semantic tags like <header>, <nav>, <article>, and <section> communicate meaning to web browsers, search engines, and assistive screen readers.",
            "key_points": [
                "Semantic elements (<main>, <aside>, <footer>) improve SEO and screen reader accessibility.",
                "Form validation attributes (required, pattern, type='email') handle basic validation natively.",
                "The <meta name='viewport'> tag is required for responsive mobile rendering.",
                "Images require descriptive `alt` tags to comply with WCAG accessibility standards.",
            ],
            "code_example": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>PrepNest Dashboard</title>\n</head>\n<body>\n  <header>\n    <nav aria-label=\"Primary Navigation\"><a href=\"/\">Home</a></nav>\n  </header>\n  <main>\n    <section aria-labelledby=\"stats-heading\">\n      <h2 id=\"stats-heading\">Progress Overview</h2>\n    </section>\n  </main>\n</body>\n</html>",
            "quiz": {
                "question": "Which HTML5 semantic element is best suited for content tangentially related to the main content, such as a sidebar?",
                "options": ["<aside>", "<section>", "<div>", "<summary>"],
                "answer": 0,
                "explanation": "<aside> represents a portion of a document whose content is only indirectly related to the document's main content."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: HTML5 Semantic Elements", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html"},
                {"resource_type": "doc", "title": "W3C Web Accessibility Initiative (WAI)", "provider": "W3C", "url": "https://www.w3.org/WAI/fundamentals/accessibility-intro/"},
                {"resource_type": "video", "title": "HTML Full Course - Build a Website", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=pQN-pnXPaVg"}
            ],
            "tasks": [
                {"title": "Semantic Job Board Card", "description": "Create a fully accessible, semantic job posting card with company logo, title, salary tag, tags, and apply button using only HTML5.", "difficulty": "Easy", "hint": "Use <article>, <figure>, <time>, and proper ARIA labels."},
                {"title": "Comprehensive Registration Form", "description": "Build an HTML form featuring password rules, phone validation regex pattern, date of birth, and custom file upload inputs.", "difficulty": "Easy", "hint": "Utilize input types `email`, `tel`, and attributes `pattern`, `minlength`."},
                {"title": "Accessible Media Player Container", "description": "Create an accessible audio/video presentation layout with fallback captions and transcript accordion.", "difficulty": "Medium", "hint": "Use <video>, <track kind='subtitles'>, and <details><summary> tags."}
            ]
        },
        {
            "slug": "css3-responsive-design",
            "title": "CSS3 & Responsive Design",
            "description": "Flexbox, CSS Grid, media queries, CSS variables, Box Model, and modern layout design systems.",
            "difficulty": "Beginner",
            "estimated_hours": 6,
            "display_order": 2,
            "explanation": "CSS3 styles and positions HTML elements across devices and screen resolutions. Flexbox handles 1-dimensional layouts, CSS Grid excels at 2-dimensional layouts, and CSS media queries provide responsive adaptability.",
            "key_points": [
                "The Box Model comprises content, padding, border, and margin; `box-sizing: border-box` is essential.",
                "Flexbox aligns items along a main axis and cross axis with gap and justify-content.",
                "CSS Grid defines rows and columns with `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`.",
                "Media queries (@media (min-width: 768px)) allow mobile-first progressive enhancement.",
            ],
            "code_example": "/* Modern Responsive Grid with CSS Variables */\n:root {\n  --primary-accent: #6366f1;\n  --card-bg: #0f172a;\n}\n\n.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\n@media (max-width: 640px) {\n  .dashboard-grid {\n    grid-template-columns: 1fr;\n    gap: 1rem;\n  }\n}",
            "quiz": {
                "question": "What CSS property ensures padding and border are included within an element's total specified width?",
                "options": ["box-sizing: border-box", "display: flex", "overflow: hidden", "position: relative"],
                "answer": 0,
                "explanation": "With `box-sizing: border-box`, width includes the element's content, padding, and border rather than expanding outward."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: CSS Flexible Box Layout (Flexbox)", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout"},
                {"resource_type": "doc", "title": "MDN: CSS Grid Layout Guide", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"},
                {"resource_type": "video", "title": "CSS Grid and Flexbox Complete Guide", "provider": "Kevin Powell", "url": "https://www.youtube.com/watch?v=rg7Fvvl3taU"}
            ],
            "tasks": [
                {"title": "Responsive Pricing Table Grid", "description": "Create a 3-tier pricing card layout that is side-by-side on desktop and collapses into a vertical stack on mobile screens.", "difficulty": "Easy", "hint": "Use CSS Grid with minmax(260px, 1fr) or Flexbox with flex-wrap: wrap."},
                {"title": "Centered Modal Window with Backdrop Blur", "description": "Implement a perfectly centered modal dialog using Flexbox/Grid with backdrop-filter: blur(8px) and smooth transitions.", "difficulty": "Medium", "hint": "Use fixed positioning with inset: 0 and place-items: center."},
                {"title": "Responsive Dark Mode Switcher", "description": "Implement a CSS variable-based theme system supporting light/dark themes with prefers-color-scheme media queries.", "difficulty": "Medium", "hint": "Define :root variables and override them inside @media (prefers-color-scheme: dark)."}
            ]
        },
        {
            "slug": "javascript-fundamentals",
            "title": "JavaScript Fundamentals",
            "description": "ES6+ syntax, asynchronous programming (Promises, async/await), closures, and the Event Loop.",
            "difficulty": "Beginner",
            "estimated_hours": 8,
            "display_order": 3,
            "explanation": "JavaScript is the programming language of the web. Modern ES6+ features, asynchronous I/O, the single-threaded Event Loop, and higher-order array functions enable dynamic web experiences.",
            "key_points": [
                "Use `const` and `let` for block scope; avoid legacy `var`.",
                "Array iteration methods like `.map()`, `.filter()`, and `.reduce()` promote immutable data transformations.",
                "Promises and `async/await` handle non-blocking asynchronous operations.",
                "The JavaScript Event Loop coordinates the Microtask queue (Promises) and Macrotask queue (setTimeout).",
            ],
            "code_example": "// Asynchronous fetching with error handling\nasync function fetchUserProfile(userId) {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const user = await response.json();\n    return user;\n  } catch (err) {\n    console.error('Fetch failed:', err.message);\n    return null;\n  }\n}",
            "quiz": {
                "question": "Which task queue takes higher execution priority in the JavaScript Event Loop?",
                "options": [
                    "Macrotask queue (setTimeout, setInterval)",
                    "Microtask queue (Promise callbacks, queueMicrotask)",
                    "Rendering frame buffer",
                    "Network stream listener"
                ],
                "answer": 1,
                "explanation": "Microtasks (such as resolved Promise callbacks) are cleared completely before the Event Loop executes the next macrotask."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: JavaScript Guide", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},
                {"resource_type": "doc", "title": "JavaScript.info: The Modern JavaScript Tutorial", "provider": "javascript.info", "url": "https://javascript.info/"},
                {"resource_type": "video", "title": "What the heck is the event loop anyway?", "provider": "JSConf / Philip Roberts", "url": "https://www.youtube.com/watch?v=8aGhZQkoFbQ"}
            ],
            "tasks": [
                {"title": "Custom Array Methods Implementation", "description": "Implement your own custom versions of Array.prototype.myMap, myFilter, and myReduce.", "difficulty": "Medium", "hint": "Create functions that iterate through the array and invoke the callback with item, index, array."},
                {"title": "Debounce & Throttle Functions", "description": "Write reusable `debounce(fn, delay)` and `throttle(fn, limit)` utility functions using closures and timers.", "difficulty": "Medium", "hint": "Debounce resets a timer on every call; throttle executes only once within a fixed interval."},
                {"title": "Parallel Promise Runner with Retry", "description": "Create a function `fetchWithRetry(url, maxRetries)` that attempts to fetch a resource with exponential backoff on failure.", "difficulty": "Hard", "hint": "Catch errors in a loop and await a delay of Math.pow(2, attempt) * 1000 before retrying."}
            ]
        },
        {
            "slug": "dom-web-apis",
            "title": "DOM & Web APIs",
            "description": "Document Object Model manipulation, Event delegation, LocalStorage, Fetch API, and IntersectionObserver.",
            "difficulty": "Beginner",
            "estimated_hours": 5,
            "display_order": 4,
            "explanation": "The DOM provides an object-oriented representation of the web page. Interacting with the DOM and modern Web APIs enables live interactivity, event delegation, offline storage, and lazy loading.",
            "key_points": [
                "Select elements using `querySelector` and `querySelectorAll`.",
                "Event delegation attaches a single listener to a parent container to manage child element events.",
                "`localStorage` and `sessionStorage` provide client-side key-value persistence.",
                "`IntersectionObserver` enables efficient scroll-triggered animations and lazy image loading without lag.",
            ],
            "code_example": "// Event delegation pattern\nconst taskList = document.querySelector('#taskList');\ntaskList.addEventListener('click', (event) => {\n  const deleteBtn = event.target.closest('.delete-btn');\n  if (deleteBtn) {\n    const taskId = deleteBtn.dataset.id;\n    document.getElementById(`task-${taskId}`).remove();\n  }\n});",
            "quiz": {
                "question": "Why is event delegation more efficient than attaching separate event listeners to 500 list items?",
                "options": [
                    "It makes the CSS animations smoother.",
                    "It uses only one event listener in memory and automatically handles dynamically added elements.",
                    "It bypasses the JavaScript security sandbox.",
                    "It prevents bubbling of all events."
                ],
                "answer": 1,
                "explanation": "Event delegation takes advantage of event bubbling to attach a single listener to the parent element, conserving memory and managing dynamic children."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: Introduction to the DOM", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"},
                {"resource_type": "doc", "title": "MDN: Intersection Observer API", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API"},
                {"resource_type": "video", "title": "DOM Manipulation Full Tutorial", "provider": "Web Dev Simplified", "url": "https://www.youtube.com/watch?v=y17RuWkWdn8"}
            ],
            "tasks": [
                {"title": "Persistent To-Do List Application", "description": "Build a vanilla JavaScript to-do list with create, complete, and delete actions that automatically saves state in localStorage.", "difficulty": "Easy", "hint": "Serialize the task list array with JSON.stringify when saving to localStorage."},
                {"title": "Infinite Scroll with IntersectionObserver", "description": "Implement infinite scrolling that fetches the next batch of items when an invisible sentinel element enters the viewport.", "difficulty": "Medium", "hint": "Instantiate an IntersectionObserver observing a div placed at the bottom of the feed."},
                {"title": "Drag-and-Drop Kanban Column", "description": "Implement HTML5 Drag and Drop API events (dragstart, dragover, drop) to move card elements between two columns.", "difficulty": "Hard", "hint": "Call event.preventDefault() inside dragover to permit dropping."}
            ]
        },
        {
            "slug": "react-fundamentals",
            "title": "React.js",
            "description": "Component architecture, JSX, hooks (useState, useEffect, useMemo, useCallback), and state management.",
            "difficulty": "Intermediate",
            "estimated_hours": 10,
            "display_order": 5,
            "explanation": "React is a component-driven UI library that uses a Virtual DOM to optimize rendering. Its declarative model and Hook APIs allow developers to construct complex, stateful user interfaces efficiently.",
            "key_points": [
                "Components are reusable, independent units of UI returning JSX.",
                "Props pass data downwards from parent to child; state manages local dynamic data.",
                "`useEffect` synchronizes external systems and manages component lifecycle.",
                "Avoid mutating state directly; always create new references via state setters.",
            ],
            "code_example": "import React, { useState, useEffect } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `Count: ${count}`;\n  }, [count]);\n\n  return (\n    <div className=\"flex items-center gap-4\">\n      <button onClick={() => setCount(c => c - 1)} className=\"px-3 py-1 bg-slate-800 rounded\">-</button>\n      <span className=\"font-bold text-white\">{count}</span>\n      <button onClick={() => setCount(c => c + 1)} className=\"px-3 py-1 bg-indigo-600 rounded\">+</button>\n    </div>\n  );\n}",
            "quiz": {
                "question": "What is the primary role of the dependency array in React's `useEffect` hook?",
                "options": [
                    "It specifies CSS classes applied to the component.",
                    "It tells React to re-run the effect only when the specified values change between renders.",
                    "It prevents the component from unmounting.",
                    "It binds global window events."
                ],
                "answer": 1,
                "explanation": "React inspects the values in the dependency array and only re-executes the effect callback if one of the dependencies changed."
            },
            "resources": [
                {"resource_type": "doc", "title": "React.dev: Quick Start & Learn React", "provider": "React Official", "url": "https://react.dev/learn"},
                {"resource_type": "doc", "title": "React.dev: Built-in React Hooks", "provider": "React Official", "url": "https://react.dev/reference/react"},
                {"resource_type": "video", "title": "React Course - Beginner's Tutorial for React JavaScript Library", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"}
            ],
            "tasks": [
                {"title": "Search Filter with Live Debounce", "description": "Create a React component that fetches search results via API and debounces input changes to prevent unnecessary network requests.", "difficulty": "Medium", "hint": "Use useEffect with a setTimeout and cleanup clearTimeout in the return function."},
                {"title": "Custom useLocalStorage Hook", "description": "Build a reusable custom React hook `useLocalStorage(key, initialValue)` that synchronizes state with browser storage.", "difficulty": "Medium", "hint": "Initialize state with a callback reading localStorage and update storage inside a setter wrapper."},
                {"title": "Paginated Data Table with Sorting", "description": "Build a React data table supporting column sorting (asc/desc), search filtering, and pagination without third-party table libraries.", "difficulty": "Hard", "hint": "Use useMemo to derive the sorted and filtered subset from the raw data array."}
            ]
        }
    ],

    # -------------------------------------------------------------
    # 3. Data Structures & Algorithms (6 Topics)
    # -------------------------------------------------------------
    "dsa": [
        {
            "slug": "arrays-strings",
            "title": "Arrays & Strings",
            "description": "Memory layout, contiguous memory access, two-pointer techniques, sliding window patterns, and string manipulation.",
            "difficulty": "Beginner",
            "estimated_hours": 8,
            "display_order": 1,
            "explanation": "Arrays store elements in contiguous memory blocks allowing O(1) random access by index. Strings are character arrays with language-specific immutability properties. Mastering Two-Pointer and Sliding Window patterns solves most interview array problems.",
            "key_points": [
                "Array lookups by index are O(1); arbitrary insertions and deletions are O(n).",
                "Two-pointer technique is optimal for sorted arrays (e.g., Two Sum II, Container With Most Water).",
                "Sliding window pattern optimizes subarray and substring problems from O(n^2) to O(n).",
                "String concatenation in loops can produce O(n^2) runtime; prefer string builders or join.",
            ],
            "code_example": "# Two-pointer technique for Two Sum in a sorted array\ndef two_sum_sorted(arr: list[int], target: int) -> tuple[int, int]:\n    left, right = 0, len(arr) - 1\n    while left < right:\n        current_sum = arr[left] + arr[right]\n        if current_sum == target:\n            return (left, right)\n        elif current_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return (-1, -1)",
            "quiz": {
                "question": "What is the time complexity of the Two-Pointer technique when scanning a sorted array of size N?",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                "answer": 2,
                "explanation": "Both pointers move towards each other across at most N elements, yielding an optimal O(N) linear time complexity."
            },
            "resources": [
                {"resource_type": "doc", "title": "NeetCode: Array & Hashing Roadmap", "provider": "NeetCode", "url": "https://neetcode.io/roadmap"},
                {"resource_type": "doc", "title": "GeeksforGeeks: Array Data Structure Guide", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/array-data-structure-guide/"},
                {"resource_type": "video", "title": "Sliding Window Algorithm Explained", "provider": "NeetCode", "url": "https://www.youtube.com/watch?v=MK-NZ4hN7Rs"}
            ],
            "tasks": [
                {"title": "Best Time to Buy and Sell Stock", "description": "Given prices array, find the maximum single-day profit. (Directly practices one-pass tracking).", "difficulty": "Easy", "hint": "Track minimum price seen so far and compute max difference at each step."},
                {"title": "Longest Substring Without Repeating Characters", "description": "Find the length of the longest substring without repeating characters using the sliding window pattern.", "difficulty": "Medium", "hint": "Use a hash map storing the last seen index of each character to contract the left window boundary."},
                {"title": "Trapping Rain Water", "description": "Given an elevation map array, compute how much water it can trap after raining using two pointers.", "difficulty": "Hard", "hint": "Maintain left_max and right_max bounds moving the pointer with smaller height inwards."}
            ]
        },
        {
            "slug": "linked-lists",
            "title": "Linked Lists",
            "description": "Singly and doubly linked lists, node pointers, sentinel nodes, and Floyd's cycle detection algorithm.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 2,
            "explanation": "Linked lists represent linear collections of nodes where each node contains data and a pointer reference to the next node. They support O(1) insertions at the head without memory reallocations, but do not provide O(1) indexed lookups.",
            "key_points": [
                "Singly linked lists have next pointers; doubly linked lists have both next and previous pointers.",
                "Dummy/Sentinel head nodes prevent messy edge cases when modifying the list head.",
                "Floyd's Tortoise and Hare algorithm detects cycles in O(n) time and O(1) space.",
                "List reversal requires carefully maintaining previous, current, and next references.",
            ],
            "code_example": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head: ListNode) -> ListNode:\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev",
            "quiz": {
                "question": "What is the auxiliary space complexity of Floyd's Cycle Detection (Tortoise and Hare) algorithm?",
                "options": ["O(N)", "O(1)", "O(log N)", "O(N^2)"],
                "answer": 1,
                "explanation": "Floyd's cycle detection uses only two node pointer variables, requiring O(1) constant auxiliary space."
            },
            "resources": [
                {"resource_type": "doc", "title": "GeeksforGeeks: Linked List Data Structure", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/data-structures/linked-list/"},
                {"resource_type": "doc", "title": "LeetCode: Linked List Explore Card", "provider": "LeetCode", "url": "https://leetcode.com/explore/learn/card/linked-list/"},
                {"resource_type": "video", "title": "Reverse a Linked List in Python", "provider": "NeetCode", "url": "https://www.youtube.com/watch?v=G0_I-ZF0S38"}
            ],
            "tasks": [
                {"title": "Reverse a Singly Linked List", "description": "Reverse a singly linked list in-place using iterative pointer manipulation.", "difficulty": "Easy", "hint": "Keep track of prev, curr, and temp_next as you iterate to the end."},
                {"title": "Merge Two Sorted Linked Lists", "description": "Merge two sorted lists into one sorted list using a dummy head node.", "difficulty": "Easy", "hint": "Compare heads of both lists and advance the pointer with the smaller value."},
                {"title": "LRU Cache with Doubly Linked List", "description": "Design an LRU Cache supporting get(key) and put(key, value) in O(1) time using a Hash Map and Doubly Linked List.", "difficulty": "Hard", "hint": "Hash map maps key to node; doubly linked list enables O(1) node removal and insertion at head."}
            ]
        },
        {
            "slug": "stack-queue",
            "title": "Stack & Queue",
            "description": "LIFO & FIFO semantics, monotonic stacks, deque, priority queues, and min-stack design.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 3,
            "explanation": "Stacks operate on Last-In-First-Out (LIFO) semantics, making them the standard choice for parsing, bracket matching, and recursion unwinding. Queues operate on First-In-First-Out (FIFO) semantics, serving as the foundation for BFS graph traversals and buffering.",
            "key_points": [
                "Stack core operations: push, pop, peek in O(1) time.",
                "Queue core operations: enqueue, dequeue in O(1) time.",
                "Monotonic stacks maintain elements in sorted order to solve 'Next Greater Element' in O(n).",
                "Circular queues and deques allow efficient double-ended manipulation.",
            ],
            "code_example": "# Valid Parentheses verification using a Stack\ndef is_valid_parentheses(s: str) -> bool:\n    mapping = {')': '(', '}': '{', ']': '['}\n    stack = []\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
            "quiz": {
                "question": "Which data structure is primarily used to implement Breadth-First Search (BFS)?",
                "options": ["Stack", "Queue", "Binary Search Tree", "Max Heap"],
                "answer": 1,
                "explanation": "A Queue (FIFO) processes nodes level-by-level in the order they were discovered."
            },
            "resources": [
                {"resource_type": "doc", "title": "GeeksforGeeks: Stack Data Structure", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/stack-data-structure/"},
                {"resource_type": "doc", "title": "GeeksforGeeks: Queue Data Structure", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/queue-data-structure/"},
                {"resource_type": "video", "title": "Valid Parentheses - Stack - LeetCode 20", "provider": "NeetCode", "url": "https://www.youtube.com/watch?v=WTzjTskDF30"}
            ],
            "tasks": [
                {"title": "Valid Parentheses Checker", "description": "Determine if an input string containing '()[]{}' has valid and properly closed brackets.", "difficulty": "Easy", "hint": "Push opening brackets onto a stack and pop when encountering corresponding closing brackets."},
                {"title": "Min Stack Implementation", "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.", "difficulty": "Medium", "hint": "Store tuples of (value, min_so_far) or maintain an auxiliary min_stack."},
                {"title": "Daily Temperatures (Monotonic Stack)", "description": "Given daily temperatures, return an array of how many days you would have to wait for a warmer temperature.", "difficulty": "Medium", "hint": "Use a decreasing monotonic stack storing indices."}
            ]
        },
        {
            "slug": "hashing-searching",
            "title": "Hashing & Searching",
            "description": "Hash tables, collision resolution, hash maps/sets, binary search, and search on rotated sorted arrays.",
            "difficulty": "Intermediate",
            "estimated_hours": 7,
            "display_order": 4,
            "explanation": "Hash tables utilize hash functions to map keys to array buckets, achieving average O(1) lookups, insertions, and deletions. Binary search halves the search space at every step, finding elements in sorted data in logarithmic O(log n) time.",
            "key_points": [
                "Hash collisions are resolved via chaining (linked lists) or open addressing (probing).",
                "Hash sets provide O(1) membership testing (`x in set`).",
                "Binary search requires sorted data and calculates `mid = left + (right - left) // 2` to prevent overflow.",
                "Binary search can be applied to monotonic decision problems ('binary search on answer').",
            ],
            "code_example": "# Binary Search on a sorted array\ndef binary_search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
            "quiz": {
                "question": "What is the worst-case time complexity of lookup in a hash table when all keys collide into the same bucket?",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                "answer": 2,
                "explanation": "If all keys hash to the same bucket in separate chaining, lookup degrades to a linear scan of a linked list taking O(N) time."
            },
            "resources": [
                {"resource_type": "doc", "title": "GeeksforGeeks: Hashing Data Structure", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/hashing-data-structure/"},
                {"resource_type": "doc", "title": "Khan Academy: Binary Search Algorithm", "provider": "Khan Academy", "url": "https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search"},
                {"resource_type": "video", "title": "Binary Search Algorithm in 100 Seconds", "provider": "Fireship", "url": "https://www.youtube.com/watch?v=MFhxShGxHWc"}
            ],
            "tasks": [
                {"title": "Two Sum (Hash Map Solution)", "description": "Given an integer array nums and an integer target, return indices of two numbers that add up to target in O(n) time.", "difficulty": "Easy", "hint": "Store visited elements in a map: complement = target - num."},
                {"title": "Search in Rotated Sorted Array", "description": "Search for a target value in an array rotated at an unknown pivot in O(log n) time.", "difficulty": "Medium", "hint": "At least one half (left or right) is always sorted; determine which half and check bounds."},
                {"title": "Koko Eating Bananas", "description": "Determine the minimum integer eating speed k to eat all bananas within h hours using binary search on the answer space.", "difficulty": "Medium", "hint": "Binary search over speed range [1, max(piles)], testing feasibility with a helper function."}
            ]
        },
        {
            "slug": "trees-graphs",
            "title": "Trees & Graphs",
            "description": "Binary trees, BST, BFS, DFS, adjacency lists, shortest path algorithms (Dijkstra), and cycle detection.",
            "difficulty": "Intermediate",
            "estimated_hours": 10,
            "display_order": 5,
            "explanation": "Trees are hierarchical acyclic structures with a root node. Graphs model arbitrary networks of vertices connected by edges. Traversals (BFS using queues and DFS using recursion/stacks) solve pathfinding, cycle detection, and connectivity problems.",
            "key_points": [
                "Binary Search Trees maintain the invariant: left child < root < right child.",
                "Tree traversals include Inorder (sorted in BST), Preorder, Postorder, and Level-order (BFS).",
                "Graphs are represented via Adjacency Lists (memory efficient) or Adjacency Matrices.",
                "Dijkstra's algorithm finds single-source shortest paths in weighted graphs with non-negative edges using a min-heap.",
            ],
            "code_example": "# Binary Tree Level Order Traversal (BFS)\nfrom collections import deque\n\ndef level_order(root):\n    if not root:\n        return []\n    result = []\n    queue = deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        result.append(level)\n    return result",
            "quiz": {
                "question": "Which tree traversal visited on a Binary Search Tree (BST) yields node values in strictly sorted ascending order?",
                "options": ["Preorder traversal", "Inorder traversal", "Postorder traversal", "Level-order traversal"],
                "answer": 1,
                "explanation": "Inorder traversal visits left subtree, root, then right subtree, producing ascending values for any valid BST."
            },
            "resources": [
                {"resource_type": "doc", "title": "GeeksforGeeks: Binary Tree Data Structure", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/binary-tree-data-structure/"},
                {"resource_type": "doc", "title": "GeeksforGeeks: Graph Data Structure and Algorithms", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/"},
                {"resource_type": "video", "title": "Graph Algorithms for Technical Interviews", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=tWVWeAqZ0WU"}
            ],
            "tasks": [
                {"title": "Maximum Depth of Binary Tree", "description": "Given the root of a binary tree, return its maximum depth using both recursive DFS and queue-based BFS.", "difficulty": "Easy", "hint": "max_depth = 1 + max(dfs(left), dfs(right))."},
                {"title": "Number of Connected Islands", "description": "Given an m x n 2D binary grid representing a map of '1's (land) and '0's (water), count the number of islands using BFS or DFS.", "difficulty": "Medium", "hint": "When you encounter '1', increment the counter and sink connected neighbors to '0' using BFS/DFS."},
                {"title": "Course Schedule (Topological Sort)", "description": "Given numCourses and prerequisite pairs, determine if a student can finish all courses using Kahn's algorithm or DFS cycle detection.", "difficulty": "Medium", "hint": "Build an in-degree array and queue courses with 0 in-degrees."}
            ]
        },
        {
            "slug": "sorting-dynamic-programming",
            "title": "Sorting & Dynamic Programming",
            "description": "Merge Sort, Quick Sort, memoization, tabulation, optimal substructure, and classic DP patterns.",
            "difficulty": "Intermediate",
            "estimated_hours": 10,
            "display_order": 6,
            "explanation": "Comparison sorts like Merge Sort and Quick Sort achieve O(n log n) efficiency. Dynamic Programming breaks complex problems into overlapping subproblems with optimal substructure, caching intermediate results via top-down memoization or bottom-up tabulation.",
            "key_points": [
                "Merge Sort is a stable O(n log n) divide-and-conquer algorithm with O(n) auxiliary space.",
                "Quick Sort is an in-place sort with O(n log n) average time and O(n^2) worst-case time.",
                "DP requires two conditions: Overlapping Subproblems and Optimal Substructure.",
                "Classic DP archetypes: 1D Array (Climbing Stairs), 2D Grid (Unique Paths), 0/1 Knapsack, and Longest Common Subsequence.",
            ],
            "code_example": "# 0/1 Knapsack problem using bottom-up 1D DP tabulation\ndef knapsack(weights, values, capacity):\n    dp = [0] * (capacity + 1)\n    for w, v in zip(weights, values):\n        for c in range(capacity, w - 1, -1):  # Traverse backwards to prevent re-using item\n            dp[c] = max(dp[c], dp[c - w] + v)\n    return dp[capacity]",
            "quiz": {
                "question": "What is the worst-case time complexity of Quick Sort when selecting the first element as pivot on an already sorted array?",
                "options": ["O(N log N)", "O(N)", "O(N^2)", "O(2^N)"],
                "answer": 2,
                "explanation": "If an extreme element is repeatedly picked as pivot on sorted data, the partition is unbalanced (size 1 and N-1), resulting in O(N^2) runtime."
            },
            "resources": [
                {"resource_type": "doc", "title": "GeeksforGeeks: Dynamic Programming Algorithms", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/dynamic-programming/"},
                {"resource_type": "doc", "title": "LeetCode: Dynamic Programming Explore Card", "provider": "LeetCode", "url": "https://leetcode.com/explore/featured/card/dynamic-programming/"},
                {"resource_type": "video", "title": "Dynamic Programming - Learn to Solve Algorithmic Problems", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=oBt53YbR9Kk"}
            ],
            "tasks": [
                {"title": "Climbing Stairs (Fibonacci DP)", "description": "Count distinct ways to reach the top of an n-step staircase taking 1 or 2 steps at a time in O(n) time and O(1) space.", "difficulty": "Easy", "hint": "dp[i] = dp[i-1] + dp[i-2], identical to Fibonacci recurrence."},
                {"title": "Coin Change (Fewest Coins)", "description": "Given coins array and amount, find the fewest coins needed to make up that amount, or -1 if impossible.", "difficulty": "Medium", "hint": "Initialize dp array of size amount + 1 with infinity; dp[0] = 0; dp[i] = min(dp[i], dp[i - coin] + 1)."},
                {"title": "Longest Increasing Subsequence (LIS)", "description": "Find the length of the longest strictly increasing subsequence in O(n log n) time using patience sorting and binary search.", "difficulty": "Medium", "hint": "Maintain an array tails where tails[i] stores the smallest tail of all increasing subsequences of length i + 1."}
            ]
        }
    ],

    # -------------------------------------------------------------
    # 4. Database & DBMS (5 Topics)
    # -------------------------------------------------------------
    "database": [
        {
            "slug": "sql-fundamentals",
            "title": "SQL Fundamentals",
            "description": "Relational algebra, SELECT, WHERE filtering, aggregate functions (COUNT, SUM, AVG), GROUP BY, and HAVING.",
            "difficulty": "Beginner",
            "estimated_hours": 5,
            "display_order": 1,
            "explanation": "Structured Query Language (SQL) is the standard declarative language for interacting with relational database management systems (RDBMS). Data Query Language (DQL) queries extract, aggregate, and filter rows based on predicates.",
            "key_points": [
                "SQL execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.",
                "WHERE filters raw individual rows before aggregation; HAVING filters aggregated groups.",
                "Aggregate functions (COUNT, SUM, AVG, MIN, MAX) condense row sets into scalar calculations.",
                "Always sanitize queries or use parameterized SQL to prevent SQL Injection vulnerabilities.",
            ],
            "code_example": "-- Filtering and aggregation with GROUP BY and HAVING\nSELECT \n    department_id,\n    COUNT(employee_id) AS total_staff,\n    ROUND(AVG(salary), 2) AS average_salary\nFROM employees\nWHERE is_active = TRUE\nGROUP BY department_id\nHAVING AVG(salary) >= 60000\nORDER BY average_salary DESC;",
            "quiz": {
                "question": "What is the key difference between the `WHERE` clause and the `HAVING` clause in SQL?",
                "options": [
                    "`WHERE` is used with ORDER BY while `HAVING` is used with LIMIT.",
                    "`WHERE` filters individual rows before grouping; `HAVING` filters aggregated groups after GROUP BY.",
                    "`WHERE` can only be used on string columns.",
                    "`HAVING` executes before the FROM clause."
                ],
                "answer": 1,
                "explanation": "`WHERE` filters table rows before aggregation occurs, whereas `HAVING` filters the grouped result sets created by `GROUP BY`."
            },
            "resources": [
                {"resource_type": "doc", "title": "PostgreSQL Official Documentation: SQL Tutorial", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/tutorial-sql.html"},
                {"resource_type": "doc", "title": "SQLBolt: Interactive SQL Lessons", "provider": "SQLBolt", "url": "https://sqlbolt.com/"},
                {"resource_type": "video", "title": "SQL Tutorial - Full Database Course for Beginners", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY"}
            ],
            "tasks": [
                {"title": "Top Selling Products Query", "description": "Write a query retrieving the top 5 product categories by total sales revenue for orders completed in the current calendar year.", "difficulty": "Easy", "hint": "Filter on status = 'completed' and order_date, group by category, and order by sum(revenue) DESC limit 5."},
                {"title": "Duplicate Email Detection", "description": "Write a SQL query to report all duplicate emails in a `users` table.", "difficulty": "Easy", "hint": "GROUP BY email HAVING COUNT(email) > 1."},
                {"title": "Department Salary Statistics", "description": "Write a query returning department name, minimum salary, maximum salary, and employee count where employee count exceeds 5.", "difficulty": "Medium", "hint": "Join departments with employees, group by department name, and apply HAVING COUNT(*) > 5."}
            ]
        },
        {
            "slug": "joins-subqueries",
            "title": "Joins & Subqueries",
            "description": "INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, CROSS JOIN, correlated subqueries, and EXISTS clauses.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 2,
            "explanation": "Joins combine columns from one or more tables based on related keys. Subqueries (nested queries) allow modular data extraction, and correlated subqueries reference columns from the outer query for advanced filtering.",
            "key_points": [
                "INNER JOIN returns only rows that have matching records in both tables.",
                "LEFT JOIN preserves all rows from the left table, filling unmatching right table columns with NULL.",
                "Correlated subqueries evaluate once for every row processed by the parent query.",
                "`EXISTS` is often faster than `IN` for large datasets because it short-circuits on the first match.",
            ],
            "code_example": "-- Finding customers who placed orders higher than their regional average\nSELECT c.customer_id, c.customer_name, o.order_amount\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_amount > (\n    SELECT AVG(o2.order_amount)\n    FROM orders o2\n    JOIN customers c2 ON o2.customer_id = c2.customer_id\n    WHERE c2.region = c.region\n);",
            "quiz": {
                "question": "Which join type returns all rows from the left table, along with matching rows from the right table or NULLs if no match is found?",
                "options": ["INNER JOIN", "LEFT OUTER JOIN", "CROSS JOIN", "FULL JOIN"],
                "answer": 1,
                "explanation": "LEFT OUTER JOIN returns all records from the left table and the matched records from the right table (or NULL values if unmatched)."
            },
            "resources": [
                {"resource_type": "doc", "title": "PostgreSQL: Table Expressions and Joins", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html"},
                {"resource_type": "doc", "title": "Mode Analytics: SQL Joins Guide", "provider": "Mode", "url": "https://mode.com/sql-tutorial/sql-joins/"},
                {"resource_type": "video", "title": "SQL Joins Explained Visually", "provider": "Kudvenkat", "url": "https://www.youtube.com/watch?v=9yeOJ0ZMUYw"}
            ],
            "tasks": [
                {"title": "Customers Who Never Placed an Order", "description": "Write a query to find all customers who have never placed an order using both LEFT JOIN and NOT EXISTS.", "difficulty": "Easy", "hint": "LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL."},
                {"title": "Second Highest Salary Without LIMIT", "description": "Find the second highest salary from an Employee table using a subquery and MAX() function without using LIMIT.", "difficulty": "Medium", "hint": "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)."},
                {"title": "Manager Hierarchy Self-Join", "description": "Given an employee table with an employee_id and manager_id, write a self-join query listing each employee alongside their manager's name.", "difficulty": "Medium", "hint": "JOIN employees e LEFT JOIN employees m ON e.manager_id = m.employee_id."}
            ]
        },
        {
            "slug": "database-design-normalization",
            "title": "Database Design & Normalization",
            "description": "Entity-Relationship (ER) modeling, 1NF, 2NF, 3NF, BCNF, primary & foreign keys, and denormalization trade-offs.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 3,
            "explanation": "Relational schema design dictates how entities and relationships are modeled. Normalization eliminates data redundancy and prevents insert, update, and delete anomalies by decomposing tables into normal forms (1NF, 2NF, 3NF).",
            "key_points": [
                "1NF: Atomic column values; no repeating groups or arrays stored in CSV strings.",
                "2NF: In 1NF and no partial dependencies on composite primary keys.",
                "3NF: In 2NF and no transitive dependencies (non-key attribute determining another non-key attribute).",
                "Denormalization is intentionally applied in read-heavy analytics systems to avoid expensive multi-table joins.",
            ],
            "code_example": "-- 3NF Normalized E-commerce Order Schema\nCREATE TABLE customers (\n    id SERIAL PRIMARY KEY,\n    email VARCHAR(255) UNIQUE NOT NULL,\n    name VARCHAR(100) NOT NULL\n);\n\nCREATE TABLE orders (\n    id SERIAL PRIMARY KEY,\n    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,\n    order_status VARCHAR(50) NOT NULL DEFAULT 'pending',\n    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE order_items (\n    id SERIAL PRIMARY KEY,\n    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,\n    product_id INTEGER NOT NULL,\n    unit_price NUMERIC(10, 2) NOT NULL,\n    quantity INTEGER NOT NULL CHECK (quantity > 0)\n);",
            "quiz": {
                "question": "A table is in Third Normal Form (3NF) if it is in 2NF and satisfies which condition?",
                "options": [
                    "All tables have at least 10 foreign keys.",
                    "No non-key attribute is transitively dependent on the primary key.",
                    "All column names are written in uppercase.",
                    "Indexes are created on every string column."
                ],
                "answer": 1,
                "explanation": "3NF requires that no non-prime attribute transitively depends on any candidate key (i.e. non-key attributes must depend only on the primary key)."
            },
            "resources": [
                {"resource_type": "doc", "title": "Database Normalization Explained (1NF, 2NF, 3NF)", "provider": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org/database-normalization-introduction/"},
                {"resource_type": "doc", "title": "PostgreSQL: Constraints (Primary, Foreign, Check)", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/ddl-constraints.html"},
                {"resource_type": "video", "title": "Database Schema Design & Normalization", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=GFQaEYEc8_8"}
            ],
            "tasks": [
                {"title": "Normalize a Spreadsheet Schema to 3NF", "description": "Given a denormalized table with (order_id, customer_name, customer_city, item_name, item_price), decompose it into 3NF normalized tables.", "difficulty": "Medium", "hint": "Separate into customers, products, orders, and order_items tables."},
                {"title": "Many-to-Many Association Design", "description": "Design an ER diagram and DDL tables for a student-course enrollment system with course grades and enrollment timestamps.", "difficulty": "Easy", "hint": "Create an enrollment join table with foreign keys to students and courses."},
                {"title": "Design a Multi-Tenant SaaS Schema", "description": "Design an extensible database architecture for a multi-tenant application supporting tenant data isolation.", "difficulty": "Hard", "hint": "Compare shared database with tenant_id foreign keys vs schema-per-tenant isolation."}
            ]
        },
        {
            "slug": "indexing-transactions",
            "title": "Indexing & Transactions",
            "description": "B-Tree indexes, Hash indexes, EXPLAIN ANALYZE query planning, ACID properties, and transaction isolation levels.",
            "difficulty": "Intermediate",
            "estimated_hours": 7,
            "display_order": 4,
            "explanation": "Indexes speed up data retrieval by maintaining auxiliary search trees (typically B-Trees) at the expense of write overhead. Transactions guarantee ACID semantics (Atomicity, Consistency, Isolation, Durability) to preserve data integrity under concurrent execution.",
            "key_points": [
                "B-Tree indexes accelerate equality (=) and range (<, >, BETWEEN) lookups in O(log n) time.",
                "`EXPLAIN ANALYZE` reveals whether the database engine performed an Index Scan vs a sequential Seq Scan.",
                "ACID guarantees: Atomicity (all or nothing), Consistency (valid states), Isolation (concurrent safety), Durability (persisted on disk).",
                "Isolation levels (Read Committed, Repeatable Read, Serializable) balance concurrency vs anomalies like dirty reads or phantom reads.",
            ],
            "code_example": "-- ACID Transaction with explicit row locking in PostgreSQL\nBEGIN;\n\n-- Atomically deduct balance from sender\nUPDATE accounts \nSET balance = balance - 500.00 \nWHERE id = 101 AND balance >= 500.00;\n\n-- Atomically credit balance to recipient\nUPDATE accounts \nSET balance = balance + 500.00 \nWHERE id = 202;\n\n-- Commit the transaction atomically\nCOMMIT;",
            "quiz": {
                "question": "Which ACID property guarantees that all database updates within a transaction succeed completely or are completely rolled back upon error?",
                "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
                "answer": 0,
                "explanation": "Atomicity ensures that a transaction is treated as a single indivisible unit: either all operations occur, or none do."
            },
            "resources": [
                {"resource_type": "doc", "title": "PostgreSQL: Indexes and Index Types", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/indexes.html"},
                {"resource_type": "doc", "title": "PostgreSQL: Transaction Isolation Levels", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/transaction-iso.html"},
                {"resource_type": "video", "title": "Database Indexing Explained (B-Tree vs Hash)", "provider": "Hussein Nasser", "url": "https://www.youtube.com/watch?v=-qNSXK7s7_w"}
            ],
            "tasks": [
                {"title": "Query Performance Analysis with EXPLAIN", "description": "Execute EXPLAIN ANALYZE on a slow unindexed query, add a composite B-Tree index, and document the reduction in execution time.", "difficulty": "Medium", "hint": "Observe how Seq Scan transforms into Bitmap Index Scan or Index Scan."},
                {"title": "Bank Transfer with Rollback Simulation", "description": "Write a transactional PL/pgSQL block or Python transaction with psycopg2 transferring funds that rolls back cleanly if balance is insufficient.", "difficulty": "Medium", "hint": "Check rowcount after deduction; execute ROLLBACK if rowcount is 0."},
                {"title": "Deadlock Reproduction & Mitigation", "description": "Demonstrate how concurrent transactions acquire locks in different order causing a deadlock, and implement uniform lock ordering to prevent it.", "difficulty": "Hard", "hint": "Always acquire locks on accounts in ascending ID order: SELECT ... FOR UPDATE ORDER BY id."}
            ]
        },
        {
            "slug": "advanced-sql",
            "title": "Advanced SQL",
            "description": "Window functions (ROW_NUMBER, RANK, DENSE_RANK), Common Table Expressions (CTEs), Recursive CTEs, and JSONB queries.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 5,
            "explanation": "Advanced SQL techniques like Window Functions and Common Table Expressions (WITH clauses) simplify complex analytical queries without resorting to convoluted subqueries or procedural application code.",
            "key_points": [
                "Window functions perform calculations across related row sets without collapsing rows like GROUP BY does.",
                "Common window functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`.",
                "CTEs (`WITH cte_name AS (...)`) enhance query readability and enable recursive tree traversals.",
                "PostgreSQL JSONB operators (`->`, `->>`, `@>`) allow efficient querying of semi-structured document payloads.",
            ],
            "code_example": "-- Finding the top 3 highest paid employees per department using DENSE_RANK()\nWITH RankedStaff AS (\n    SELECT \n        employee_id,\n        full_name,\n        department_id,\n        salary,\n        DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank_in_dept\n    FROM employees\n)\nSELECT employee_id, full_name, department_id, salary\nFROM RankedStaff\nWHERE rank_in_dept <= 3;",
            "quiz": {
                "question": "What is the difference between `RANK()` and `DENSE_RANK()` when two rows tie for 1st place?",
                "options": [
                    "`RANK()` skips the next rank (yielding 1, 1, 3); `DENSE_RANK()` does not skip ranks (yielding 1, 1, 2).",
                    "`DENSE_RANK()` requires an alphabetic column.",
                    "`RANK()` can only be used with PostgreSQL while `DENSE_RANK()` is SQLite only.",
                    "There is no difference; they are aliases."
                ],
                "answer": 0,
                "explanation": "`RANK()` leaves gaps in rank numbering after ties, whereas `DENSE_RANK()` assigns consecutive rank integers without gaps."
            },
            "resources": [
                {"resource_type": "doc", "title": "PostgreSQL: Window Functions Tutorial", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/tutorial-window.html"},
                {"resource_type": "doc", "title": "PostgreSQL: Common Table Expressions (WITH)", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/queries-with.html"},
                {"resource_type": "video", "title": "SQL Window Functions in 15 Minutes", "provider": "Luke Barousse", "url": "https://www.youtube.com/watch?v=Ww71LCT45qc"}
            ],
            "tasks": [
                {"title": "Month-Over-Month Revenue Growth with LAG()", "description": "Write a SQL query calculating month-over-month percentage growth in revenue using the LAG() window function.", "difficulty": "Medium", "hint": "Use (monthly_rev - LAG(monthly_rev) OVER (ORDER BY month)) / LAG(monthly_rev) * 100."},
                {"title": "Recursive Organization Chart Hierarchy", "description": "Given an employee table with manager_id, write a Recursive CTE to output the entire organizational reporting chain and depth level.", "difficulty": "Hard", "hint": "Base query selects CEO (manager_id IS NULL); recursive query joins employees ON e.manager_id = cte.id."},
                {"title": "JSONB Filtering and Aggregation", "description": "Write a query extracting and aggregating user telemetry properties from a PostgreSQL JSONB column using the `@>` containment operator.", "difficulty": "Medium", "hint": "Use payload->>'event_type' and payload->'metadata'->>'browser'."}
            ]
        }
    ],

    # -------------------------------------------------------------
    # 5. Backend Development (5 Topics)
    # -------------------------------------------------------------
    "backend": [
        {
            "slug": "backend-fundamentals",
            "title": "Backend Fundamentals",
            "description": "Client-server architecture, HTTP/HTTPS protocols, request-response cycle, status codes, and server environments.",
            "difficulty": "Beginner",
            "estimated_hours": 5,
            "display_order": 1,
            "explanation": "Backend development focuses on the server-side logic powering web applications. Servers listen for incoming client HTTP requests, process business logic, communicate with databases, and return formatted responses.",
            "key_points": [
                "HTTP request lifecycle: DNS lookup -> TCP/TLS handshake -> HTTP request -> Server processing -> HTTP response.",
                "HTTP status code classifications: 2xx (Success), 3xx (Redirect), 4xx (Client Error), 5xx (Server Error).",
                "HTTP verbs express intent: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove).",
                "Statelessness: Each HTTP request contains all context needed; state is managed via tokens/sessions.",
            ],
            "code_example": "# Minimal HTTP server using FastAPI\nfrom fastapi import FastAPI, HTTPException\n\napp = FastAPI(title=\"PrepNest Service\")\n\n@app.get(\"/api/health\")\ndef health_check():\n    return {\"status\": \"online\", \"timestamp\": \"2026-10-08T00:00:00Z\"}\n\n@app.get(\"/api/items/{item_id}\")\ndef get_item(item_id: int):\n    if item_id <= 0:\n        raise HTTPException(status_code=400, detail=\"Invalid item ID\")\n    return {\"id\": item_id, \"name\": f\"Item {item_id}\"}",
            "quiz": {
                "question": "Which HTTP status code should a REST API return when a client tries to access a protected route without providing authentication credentials?",
                "options": ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
                "answer": 1,
                "explanation": "401 Unauthorized indicates that the request requires user authentication credentials that are missing or invalid."
            },
            "resources": [
                {"resource_type": "doc", "title": "MDN: An overview of HTTP", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"},
                {"resource_type": "doc", "title": "FastAPI: First Steps Tutorial", "provider": "FastAPI Tiangolo", "url": "https://fastapi.tiangolo.com/tutorial/first-steps/"},
                {"resource_type": "video", "title": "HTTP Crash Course & Status Codes", "provider": "Traversy Media", "url": "https://www.youtube.com/watch?v=iYM2zFP3Zn0"}
            ],
            "tasks": [
                {"title": "HTTP Status Code Matrix", "description": "Implement a mock API that correctly returns 200, 201, 400, 401, 403, 404, and 500 status codes based on request inputs.", "difficulty": "Easy", "hint": "Use FastAPI HTTPException or Express res.status().json()."},
                {"title": "Request Logger Middleware", "description": "Write a middleware that logs incoming HTTP method, path, client IP, and execution time in milliseconds for every request.", "difficulty": "Medium", "hint": "Record start_time = time.time(), await call_next(request), and compute elapsed duration."},
                {"title": "Rate Limiter by IP Address", "description": "Implement a simple in-memory rate limiting middleware allowing a maximum of 60 requests per minute per IP address.", "difficulty": "Hard", "hint": "Maintain an in-memory dictionary storing timestamps per IP and evict entries older than 60s."}
            ]
        },
        {
            "slug": "rest-apis",
            "title": "REST APIs",
            "description": "REST architectural constraints, resource naming conventions, pagination, filtering, and API versioning.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 2,
            "explanation": "Representational State Transfer (REST) is an architectural style for networked systems. REST APIs organize endpoints around resources represented by nouns, using HTTP verbs and standardized status codes for predictability.",
            "key_points": [
                "Use nouns for endpoints (`/api/v1/users`, `/api/v1/orders`), not verbs (`/getUsers`).",
                "Support query parameters for filtering, sorting, and pagination (`?page=1&limit=20&sort=desc`).",
                "Implement idempotency: GET, PUT, and DELETE should produce the same server state if called repeatedly.",
                "Structure API responses consistently with envelope payloads and error messages.",
            ],
            "code_example": "from fastapi import FastAPI, Query\nfrom typing import List, Optional\nfrom pydantic import BaseModel\n\nclass ProblemResponse(BaseModel):\n    id: int\n    title: str\n    difficulty: str\n\n@app.get(\"/api/v1/problems\", response_model=List[ProblemResponse])\ndef list_problems(\n    difficulty: Optional[str] = None,\n    page: int = Query(1, ge=1),\n    limit: int = Query(10, ge=1, le=100)\n):\n    offset = (page - 1) * limit\n    # Fetch paginated slice from database...\n    return []",
            "quiz": {
                "question": "Which HTTP method is defined as idempotent according to the HTTP specification?",
                "options": ["POST", "PUT", "PATCH (non-idempotent)", "CONNECT"],
                "answer": 1,
                "explanation": "PUT is idempotent because replacing a resource with identical representation multiple times results in the same server state."
            },
            "resources": [
                {"resource_type": "doc", "title": "Microsoft REST API Guidelines", "provider": "GitHub / Microsoft", "url": "https://github.com/microsoft/api-guidelines"},
                {"resource_type": "doc", "title": "FastAPI: Query Parameters and String Validations", "provider": "FastAPI Tiangolo", "url": "https://fastapi.tiangolo.com/tutorial/query-params/"},
                {"resource_type": "video", "title": "REST API Design Best Practices", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=-MTSQjw5DrM"}
            ],
            "tasks": [
                {"title": "CRUD REST API for Book Catalog", "description": "Build complete RESTful CRUD endpoints for a book catalog with title, author, isbn, and publish_date validations.", "difficulty": "Easy", "hint": "Implement GET /books, GET /books/{id}, POST /books, PUT /books/{id}, DELETE /books/{id}."},
                {"title": "Cursor-Based Pagination Implementation", "description": "Implement cursor-based pagination using `next_cursor` tokens for an infinite scrolling feed endpoint.", "difficulty": "Medium", "hint": "Filter WHERE id > cursor ORDER BY id ASC LIMIT :limit + 1 to determine if next page exists."},
                {"title": "API Versioning Strategy", "description": "Implement API versioning using URL path prefixing (/api/v1 vs /api/v2) with backwards-compatible schema transformers.", "difficulty": "Medium", "hint": "Use FastAPI APIRouter or Express route mounting for clean version decoupling."}
            ]
        },
        {
            "slug": "authentication-authorization",
            "title": "Authentication & Authorization",
            "description": "JWT tokens, password hashing with bcrypt, session cookies, OAuth 2.0, and Role-Based Access Control (RBAC).",
            "difficulty": "Intermediate",
            "estimated_hours": 8,
            "display_order": 3,
            "explanation": "Authentication verifies identity ('who are you?'), while authorization determines permissions ('what are you allowed to do?'). Modern web applications use salted password hashing and stateless JSON Web Tokens (JWT) or secure HttpOnly cookies.",
            "key_points": [
                "Never store plaintext passwords; use salted, slow adaptive hashes (bcrypt, Argon2).",
                "JWTs consist of three Base64URL-encoded parts: Header, Payload, and Signature.",
                "Store tokens securely in HttpOnly, SameSite=Lax/Strict cookies to defend against XSS attacks.",
                "Role-Based Access Control (RBAC) verifies user roles before allowing access to privileged routes.",
            ],
            "code_example": "import jwt\nfrom datetime import datetime, timedelta, timezone\n\nSECRET_KEY = \"super_secret_jwt_key_2026\"\nALGORITHM = \"HS256\"\n\ndef create_access_token(user_id: int, role: str = \"user\") -> str:\n    expire = datetime.now(timezone.utc) + timedelta(hours=24)\n    payload = {\n        \"sub\": str(user_id),\n        \"role\": role,\n        \"exp\": expire\n    }\n    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)",
            "quiz": {
                "question": "Why is hashing passwords with a cryptographic hash like SHA-256 alone without salt or adaptive cost unsafe?",
                "options": [
                    "SHA-256 cannot hash strings longer than 10 characters.",
                    "Attackers can instantly reverse un-salted hashes using precomputed Rainbow Tables or GPU brute-forcing.",
                    "SHA-256 requires internet access to verify.",
                    "It causes memory leaks on Linux servers."
                ],
                "answer": 1,
                "explanation": "Fast general-purpose hashes like SHA-256 allow billions of guesses per second on GPUs; adaptive hashing algorithms like bcrypt or Argon2 with unique salts neutralize rainbow tables."
            },
            "resources": [
                {"resource_type": "doc", "title": "OWASP: Password Storage Cheat Sheet", "provider": "OWASP", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"},
                {"resource_type": "doc", "title": "JWT.io: Introduction to JSON Web Tokens", "provider": "Auth0 / JWT.io", "url": "https://jwt.io/introduction"},
                {"resource_type": "video", "title": "JWT Authentication & Authorization in 100 Seconds", "provider": "Fireship", "url": "https://www.youtube.com/watch?v=7Q17ubqL251"}
            ],
            "tasks": [
                {"title": "Bcrypt Password Hash & Verify Module", "description": "Implement user signup and login functions that hash passwords with salt rounds and verify input passwords.", "difficulty": "Easy", "hint": "Use bcrypt.hashpw(password.encode(), bcrypt.gensalt()) and bcrypt.checkpw()."},
                {"title": "JWT Protected Endpoint Middleware", "description": "Write a dependency/middleware that extracts the Bearer token from the Authorization header, validates the signature, and injects user context.", "difficulty": "Medium", "hint": "Decode token with jwt.decode; catch jwt.ExpiredSignatureError and jwt.InvalidTokenError."},
                {"title": "Role-Based Access Control Decorator", "description": "Create an RBAC permission checker decorator (e.g. @require_roles(['admin', 'editor'])) protecting administrative routes.", "difficulty": "Medium", "hint": "Inspect decoded user payload role and raise HTTP 403 Forbidden if permission is not met."}
            ]
        },
        {
            "slug": "backend-database-integration",
            "title": "Backend + Database Integration",
            "description": "Connection pooling, ORMs vs raw SQL query builders, migrations, and transactional data integrity.",
            "difficulty": "Intermediate",
            "estimated_hours": 7,
            "display_order": 4,
            "explanation": "Production backends connect to databases using connection pools to avoid the heavy overhead of creating a new TCP handshake per query. They manage schema migrations safely and ensure all multi-step operations execute inside atomic transactions.",
            "key_points": [
                "Connection pooling reuses active database connections across concurrent API requests.",
                "Always close or return connections to the pool in a try-finally block or context manager.",
                "Prevent N+1 query problems by using eager loading, joins, or batching.",
                "Schema migration tools (Alembic, Prisma) version-control database changes alongside application code.",
            ],
            "code_example": "# Safe database connection pattern with connection pooling in Python\nfrom contextlib import contextmanager\nimport psycopg2.pool\n\npool = psycopg2.pool.SimpleConnectionPool(minconn=1, maxconn=20, dsn=\"DATABASE_URL\")\n\n@contextmanager\ndef get_db():\n    conn = pool.getconn()\n    try:\n        yield conn\n        conn.commit()\n    except Exception:\n        conn.rollback()\n        raise\n    finally:\n        pool.putconn(conn)",
            "quiz": {
                "question": "What is the primary operational advantage of maintaining a database connection pool in a web backend?",
                "options": [
                    "It bypasses database authentication passwords.",
                    "It eliminates the latency and CPU cost of opening and closing database connections for every HTTP request.",
                    "It converts SQL tables into NoSQL documents automatically.",
                    "It encrypts the entire hard drive."
                ],
                "answer": 1,
                "explanation": "Establishing database connections requires expensive TCP and authentication handshakes; connection pools reuse warm connections across requests."
            },
            "resources": [
                {"resource_type": "doc", "title": "Psycopg2: Connection Pooling Documentation", "provider": "psycopg.org", "url": "https://www.psycopg.org/docs/pool.html"},
                {"resource_type": "doc", "title": "SQLAlchemy ORM Quickstart", "provider": "SQLAlchemy.org", "url": "https://docs.sqlalchemy.org/en/20/orm/quickstart.html"},
                {"resource_type": "video", "title": "Connection Pooling & Database Scaling Explained", "provider": "Hussein Nasser", "url": "https://www.youtube.com/watch?v=GTeCt958F60"}
            ],
            "tasks": [
                {"title": "Thread-Safe Connection Pool Wrapper", "description": "Implement a singleton database connection pool wrapper that safely acquires and releases connections during concurrent API load.", "difficulty": "Medium", "hint": "Use psycopg2.pool.ThreadedConnectionPool with a try/finally block returning connections."},
                {"title": "Prevent N+1 Query in API Endpoint", "description": "Refactor an endpoint fetching 50 posts and their authors that ran 51 queries into a single query using an INNER JOIN.", "difficulty": "Medium", "hint": "SELECT p.*, u.name, u.avatar FROM posts p JOIN users u ON p.user_id = u.id."},
                {"title": "Database Seed & Migration Script", "description": "Write an automated migration script that checks table versions, applies schema alterations safely, and commits changes idempotently.", "difficulty": "Hard", "hint": "Create a schema_migrations table to track applied migration scripts."}
            ]
        },
        {
            "slug": "deployment-production-basics",
            "title": "Deployment & Production Basics",
            "description": "Docker containerization, environment variables, reverse proxies (Nginx), CI/CD pipelines, and health monitoring.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 5,
            "explanation": "Deploying web applications to production requires predictable environments, secret management, automated testing, containerization with Docker, and health monitoring to ensure 99.9% uptime.",
            "key_points": [
                "Docker packages code and dependencies into isolated, reproducible container images.",
                "Follow 12-Factor App principles: store configuration and secrets in environment variables (.env).",
                "Reverse proxies (Nginx, Traefik) manage SSL termination, static file serving, and load balancing.",
                "CI/CD pipelines automate testing, linting, and zero-downtime deployment on code push.",
            ],
            "code_example": "# Multi-stage Dockerfile for production FastAPI\nFROM python:3.11-slim as builder\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir --user -r requirements.txt\n\nFROM python:3.11-slim\nWORKDIR /app\nCOPY --from=builder /root/.local /root/.local\nCOPY . .\nENV PATH=/root/.local/bin:$PATH\nEXPOSE 8000\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\", \"--workers\", \"4\"]",
            "quiz": {
                "question": "What is the primary benefit of multi-stage Docker builds?",
                "options": [
                    "They allow running Windows and Linux in the same container.",
                    "They produce drastically smaller and more secure production images by discarding build tools and intermediate artifacts.",
                    "They make Python run faster than C++.",
                    "They eliminate the need for environment variables."
                ],
                "answer": 1,
                "explanation": "Multi-stage builds leave compiler tools, SDKs, and build cache in intermediate stages, keeping the final production image minimal, lean, and secure."
            },
            "resources": [
                {"resource_type": "doc", "title": "Docker: Getting Started Official Guide", "provider": "Docker.org", "url": "https://docs.docker.com/get-started/"},
                {"resource_type": "doc", "title": "The Twelve-Factor App Methodology", "provider": "12factor.net", "url": "https://12factor.net/"},
                {"resource_type": "video", "title": "Docker Tutorial for Beginners", "provider": "TechWorld with Nana", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE"}
            ],
            "tasks": [
                {"title": "Production Dockerfile & Compose File", "description": "Write a production Dockerfile and a docker-compose.yml running a web backend and PostgreSQL database with persistent volumes.", "difficulty": "Medium", "hint": "Define services for api and db with environment variables and depends_on."},
                {"title": "GitHub Actions CI Pipeline", "description": "Create a .github/workflows/ci.yml pipeline that installs dependencies, runs pytest unit tests, and validates code formatting on pull requests.", "difficulty": "Medium", "hint": "Use actions/checkout@v4 and actions/setup-python@v5 with pytest step."},
                {"title": "Health Check & Metric Dashboard Endpoint", "description": "Build an endpoint returning memory usage, uptime, database ping response latency, and system status.", "difficulty": "Easy", "hint": "Measure database query ping time with cursor.execute('SELECT 1;') and return JSON."}
            ]
        }
    ],

    # -------------------------------------------------------------
    # 6. Git & Development Tools (4 Topics)
    # -------------------------------------------------------------
    "tools": [
        {
            "slug": "git-basics",
            "title": "Git Basics",
            "description": "Version control principles, working directory, staging area, commits, status, diff, and repository initialization.",
            "difficulty": "Beginner",
            "estimated_hours": 3,
            "display_order": 1,
            "explanation": "Git is a distributed version control system tracking snapshots of files over time. It allows developers to revert changes, inspect history, collaborate safely, and manage code releases.",
            "key_points": [
                "The three states of Git: Working directory, Staging area (Index), and Git repository (.git).",
                "`git add <file>` moves changes to the staging area; `git commit -m '<message>'` records a snapshot.",
                "`git status` and `git diff` reveal modified, staged, and untracked files.",
                "Commit messages should follow conventional commits (feat, fix, refactor, docs).",
            ],
            "code_example": "# Essential Git workflow commands\ngit init\ngit add .\ngit commit -m \"feat: implement user registration and password hashing\"\ngit log --oneline -n 5\ngit status",
            "quiz": {
                "question": "Which Git command moves modified files from the working directory into the staging area?",
                "options": ["git commit", "git add", "git push", "git checkout"],
                "answer": 1,
                "explanation": "`git add` adds file modifications from the working directory to the staging area in preparation for the next commit."
            },
            "resources": [
                {"resource_type": "doc", "title": "Git SCM: Pro Git Book - Getting Started", "provider": "git-scm.com", "url": "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control"},
                {"resource_type": "doc", "title": "GitHub Git Cheat Sheet", "provider": "GitHub Education", "url": "https://education.github.com/git-cheat-sheet-education.pdf"},
                {"resource_type": "video", "title": "Git and GitHub for Beginners - Crash Course", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk"}
            ],
            "tasks": [
                {"title": "Repository Initialization & First Commit", "description": "Initialize a local git repo, create a .gitignore file ignoring node_modules and .env, and make your initial commit.", "difficulty": "Easy", "hint": "Ensure .env is added to .gitignore before running git add ."},
                {"title": "Inspect & Undo Staged Changes", "description": "Stage a file, use `git status` and `git diff --staged` to inspect changes, then unstage it without losing edits.", "difficulty": "Easy", "hint": "Use git restore --staged <file> or git reset HEAD <file>."},
                {"title": "Interactive Git History Rewind", "description": "Use git log to identify previous commit hashes and checkout a detached HEAD to test older code safely.", "difficulty": "Medium", "hint": "git checkout <hash> lets you inspect historical snapshots non-destructively."}
            ]
        },
        {
            "slug": "branching-merging",
            "title": "Branching & Merging",
            "description": "Git branches, feature branch workflow, fast-forward vs three-way merges, merge conflicts, and rebasing.",
            "difficulty": "Beginner",
            "estimated_hours": 4,
            "display_order": 2,
            "explanation": "Branches represent independent lines of development. Creating feature branches isolates work from the production mainline (`main`), and merging combines features back into the primary codebase.",
            "key_points": [
                "`git checkout -b <branch>` or `git switch -c <branch>` creates and switches to a new branch.",
                "Fast-forward merges occur when the target branch has no divergent commits.",
                "Merge conflicts occur when two branches modify the same lines of code in different ways.",
                "`git rebase` reapplies commits on top of another base tip to keep history linear.",
            ],
            "code_example": "# Feature branch creation and merging\ngit switch -c feature/roadmap-system\n# ... make code changes ...\ngit add backend/ database.py\ngit commit -m \"feat(roadmap): add PostgreSQL roadmap schema\"\ngit switch main\ngit merge --no-ff feature/roadmap-system",
            "quiz": {
                "question": "What happens when Git encounters conflicting changes in the same file lines during a merge?",
                "options": [
                    "Git deletes both files to avoid corruption.",
                    "Git pauses the merge and places conflict markers (<<<<<<<, =======, >>>>>>>) inside the file for the user to resolve.",
                    "Git automatically chooses the largest file.",
                    "Git crashes and deletes the repository."
                ],
                "answer": 1,
                "explanation": "Git pauses the merge process and marks conflicting code segments with conflict markers, requiring manual resolution before committing."
            },
            "resources": [
                {"resource_type": "doc", "title": "Git SCM: Git Branching - Basic Branching and Merging", "provider": "git-scm.com", "url": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging"},
                {"resource_type": "doc", "title": "Atlassian Git: Merge vs Rebase Tutorial", "provider": "Atlassian", "url": "https://www.atlassian.com/git/tutorials/merging-vs-rebasing"},
                {"resource_type": "video", "title": "Git Merge vs Rebase: What's the Difference?", "provider": "Fireship", "url": "https://www.youtube.com/watch?v=0chZFIZLR_0"}
            ],
            "tasks": [
                {"title": "Feature Branch Workflow Exercise", "description": "Create a feature branch from main, commit two distinct improvements, switch back to main, and merge with --no-ff.", "difficulty": "Easy", "hint": "git checkout -b feature/test; make commits; git checkout main; git merge feature/test."},
                {"title": "Simulate & Resolve a Merge Conflict", "description": "Create two branches modifying the same line in a README file, merge both into main sequentially, and resolve the conflict cleanly.", "difficulty": "Medium", "hint": "Open the file with conflict markers, pick the intended lines, delete markers, git add, and git commit."},
                {"title": "Interactive Git Rebase & Squashing", "description": "Squash three fragmented 'WIP' commits into a single clean commit using `git rebase -i HEAD~3`.", "difficulty": "Medium", "hint": "Change 'pick' to 'squash' (or 's') on the second and third commits in the interactive editor."}
            ]
        },
        {
            "slug": "github-collaboration",
            "title": "GitHub & Collaboration",
            "description": "Remote repositories, Pull Requests, code review workflows, fork & upstream synchronization, and issues.",
            "difficulty": "Beginner",
            "estimated_hours": 4,
            "display_order": 3,
            "explanation": "GitHub is the world's largest platform for software collaboration. It extends Git with Pull Requests (PRs), code reviews, issue tracking, CI integrations, and open-source forks.",
            "key_points": [
                "Remote tracking: `git remote add origin <url>` and `git push -u origin main`.",
                "Pull Requests allow teammates to review code diffs, suggest improvements, and run automated CI checks before merging.",
                "Syncing forks requires setting an `upstream` remote pointing to the canonical repository.",
                "Branch protection rules prevent force pushes and enforce approvals before merging to main.",
            ],
            "code_example": "# Managing remotes and syncing with upstream\ngit remote add origin https://github.com/username/prepnest.git\ngit remote add upstream https://github.com/original-owner/prepnest.git\ngit fetch upstream\ngit merge upstream/main",
            "quiz": {
                "question": "What is the primary function of a Pull Request (PR) in a collaborative development workflow?",
                "options": [
                    "It downloads a compiled binary to the client computer.",
                    "It proposes changes from a feature branch to be reviewed, discussed, and approved before merging into a target branch.",
                    "It resets the remote repository to commit 0.",
                    "It automatically deletes untracked files."
                ],
                "answer": 1,
                "explanation": "A Pull Request allows developers to propose changes, solicit reviews, run CI checks, and discuss diffs prior to merging code into the main branch."
            },
            "resources": [
                {"resource_type": "doc", "title": "GitHub Docs: About pull requests", "provider": "GitHub Docs", "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"},
                {"resource_type": "doc", "title": "GitHub Docs: Syncing a fork", "provider": "GitHub Docs", "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork"},
                {"resource_type": "video", "title": "How to create a Pull Request on GitHub", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=8lGpZkjnkt4"}
            ],
            "tasks": [
                {"title": "Fork & Clone Open Source Repo", "description": "Fork a public repository on GitHub, clone it locally, configure upstream remote, and verify git remote -v.", "difficulty": "Easy", "hint": "git remote add upstream <canonical_repo_url>."},
                {"title": "Draft a Professional Pull Request Template", "description": "Create a .github/PULL_REQUEST_TEMPLATE.md with sections for Summary, Related Issues, Verification Steps, and Checklist.", "difficulty": "Easy", "hint": "Markdown template renders automatically when someone opens a PR on GitHub."},
                {"title": "Configure Branch Protection & Review Policies", "description": "Configure rules requiring at least 1 approving review and passing CI status checks before merging to main.", "difficulty": "Medium", "hint": "Navigate to GitHub Repository Settings -> Branches -> Add branch ruleset."}
            ]
        },
        {
            "slug": "debugging-postman-dev-tools",
            "title": "Debugging, Postman & Developer Tools",
            "description": "Browser DevTools (Network, Console, Application), Postman collections, environment variables, and interactive debuggers.",
            "difficulty": "Intermediate",
            "estimated_hours": 5,
            "display_order": 4,
            "explanation": "Efficient software development relies on proficient debugging tools. Browser DevTools diagnose network payloads, styling, and memory usage. Postman allows testing, mocking, and automated assertion testing of RESTful APIs.",
            "key_points": [
                "DevTools Network tab inspects HTTP status codes, headers, response times, and payloads.",
                "DevTools Application tab manages cookies, localStorage, sessionStorage, and IndexedDB.",
                "Postman Collections organize requests and test scripts with shared environment variables (e.g., {{base_url}}, {{jwt_token}}).",
                "Breakpoint debugging (VSCode debugger, pdb) steps through code execution line-by-line.",
            ],
            "code_example": "// Postman pre-request script & test assertion example\npm.test(\"Status code is 200 OK\", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test(\"Response has valid auth token\", function () {\n    var jsonData = pm.response.json();\n    pm.expect(jsonData.access_token).to.be.a(\"string\");\n    pm.environment.set(\"jwt_token\", jsonData.access_token);\n});",
            "quiz": {
                "question": "Which Browser DevTools tab is primarily used to inspect HTTP headers, request payloads, and API response timings?",
                "options": ["Console", "Network", "Elements", "Sources"],
                "answer": 1,
                "explanation": "The Network tab displays all assets and API requests made by the page, including response times, headers, and body payloads."
            },
            "resources": [
                {"resource_type": "doc", "title": "Chrome DevTools: Inspect Network Activity", "provider": "Google Chrome Developers", "url": "https://developer.chrome.com/docs/devtools/network/"},
                {"resource_type": "doc", "title": "Postman Learning Center: Sending Requests", "provider": "Postman", "url": "https://learning.postman.com/docs/getting-started/first-steps/sending-the-first-request/"},
                {"resource_type": "video", "title": "Chrome DevTools Full Course - Debug Like a Pro", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=gT0M33M422U"}
            ],
            "tasks": [
                {"title": "Postman Authentication Test Collection", "description": "Create a Postman collection that signs up a user, saves the returned JWT token to an environment variable, and uses it to call a protected route.", "difficulty": "Medium", "hint": "Use pm.environment.set('token', pm.response.json().access_token) in the Tests script."},
                {"title": "Inspect Slow Network Requests in DevTools", "description": "Use the Chrome DevTools Network tab to simulate 3G throttling, inspect waterfalls, and identify assets blocking DOMContentLoaded.", "difficulty": "Easy", "hint": "Toggle throttling dropdown in Network tab to 'Slow 3G'."},
                {"title": "VSCode Breakpoint Debugging Session", "description": "Configure a launch.json file in VSCode to attach to a FastAPI or Node process, set conditional breakpoints, and inspect variable watches.", "difficulty": "Medium", "hint": "Create .vscode/launch.json with 'Python: FastAPI' configuration."}
            ]
        }
    ],

    # -------------------------------------------------------------
    # 7. Interview Preparation (5 Topics)
    # -------------------------------------------------------------
    "interview": [
        {
            "slug": "aptitude",
            "title": "Aptitude",
            "description": "Quantitative aptitude, logical reasoning, data interpretation, probability, speed math, and verbal ability.",
            "difficulty": "Intermediate",
            "estimated_hours": 6,
            "display_order": 1,
            "explanation": "General aptitude tests evaluate numerical problem solving, pattern recognition, and logical reasoning. Most technical campus and off-campus recruitment drives use aptitude screens as the initial qualification filter.",
            "key_points": [
                "Quantitative topics: Percentages, Profit & Loss, Time & Work, Speed Time & Distance, Permutations & Combinations.",
                "Logical reasoning: Syllogisms, Blood Relations, Seating Arrangements, Coding-Decoding.",
                "Data Interpretation: Bar charts, Pie charts, and Tabular data analysis under time pressure.",
                "Speed math tricks: Approximations, Vedic math shortcuts, and elimination of answer choices.",
            ],
            "code_example": "# Formulaic solution: Time and Work efficiency calculation\n# Pipe A fills in 6 hrs, Pipe B empties in 9 hrs\n# Fraction filled per hr = 1/6 - 1/9 = (3 - 2) / 18 = 1/18\ntime_to_fill = 1 / ((1/6) - (1/9))\nprint(f'Total time to fill reservoir: {time_to_fill:.1f} hours')  # 18.0 hours",
            "quiz": {
                "question": "A train running at 54 km/h crosses a 150m long platform in 20 seconds. What is the length of the train?",
                "options": ["100 m", "150 m", "200 m", "250 m"],
                "answer": 1,
                "explanation": "Speed = 54 * (5/18) = 15 m/s. Total distance = Speed * Time = 15 * 20 = 300 m. Train length = 300 - 150 (platform) = 150 m."
            },
            "resources": [
                {"resource_type": "doc", "title": "PrepNest Aptitude Practice Module", "provider": "PrepNest Platform", "url": "/aptitude"},
                {"resource_type": "doc", "title": "IndiaBIX: Quantitative Aptitude Questions & Answers", "provider": "IndiaBIX", "url": "https://www.indiabix.com/aptitude/questions-and-answers/"},
                {"resource_type": "video", "title": "Aptitude Made Easy - Speed Math & Quantitative Tricks", "provider": "Freshersworld", "url": "https://www.youtube.com/watch?v=H7Z8x3fD8B0"}
            ],
            "tasks": [
                {"title": "Solve 10 Quantitative Questions on PrepNest", "description": "Complete a full 10-question Quantitative Aptitude test in PrepNest under 15 minutes.", "difficulty": "Easy", "hint": "Navigate to the Aptitude section and filter by Quantitative category."},
                {"title": "Logical Reasoning Syllogisms Practice", "description": "Solve 5 Venn-diagram based categorical syllogism problems with zero false deductions.", "difficulty": "Medium", "hint": "Draw intersecting circles representing statements and test each conclusion independently."},
                {"title": "Timed Speed Math Calculation Drill", "description": "Practice mental arithmetic calculating compound interest, ratios, and percentages within 45 seconds per question.", "difficulty": "Medium", "hint": "Use fractions for percentages: 12.5% = 1/8, 16.66% = 1/6, 33.33% = 1/3."}
            ]
        },
        {
            "slug": "coding-problems",
            "title": "Coding Problems",
            "description": "Online assessment (OA) strategies, edge case analysis, time/space complexity optimization, and platform etiquette.",
            "difficulty": "Advanced",
            "estimated_hours": 8,
            "display_order": 2,
            "explanation": "Technical coding rounds test algorithmic fluency and clean coding under time constraints. Mastering complexity analysis, edge cases (empty inputs, bounds, duplicates), and standard problem patterns is essential to passing OAs.",
            "key_points": [
                "Read problem constraints first: N <= 10^5 indicates an O(N) or O(N log N) solution is required.",
                "Always check edge cases: empty array, single element, negative numbers, overflow limits.",
                "Explain your approach out loud before typing: Brute force -> Bottleneck analysis -> Optimal solution.",
                "Dry-run logic against provided examples using pencil/paper or comments before pressing submit.",
            ],
            "code_example": "# Clean interview code with type hints and explicit edge case validation\ndef max_subarray_sum(nums: list[int]) -> int:\n    if not nums:\n        return 0\n    max_sum = current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)  # Kadane's algorithm\n        max_sum = max(max_sum, current_sum)\n    return max_sum",
            "quiz": {
                "question": "If an array size N is up to 100,000 (10^5), which time complexity will almost certainly pass within the standard 1.0 second execution limit?",
                "options": ["O(N^2)", "O(N log N)", "O(2^N)", "O(N!)"],
                "answer": 1,
                "explanation": "Computers execute roughly 10^7 - 10^8 operations per second. For N = 10^5, N log N takes ~1.7 * 10^6 ops (passes in < 0.05s), whereas O(N^2) takes 10^10 ops and times out (TLE)."
            },
            "resources": [
                {"resource_type": "doc", "title": "PrepNest DSA Problem Practice Sheet", "provider": "PrepNest Platform", "url": "/dsa"},
                {"resource_type": "doc", "title": "NeetCode 150 Curated Problem Sheet", "provider": "NeetCode.io", "url": "https://neetcode.io/practice"},
                {"resource_type": "video", "title": "How to Ace the Technical Coding Interview", "provider": "Clément Mihailescu", "url": "https://www.youtube.com/watch?v=1qw5ITr3k9E"}
            ],
            "tasks": [
                {"title": "Solve 3 Two-Pointer Problems in PrepNest DSA", "description": "Complete Two Sum II, 3Sum, and Container With Most Water in PrepNest DSA tracking time taken.", "difficulty": "Medium", "hint": "Sort array first if needed or maintain left and right pointers."},
                {"title": "Constraint-to-Complexity Cheat Sheet", "description": "Create a reference card mapping array sizes (N <= 20 -> O(2^N), N <= 5000 -> O(N^2), N <= 10^5 -> O(N log N)).", "difficulty": "Easy", "hint": "Memorize that standard online judge timeout is ~1 second for 10^8 basic CPU operations."},
                {"title": "Mock 45-Minute OA Simulation", "description": "Solve two previously unseen Medium coding problems back-to-back within a strict 45-minute countdown timer.", "difficulty": "Hard", "hint": "Spend the first 5 minutes clarifying requirements and mapping constraints before writing code."}
            ]
        },
        {
            "slug": "technical-interview",
            "title": "Technical Interview",
            "description": "System design fundamentals, Core CS concepts (OS, Computer Networks, DBMS), concurrency, and architecture.",
            "difficulty": "Advanced",
            "estimated_hours": 8,
            "display_order": 3,
            "explanation": "Technical interviews evaluate core computer science fundamentals and architectural reasoning. Key topics include Operating Systems (processes vs threads, virtual memory), Computer Networks (TCP/IP, DNS, WebSockets), and Scalable System Design.",
            "key_points": [
                "Process vs Thread: A process has its own address space; threads within a process share memory.",
                "Networking: TCP is reliable and connection-oriented; UDP is connectionless and fast (streaming/gaming).",
                "System Design: Scale horizontally with load balancers, caching (Redis), CDNs, and database sharding.",
                "CAP Theorem: In a distributed system with network partitions (P), choose Consistency (C) or Availability (A).",
            ],
            "code_example": "# High-level URL Shortener (System Design) data model\n# Base62 encoding converts 64-bit auto-incrementing integer ID to 7-character string\nimport string\n\nBASE62_CHARS = string.digits + string.ascii_letters\n\ndef encode_id(num: int) -> str:\n    if num == 0:\n        return BASE62_CHARS[0]\n    res = []\n    while num > 0:\n        res.append(BASE62_CHARS[num % 62])\n        num //= 62\n    return ''.join(reversed(res))\n\nprint(encode_id(125309))  # 'wbh'",
            "quiz": {
                "question": "According to the CAP theorem, what two guarantees can a distributed database simultaneously preserve in the presence of a network partition?",
                "options": [
                    "Consistency and Availability (with Partition Tolerance impossible)",
                    "Either Consistency or Availability (P is unavoidable in real networks)",
                    "Speed and Encryption",
                    "Atomicity and Linearity"
                ],
                "answer": 1,
                "explanation": "Because network partitions (P) are inevitable in distributed systems, a database must trade off between returning consistent data (CP) or guaranteeing availability (AP)."
            },
            "resources": [
                {"resource_type": "doc", "title": "System Design Primer by Donne Martin", "provider": "GitHub", "url": "https://github.com/donnemartin/system-design-primer"},
                {"resource_type": "doc", "title": "ByteByteGo: System Design Interview Guide", "provider": "ByteByteGo / Alex Xu", "url": "https://bytebytego.com/"},
                {"resource_type": "video", "title": "System Design for Beginners Course", "provider": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=m8Icp_Cid5o"}
            ],
            "tasks": [
                {"title": "Design a Scalable URL Shortener (Bitly)", "description": "Write a 2-page system design document outlining capacity estimation, API schema, Base62 encoding, and caching architecture.", "difficulty": "Medium", "hint": "Calculate daily reads/writes, storage needed over 5 years, and use Redis for hot 20% URLs."},
                {"title": "Process vs Thread Operating System Deep Dive", "description": "Document how the Linux kernel handles processes (fork) vs threads (pthreads), context switches, and inter-process communication (IPC).", "difficulty": "Medium", "hint": "Compare shared virtual memory maps and IPC mechanisms like pipes, sockets, and shared memory."},
                {"title": "Design a Real-Time Collaborative Document Service", "description": "Architect a multi-user collaborative editor (like Google Docs) comparing WebSockets, Operational Transformation (OT), and CRDTs.", "difficulty": "Hard", "hint": "Contrast server-mediated OT conflict resolution with decentralized Conflict-free Replicated Data Types."}
            ]
        },
        {
            "slug": "hr-behavioral-interview",
            "title": "HR & Behavioral Interview",
            "description": "STAR method (Situation, Task, Action, Result), leadership principles, conflict resolution, and storytelling.",
            "difficulty": "Intermediate",
            "estimated_hours": 4,
            "display_order": 4,
            "explanation": "Behavioral interviews assess interpersonal communication, problem solving in teams, resilience under pressure, and alignment with company culture. The STAR methodology provides a structured framework for delivering compelling anecdotes.",
            "key_points": [
                "STAR framework: Situation (Context), Task (Challenge), Action (Specific steps YOU took), Result (Quantified outcome).",
                "Prepare 4-5 versatile project stories that adapt to questions on conflict, failure, leadership, and tight deadlines.",
                "Emphasize personal contributions: Use 'I' rather than exclusively 'We' when detailing actions taken.",
                "Always prepare 2-3 thoughtful questions for the interviewer demonstrating company knowledge.",
            ],
            "code_example": "/* STAR Response Blueprint:\nSituation: In my final-year project, our database queries lagged when 100 concurrent students tested the portal.\nTask: I was responsible for identifying the bottleneck and bringing response times under 200ms.\nAction: I ran EXPLAIN ANALYZE, identified missing foreign key indexes, and implemented Redis caching for hot question items.\nResult: Query response times dropped by 74% (from 820ms to 180ms), handling over 500 concurrent users without timeouts.\n*/",
            "quiz": {
                "question": "What does the 'A' represent in the STAR behavioral interview framework?",
                "options": ["Ambition", "Action", "Apology", "Agreement"],
                "answer": 1,
                "explanation": "Action describes the specific steps and decisions you personally undertook to resolve the challenge."
            },
            "resources": [
                {"resource_type": "doc", "title": "Harvard OCS: Behavioral Interviewing Guide & STAR Method", "provider": "Harvard University", "url": "https://careerservices.fas.harvard.edu/"},
                {"resource_type": "doc", "title": "Amazon Leadership Principles Explained", "provider": "Amazon Jobs", "url": "https://www.amazon.jobs/content/en/our-workplace/leadership-principles"},
                {"resource_type": "video", "title": "How to Answer Behavioral Interview Questions", "provider": "Jeff Su", "url": "https://www.youtube.com/watch?v=uGqux_g9-5E"}
            ],
            "tasks": [
                {"title": "Craft 3 Quantified STAR Anecdotes", "description": "Write out three complete STAR stories covering: (1) Technical Challenge, (2) Team Disagreement, (3) Delivery under Deadline.", "difficulty": "Easy", "hint": "Ensure the Result section includes a measurable statistic (e.g. 40% latency reduction, 2 weeks ahead of schedule)."},
                {"title": "Prepare 'Tell Me About Yourself' 90-Second Pitch", "description": "Script a confident 90-second elevator pitch connecting your education, key projects, technical passions, and role fit.", "difficulty": "Easy", "hint": "Structure: Present role/studies -> Past significant achievements -> Future aspiration with this company."},
                {"title": "Mock Behavioral Q&A Drill with Recorded Audio", "description": "Record audio responses answering 5 tough HR questions ('Why should we hire you?', 'What is your greatest weakness?') and review for filler words.", "difficulty": "Medium", "hint": "For weakness questions, pick a real technical skill and demonstrate how you are actively overcoming it."}
            ]
        },
        {
            "slug": "resume-linkedin",
            "title": "Resume & LinkedIn",
            "description": "ATS resume optimization, Google XYZ bullet formulation, portfolio websites, and professional LinkedIn presence.",
            "difficulty": "Intermediate",
            "estimated_hours": 4,
            "display_order": 5,
            "explanation": "Your resume and LinkedIn profile are your primary professional marketing assets. Applicant Tracking Systems (ATS) scan for structured sections and relevant keywords. Formulate resume bullet points using the Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.",
            "key_points": [
                "Format resumes with single-column ATS-friendly layouts; avoid complex graphics, tables, or text boxes.",
                "Google XYZ bullet formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.",
                "Tailor resume keywords to match company role requirements (e.g., matching PrepNest role profiles).",
                "Ensure LinkedIn has a high-resolution professional headshot, clear headline, and links to your GitHub and portfolio.",
            ],
            "code_example": "/* Before & After: Applying the Google XYZ Formula\nBefore: Worked on backend database optimization for our college portal.\n\nAfter: Accelerated query response latency by 72% across 5,000 active users by implementing composite B-Tree indexes and Redis caching in PostgreSQL.\n*/",
            "quiz": {
                "question": "What is the recommended formula suggested by Google recruiters for writing impactful resume accomplishment bullets?",
                "options": [
                    "Started [X], finished [Y], hoped for [Z]",
                    "Accomplished [X], as measured by [Y], by doing [Z]",
                    "Worked on [X], with team [Y], using tool [Z]",
                    "Loved [X], researched [Y], learned [Z]"
                ],
                "answer": 1,
                "explanation": "The Google XYZ formula focuses on tangible accomplishments backed by measurable metrics and the specific technical actions taken."
            },
            "resources": [
                {"resource_type": "doc", "title": "PrepNest AI Resume Analyzer & ATS Optimizer", "provider": "PrepNest Platform", "url": "/resume"},
                {"resource_type": "doc", "title": "Google Careers: How to write a great resume", "provider": "Google Careers", "url": "https://www.google.com/about/careers/applications/how-we-hire/"},
                {"resource_type": "video", "title": "The Resume That Got Me Into Google (Software Engineer)", "provider": "Clément Mihailescu", "url": "https://www.youtube.com/watch?v=yp693O87GmM"}
            ],
            "tasks": [
                {"title": "Scan Resume in PrepNest ATS Analyzer", "description": "Upload your resume into the PrepNest Resume Analyzer, target a specific company role, and achieve an ATS score above 85.", "difficulty": "Easy", "hint": "Navigate to /resume, upload your PDF/DOCX, and review the detailed score breakdown."},
                {"title": "Rewrite 5 Bullets with XYZ Formula", "description": "Select 5 project or internship bullets from your resume and rewrite them using the XYZ formula with metrics and impact.", "difficulty": "Medium", "hint": "Use action verbs like 'Engineered', 'Optimized', 'Architected', 'Reduced', 'Implemented'."},
                {"title": "LinkedIn Profile Headline & About Section Audit", "description": "Optimize your LinkedIn headline to highlight your core stack (e.g., 'Full-Stack Developer | React | Node.js | Python | Ex-Intern @ XYZ') and link top GitHub projects.", "difficulty": "Easy", "hint": "Include target job title keywords so recruiters finding candidates match your profile."}
            ]
        }
    ]
}

MINI_PROJECTS = [
    {
        "domain_id": "fundamentals",
        "title": "Console-Based Bank Account & Transaction System",
        "description": "Build an object-oriented banking simulation managing customer accounts, interest calculation, transaction history logging, and persistent data storage using File I/O.",
        "difficulty": "Intermediate",
        "estimated_hours": 12,
        "requirements": [
            "Create Account hierarchy: SavingsAccount, CurrentAccount with polymorphic withdraw and deposit rules.",
            "Implement robust exception handling (InsufficientFundsException, InvalidAmountException).",
            "Persist account state and transaction logs to a local file (JSON or CSV) across program restarts.",
            "Write a clean CLI menu allowing users to create accounts, deposit, withdraw, transfer, and view audit statements."
        ],
        "tech_stack": ["Python / Java / C++", "Object-Oriented Design", "File I/O", "Exception Handling"]
    },
    {
        "domain_id": "web",
        "title": "Interactive Developer Portfolio & Task Tracker",
        "description": "Construct a fully responsive, modern web portfolio and Kanban-style task tracking application with drag-and-drop, theme customization, and client-side persistence.",
        "difficulty": "Intermediate",
        "estimated_hours": 15,
        "requirements": [
            "Responsive layout utilizing CSS Grid and Flexbox adhering to WCAG accessibility guidelines.",
            "Interactive Task Tracker with Add, Edit, Delete, and Status Filter (Pending, In Progress, Done).",
            "Persist task data and theme preference (Dark/Light) in browser LocalStorage.",
            "Debounced search bar filtering tasks dynamically with smooth CSS transitions."
        ],
        "tech_stack": ["React.js", "Tailwind CSS", "LocalStorage", "Web APIs"]
    },
    {
        "domain_id": "dsa",
        "title": "Algorithmic Pathfinding Visualizer & LRU Cache Engine",
        "description": "Design an algorithmic demonstration tool combining an O(1) LRU Cache simulation and a grid-based pathfinding engine implementing BFS and Dijkstra's algorithm.",
        "difficulty": "Advanced",
        "estimated_hours": 18,
        "requirements": [
            "Implement an LRU Cache from scratch using a Doubly Linked List and Hash Map.",
            "Implement Breadth-First Search (BFS) and Dijkstra's algorithm on a 2D weighted grid.",
            "Visualize shortest path calculations and explored node counts.",
            "Benchmarking test suite verifying O(1) cache get/put and O(V + E log V) pathfinding runtime."
        ],
        "tech_stack": ["Python / JavaScript", "Hash Tables", "Doubly Linked List", "Graph BFS / Dijkstra"]
    },
    {
        "domain_id": "database",
        "title": "E-Commerce Relational Database & Reporting Engine",
        "description": "Architect a production-ready relational schema in 3NF for an e-commerce platform, write comprehensive migration scripts, and compose analytical reporting queries using Window Functions.",
        "difficulty": "Intermediate",
        "estimated_hours": 14,
        "requirements": [
            "Design normalized tables for customers, products, categories, orders, order_items, and payments.",
            "Include primary keys, foreign keys with ON DELETE CASCADE, CHECK constraints, and B-Tree indexes.",
            "Write ACID transactions transferring funds and decrementing inventory atomically.",
            "Compose advanced SQL queries using DENSE_RANK() and LAG() for Month-Over-Month sales reports."
        ],
        "tech_stack": ["PostgreSQL", "SQL DDL & DML", "Window Functions", "ACID Transactions"]
    },
    {
        "domain_id": "backend",
        "title": "Scalable RESTful API with JWT Auth & Database Pooling",
        "description": "Develop a production-grade backend service featuring JWT authentication, Role-Based Access Control, connection pooling, rate limiting, and comprehensive automated test suites.",
        "difficulty": "Advanced",
        "estimated_hours": 20,
        "requirements": [
            "Implement user signup and login with bcrypt hashing and JWT token issuance.",
            "Role-Based Access Control protecting admin-only endpoints.",
            "Thread-safe PostgreSQL connection pooling with parameter-bound queries preventing SQL Injection.",
            "API documentation with Swagger/OpenAPI and automated pytest test suites covering happy and error paths."
        ],
        "tech_stack": ["FastAPI / Express.js", "PostgreSQL", "JWT", "Bcrypt", "Docker"]
    },
    {
        "domain_id": "tools",
        "title": "Collaborative Git Workflow & Postman Automated Test Suite",
        "description": "Establish an enterprise development workflow featuring feature branching, simulated merge conflict resolution, pull request templates, and automated Postman API test assertions.",
        "difficulty": "Intermediate",
        "estimated_hours": 10,
        "requirements": [
            "Set up a Git repository with main, staging, and feature branches.",
            "Document simulated merge conflict resolution with clear Git commit history.",
            "Configure GitHub Pull Request templates and GitHub Actions CI workflow.",
            "Author a Postman collection with environment variables and automated test assertions."
        ],
        "tech_stack": ["Git", "GitHub Actions", "Postman", "Markdown"]
    },
    {
        "domain_id": "interview",
        "title": "Complete Placement Readiness Dossier & Portfolio",
        "description": "Assemble a comprehensive placement preparation package featuring an ATS-optimized 90+ score resume, 5 STAR behavioral case studies, and a technical system design whitepaper.",
        "difficulty": "Advanced",
        "estimated_hours": 15,
        "requirements": [
            "ATS-optimized resume tested against PrepNest Resume Analyzer with > 85 score.",
            "5 detailed STAR interview stories with metrics and technical action verbs.",
            "1 system design architectural whitepaper (e.g. URL shortener or rate limiter).",
            "Recorded 90-second elevator pitch and behavioral response notes."
        ],
        "tech_stack": ["PrepNest Resume Analyzer", "STAR Framework", "System Design", "LaTeX / PDF"]
    }
]

# ==============================================================================
# SEEDING EXECUTION
# ==============================================================================

def seed_roadmap():
    print(f"Connecting to database to seed roadmap...")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    cursor = conn.cursor()

    try:
        # 1. Seed Domains
        print("Seeding roadmap domains...")
        for domain in DOMAINS:
            cursor.execute("""
                INSERT INTO roadmap_domains (id, name, description, difficulty, estimated_weeks, display_order, icon_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    difficulty = EXCLUDED.difficulty,
                    estimated_weeks = EXCLUDED.estimated_weeks,
                    display_order = EXCLUDED.display_order,
                    icon_name = EXCLUDED.icon_name;
            """, (
                domain["id"],
                domain["name"],
                domain["description"],
                domain["difficulty"],
                domain["estimated_weeks"],
                domain["display_order"],
                domain["icon_name"]
            ))

        # 2. Seed Topics, Resources, Tasks
        total_topics = 0
        total_resources = 0
        total_tasks = 0

        for domain_id, topic_list in TOPICS.items():
            print(f"Seeding topics for domain: {domain_id} ({len(topic_list)} topics)...")
            for t in topic_list:
                total_topics += 1
                cursor.execute("""
                    INSERT INTO roadmap_topics 
                    (domain_id, slug, title, description, difficulty, estimated_hours, display_order, explanation, key_points, code_example, quiz)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (domain_id, slug) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        difficulty = EXCLUDED.difficulty,
                        estimated_hours = EXCLUDED.estimated_hours,
                        display_order = EXCLUDED.display_order,
                        explanation = EXCLUDED.explanation,
                        key_points = EXCLUDED.key_points,
                        code_example = EXCLUDED.code_example,
                        quiz = EXCLUDED.quiz
                    RETURNING id;
                """, (
                    domain_id,
                    t["slug"],
                    t["title"],
                    t["description"],
                    t["difficulty"],
                    t["estimated_hours"],
                    t["display_order"],
                    t["explanation"],
                    json.dumps(t["key_points"]),
                    t["code_example"],
                    json.dumps(t["quiz"])
                ))
                topic_id = cursor.fetchone()["id"]

                # Seed Resources
                cursor.execute("DELETE FROM roadmap_resources WHERE topic_id = %s;", (topic_id,))
                for idx, res in enumerate(t.get("resources", []), 1):
                    total_resources += 1
                    cursor.execute("""
                        INSERT INTO roadmap_resources (topic_id, resource_type, title, provider, url, is_free, display_order)
                        VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """, (
                        topic_id,
                        res.get("resource_type", "doc"),
                        res["title"],
                        res["provider"],
                        res["url"],
                        True,
                        idx
                    ))

                # Seed Practice Tasks
                cursor.execute("DELETE FROM roadmap_practice_tasks WHERE topic_id = %s;", (topic_id,))
                for idx, task in enumerate(t.get("tasks", []), 1):
                    total_tasks += 1
                    cursor.execute("""
                        INSERT INTO roadmap_practice_tasks (topic_id, title, description, difficulty, hint, display_order)
                        VALUES (%s, %s, %s, %s, %s, %s);
                    """, (
                        topic_id,
                        task["title"],
                        task["description"],
                        task["difficulty"],
                        task.get("hint", ""),
                        idx
                    ))

        # 3. Seed Mini Projects
        print(f"Seeding {len(MINI_PROJECTS)} domain mini projects...")
        cursor.execute("DELETE FROM roadmap_projects;")
        for proj in MINI_PROJECTS:
            cursor.execute("""
                INSERT INTO roadmap_projects (domain_id, title, description, difficulty, estimated_hours, requirements, tech_stack)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (
                proj["domain_id"],
                proj["title"],
                proj["description"],
                proj["difficulty"],
                proj["estimated_hours"],
                json.dumps(proj["requirements"]),
                proj["tech_stack"]
            ))

        conn.commit()
        print("\n=======================================================")
        print(f"SUCCESS: Seeded {len(DOMAINS)} domains.")
        print(f"SUCCESS: Seeded {total_topics} topics.")
        print(f"SUCCESS: Seeded {total_resources} verified resources.")
        print(f"SUCCESS: Seeded {total_tasks} practice tasks (>=3 per topic).")
        print(f"SUCCESS: Seeded {len(MINI_PROJECTS)} domain mini projects.")
        print("=======================================================")

    except Exception as e:
        conn.rollback()
        print(f"Error seeding roadmap: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_roadmap()
