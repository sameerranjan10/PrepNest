import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Map,
  CheckCircle2,
  Lock,
  ChevronRight,
  Code2,
  Database,
  BrainCircuit,
  Globe,
  Server,
  GitBranch,
  Briefcase,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  BookOpen,
  PlayCircle,
  Check,
  X,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

/* =========================================================
   ROADMAP DATA
========================================================= */

const ROADMAP_DATA = [
  {
    id: "fundamentals",
    title: "Programming Fundamentals",
    description:
      "Build a strong foundation in programming and problem solving.",
    icon: Code2,
    duration: "2-3 weeks",
    level: "Beginner",
    topics: [
      "Variables & Data Types",
      "Conditions & Loops",
      "Functions",
      "Arrays & Strings",
      "Object-Oriented Programming",
    ],
  },

  {
    id: "web",
    title: "Web Development",
    description:
      "Learn the technologies required to build modern web applications.",
    icon: Globe,
    duration: "3-4 weeks",
    level: "Beginner",
    topics: [
      "HTML & CSS",
      "JavaScript",
      "DOM Manipulation",
      "React Basics",
      "REST APIs",
    ],
  },

  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description:
      "Master the core DSA concepts required for coding interviews.",
    icon: BrainCircuit,
    duration: "6-8 weeks",
    level: "Intermediate",
    topics: [
      "Arrays & Strings",
      "Linked Lists",
      "Stacks & Queues",
      "Trees & Graphs",
      "Sorting & Searching",
      "Dynamic Programming",
    ],
  },

  {
    id: "database",
    title: "Database & DBMS",
    description:
      "Understand how applications store, retrieve and manage data.",
    icon: Database,
    duration: "2-3 weeks",
    level: "Intermediate",
    topics: [
      "SQL Basics",
      "Joins",
      "Normalization",
      "Transactions",
      "Indexes",
    ],
  },

  {
    id: "backend",
    title: "Backend Development",
    description:
      "Build APIs and understand server-side application development.",
    icon: Server,
    duration: "3-4 weeks",
    level: "Intermediate",
    topics: [
      "Node.js / Python",
      "REST API",
      "Authentication",
      "Database Integration",
      "API Security",
    ],
  },

  {
    id: "tools",
    title: "Git & Development Tools",
    description:
      "Learn the tools used in real-world software development.",
    icon: GitBranch,
    duration: "1 week",
    level: "Beginner",
    topics: [
      "Git Basics",
      "Branches",
      "Merge & Pull Requests",
      "GitHub",
    ],
  },

  {
    id: "interview",
    title: "Interview Preparation",
    description:
      "Prepare for technical and behavioral interviews.",
    icon: Briefcase,
    duration: "3-4 weeks",
    level: "Advanced",
    topics: [
      "Resume Preparation",
      "Technical Interviews",
      "HR Questions",
      "Mock Interviews",
      "Company Preparation",
    ],
  },
];

/* =========================================================
   TOPIC CONTENT
========================================================= */

const TOPIC_CONTENT = {
  "Variables & Data Types": {
    explanation:
      "Variables are named storage locations used to hold data. A data type describes what kind of value a variable contains.",
    points: [
      "Variables store values that can be used later.",
      "Common types include string, number, boolean, array and object.",
      "Choose meaningful variable names.",
      "The type of data determines what operations can be performed.",
    ],
    example:
      "let age = 21;\nlet name = 'Vivek';\nlet isStudent = true;",
    question:
      "Which data type represents true or false?",
    options: [
      "String",
      "Boolean",
      "Number",
      "Array",
    ],
    answer: 1,
  },

  "Conditions & Loops": {
    explanation:
      "Conditions allow programs to make decisions, while loops allow a block of code to execute repeatedly.",
    points: [
      "if/else is used for decision making.",
      "for loops are useful when the number of iterations is known.",
      "while loops continue while a condition remains true.",
      "Avoid infinite loops by updating the loop condition.",
    ],
    example:
      "if (age >= 18) {\n  console.log('Adult');\n}",
    question:
      "Which statement is commonly used to make a decision?",
    options: [
      "if",
      "import",
      "return",
      "class",
    ],
    answer: 0,
  },

  Functions: {
    explanation:
      "A function is a reusable block of code designed to perform a particular task.",
    points: [
      "Functions reduce code duplication.",
      "They can accept parameters.",
      "They can return a value.",
      "Functions improve code organization and readability.",
    ],
    example:
      "function add(a, b) {\n  return a + b;\n}",
    question:
      "What keyword is commonly used to define a function in JavaScript?",
    options: [
      "function",
      "define",
      "method",
      "func",
    ],
    answer: 0,
  },

  "Arrays & Strings": {
    explanation:
      "Arrays store collections of values, while strings represent sequences of characters.",
    points: [
      "Array indexes usually start from 0.",
      "Strings can be accessed character by character.",
      "Arrays can store multiple values.",
      "Common array operations include push, pop, map and filter.",
    ],
    example:
      "const numbers = [10, 20, 30];\nconsole.log(numbers[0]);",
    question:
      "What is the index of the first element of a JavaScript array?",
    options: [
      "0",
      "1",
      "-1",
      "10",
    ],
    answer: 0,
  },

  "Object-Oriented Programming": {
    explanation:
      "Object-oriented programming organizes software around objects that contain data and behavior.",
    points: [
      "Classes define the structure of objects.",
      "Encapsulation groups data and methods.",
      "Inheritance allows reuse of existing behavior.",
      "Polymorphism allows different implementations of a common interface.",
    ],
    example:
      "class Student {\n  constructor(name) {\n    this.name = name;\n  }\n}",
    question:
      "Which OOP concept allows a class to acquire properties from another class?",
    options: [
      "Encapsulation",
      "Inheritance",
      "Compilation",
      "Iteration",
    ],
    answer: 1,
  },

  "HTML & CSS": {
    explanation:
      "HTML provides the structure of a webpage, while CSS controls its appearance and layout.",
    points: [
      "HTML uses elements and tags.",
      "CSS controls colors, spacing and typography.",
      "Flexbox and Grid are common CSS layout systems.",
      "Semantic HTML improves accessibility.",
    ],
    example:
      "<h1>Hello World</h1>\n<p>Welcome to PrepNest.</p>",
    question:
      "Which technology is primarily responsible for webpage styling?",
    options: [
      "HTML",
      "CSS",
      "SQL",
      "Python",
    ],
    answer: 1,
  },

  JavaScript: {
    explanation:
      "JavaScript is a programming language commonly used to add behavior and interactivity to web applications.",
    points: [
      "JavaScript runs in browsers and other environments.",
      "It supports functions, objects and asynchronous programming.",
      "Modern JavaScript uses let and const.",
      "It is the foundation of many frontend frameworks.",
    ],
    example:
      "const message = 'Hello PrepNest';\nconsole.log(message);",
    question:
      "Which keyword declares a block-scoped constant?",
    options: [
      "var",
      "constant",
      "const",
      "static",
    ],
    answer: 2,
  },

  "DOM Manipulation": {
    explanation:
      "The DOM represents a webpage as a tree of objects that JavaScript can read and modify.",
    points: [
      "document represents the webpage.",
      "querySelector can select an element.",
      "textContent can change text.",
      "Event listeners respond to user actions.",
    ],
    example:
      "const title = document.querySelector('h1');\ntitle.textContent = 'Welcome';",
    question:
      "Which method selects an element using a CSS selector?",
    options: [
      "querySelector",
      "getCSS",
      "selectElement",
      "findNode",
    ],
    answer: 0,
  },

  "React Basics": {
    explanation:
      "React is a JavaScript library for building component-based user interfaces.",
    points: [
      "React applications are built from components.",
      "Props pass data between components.",
      "State stores changing data.",
      "Hooks such as useState and useEffect are common in functional components.",
    ],
    example:
      "function Welcome() {\n  return <h1>Hello!</h1>;\n}",
    question:
      "What is a React component primarily used to create?",
    options: [
      "Database tables",
      "User interface",
      "Operating systems",
      "Network cables",
    ],
    answer: 1,
  },

  "REST APIs": {
    explanation:
      "REST APIs allow applications to communicate using HTTP requests and resources.",
    points: [
      "GET retrieves data.",
      "POST creates data.",
      "PUT/PATCH updates data.",
      "DELETE removes data.",
    ],
    example:
      "GET /api/users\nPOST /api/users",
    question:
      "Which HTTP method is commonly used to retrieve data?",
    options: [
      "GET",
      "POST",
      "DELETE",
      "PATCH",
    ],
    answer: 0,
  },

  "Arrays & Strings": {
    explanation:
      "Arrays store collections of elements and strings store sequences of characters.",
    points: [
      "Arrays are frequently used in algorithm problems.",
      "Strings can often be treated as character sequences.",
      "Two-pointer techniques are common with arrays and strings.",
      "Hash maps can improve lookup performance.",
    ],
    example:
      "const arr = [1, 2, 3, 4];\nconst text = 'hello';",
    question:
      "What is the first index of a typical array?",
    options: ["0", "1", "-1", "2"],
    answer: 0,
  },

  "Linked Lists": {
    explanation:
      "A linked list is a linear data structure where nodes contain data and references to other nodes.",
    points: [
      "Each node stores data and a link.",
      "A singly linked list points to the next node.",
      "Insertion can be efficient when the position is known.",
      "Random access is slower than arrays.",
    ],
    example:
      "Node → Node → Node → null",
    question:
      "What does a linked-list node usually contain?",
    options: [
      "Only data",
      "Data and a reference",
      "Only an index",
      "Only a key",
    ],
    answer: 1,
  },

  "Stacks & Queues": {
    explanation:
      "Stacks follow LIFO ordering, while queues follow FIFO ordering.",
    points: [
      "Stack: Last In, First Out.",
      "Queue: First In, First Out.",
      "Stacks are useful for recursion and undo operations.",
      "Queues are useful for scheduling and BFS.",
    ],
    example:
      "Stack: push(10) → push(20) → pop() returns 20",
    question:
      "Which principle does a stack follow?",
    options: [
      "FIFO",
      "LIFO",
      "Random",
      "Priority only",
    ],
    answer: 1,
  },

  "Trees & Graphs": {
    explanation:
      "Trees and graphs are non-linear data structures used to represent hierarchical and connected data.",
    points: [
      "A tree has a hierarchical structure.",
      "Graphs consist of vertices and edges.",
      "DFS explores deeply before backtracking.",
      "BFS explores level by level.",
    ],
    example:
      "Tree:\n      A\n     / \\\n    B   C",
    question:
      "Which traversal explores a graph level by level?",
    options: [
      "DFS",
      "BFS",
      "Binary Search",
      "Insertion Sort",
    ],
    answer: 1,
  },

  "Sorting & Searching": {
    explanation:
      "Sorting arranges data in an order, while searching finds a desired element.",
    points: [
      "Linear search checks elements sequentially.",
      "Binary search requires sorted data.",
      "Merge sort has O(n log n) time complexity.",
      "Efficient searching can significantly improve performance.",
    ],
    example:
      "Sorted array: [10, 20, 30, 40, 50]\nBinary search can find 40 efficiently.",
    question:
      "What condition is required for binary search?",
    options: [
      "The data must be sorted",
      "The data must be random",
      "The array must contain strings",
      "The array must have duplicates",
    ],
    answer: 0,
  },

  "Dynamic Programming": {
    explanation:
      "Dynamic programming solves problems by breaking them into overlapping subproblems and storing previous results.",
    points: [
      "It is useful when subproblems overlap.",
      "Memoization uses top-down caching.",
      "Tabulation uses a bottom-up table.",
      "DP can reduce repeated computation.",
    ],
    example:
      "Fibonacci can be optimized by storing previously calculated values.",
    question:
      "What is commonly stored in dynamic programming?",
    options: [
      "Previous subproblem results",
      "Only input strings",
      "HTML elements",
      "Network packets",
    ],
    answer: 0,
  },

  "SQL Basics": {
    explanation:
      "SQL is used to communicate with relational databases and perform operations on stored data.",
    points: [
      "SELECT retrieves data.",
      "INSERT adds records.",
      "UPDATE modifies records.",
      "DELETE removes records.",
    ],
    example:
      "SELECT name FROM students WHERE marks > 80;",
    question:
      "Which SQL command retrieves data?",
    options: [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
    ],
    answer: 0,
  },

  Joins: {
    explanation:
      "SQL joins combine related data from multiple tables.",
    points: [
      "INNER JOIN returns matching records.",
      "LEFT JOIN keeps all records from the left table.",
      "RIGHT JOIN keeps all records from the right table.",
      "Joins commonly use related keys.",
    ],
    example:
      "SELECT * FROM students\nINNER JOIN departments\nON students.dept_id = departments.id;",
    question:
      "Which join returns matching records from both tables?",
    options: [
      "INNER JOIN",
      "LEFT JOIN",
      "CROSS JOIN",
      "FULL DELETE",
    ],
    answer: 0,
  },

  Normalization: {
    explanation:
      "Database normalization organizes data to reduce redundancy and improve consistency.",
    points: [
      "Normalization reduces duplicate data.",
      "1NF requires atomic values.",
      "2NF removes partial dependencies.",
      "3NF removes transitive dependencies.",
    ],
    example:
      "Instead of storing department information repeatedly for every employee, store it in a separate department table.",
    question:
      "What is a major goal of normalization?",
    options: [
      "Increase redundancy",
      "Reduce redundancy",
      "Delete all tables",
      "Remove primary keys",
    ],
    answer: 1,
  },

  Transactions: {
    explanation:
      "A database transaction is a sequence of operations treated as a single logical unit.",
    points: [
      "ACID properties describe reliable transactions.",
      "Atomicity means all-or-nothing.",
      "Consistency maintains valid database state.",
      "Isolation controls interaction between transactions.",
    ],
    example:
      "Transfer ₹100:\nDebit account A → Credit account B\nBoth should succeed or both should fail.",
    question:
      "What does atomicity mean?",
    options: [
      "All operations succeed or none do",
      "Data is always encrypted",
      "Queries are always fast",
      "Tables cannot be changed",
    ],
    answer: 0,
  },

  Indexes: {
    explanation:
      "Database indexes improve the speed of data retrieval by providing an efficient lookup structure.",
    points: [
      "Indexes can speed up SELECT queries.",
      "They require additional storage.",
      "Too many indexes can slow INSERT and UPDATE operations.",
      "Indexes are commonly created on frequently searched columns.",
    ],
    example:
      "CREATE INDEX idx_email ON users(email);",
    question:
      "What is the main purpose of a database index?",
    options: [
      "Speed up data retrieval",
      "Delete data",
      "Encrypt passwords",
      "Create APIs",
    ],
    answer: 0,
  },

  "Node.js / Python": {
    explanation:
      "Node.js and Python are commonly used for backend development. Node.js uses JavaScript while Python is a general-purpose language.",
    points: [
      "Node.js allows JavaScript to run outside the browser.",
      "Python is widely used for web development and AI.",
      "Both can build APIs.",
      "Both have large package ecosystems.",
    ],
    example:
      "Node.js: Express\nPython: FastAPI / Django",
    question:
      "Which technology allows JavaScript to run on the server?",
    options: [
      "Node.js",
      "HTML",
      "CSS",
      "SQL",
    ],
    answer: 0,
  },

  "REST API": {
    explanation:
      "A REST API exposes application resources through HTTP endpoints.",
    points: [
      "Resources are represented using URLs.",
      "HTTP methods define operations.",
      "JSON is commonly used for data exchange.",
      "APIs separate clients from backend logic.",
    ],
    example:
      "GET /users/10\nreturns information about user 10.",
    question:
      "What is commonly exchanged by REST APIs?",
    options: [
      "JSON",
      "CSS only",
      "Images only",
      "Machine code only",
    ],
    answer: 0,
  },

  Authentication: {
    explanation:
      "Authentication verifies who a user is before granting access to protected resources.",
    points: [
      "Passwords can be used for authentication.",
      "Tokens are commonly used in APIs.",
      "Authentication answers 'Who are you?'",
      "It is different from authorization.",
    ],
    example:
      "User logs in with email and password → server verifies identity.",
    question:
      "What does authentication verify?",
    options: [
      "User identity",
      "CSS styling",
      "Database size",
      "Screen resolution",
    ],
    answer: 0,
  },

  "Database Integration": {
    explanation:
      "Database integration connects backend applications to databases so they can store and retrieve persistent data.",
    points: [
      "Applications can use SQL or ORM tools.",
      "Connections should be managed safely.",
      "Credentials should not be hardcoded.",
      "Queries should be protected from injection.",
    ],
    example:
      "Backend API → Database connection → SQL query → Response",
    question:
      "Why does a backend integrate with a database?",
    options: [
      "To persist application data",
      "To style pages",
      "To render icons",
      "To compile CSS",
    ],
    answer: 0,
  },

  "API Security": {
    explanation:
      "API security protects endpoints and data from unauthorized access and malicious requests.",
    points: [
      "Use authentication and authorization.",
      "Validate incoming input.",
      "Use HTTPS.",
      "Protect sensitive information.",
      "Rate limiting can reduce abuse.",
    ],
    example:
      "Authorization middleware checks whether a logged-in user can access /admin.",
    question:
      "Which protocol protects HTTP traffic using encryption?",
    options: [
      "HTTPS",
      "FTP",
      "SMTP",
      "HTTP only",
    ],
    answer: 0,
  },

  "Git Basics": {
    explanation:
      "Git is a distributed version control system used to track changes in source code.",
    points: [
      "git init creates a repository.",
      "git add stages changes.",
      "git commit records changes.",
      "git status shows the working tree state.",
    ],
    example:
      "git add .\ngit commit -m \"Add roadmap\"",
    question:
      "Which command creates a Git commit?",
    options: [
      "git commit",
      "git save",
      "git record",
      "git push-only",
    ],
    answer: 0,
  },

  Branches: {
    explanation:
      "Git branches allow developers to work on different features independently.",
    points: [
      "Branches isolate work.",
      "main usually contains stable shared code.",
      "Feature branches are useful for new functionality.",
      "Branches can later be merged.",
    ],
    example:
      "git checkout -b vivek-roadmap",
    question:
      "Why are Git branches useful?",
    options: [
      "To isolate development work",
      "To delete Git",
      "To install Node",
      "To run Python",
    ],
    answer: 0,
  },

  "Merge & Pull Requests": {
    explanation:
      "Merging combines changes from different branches. Pull Requests allow teams to review changes before merging.",
    points: [
      "A merge combines histories.",
      "Pull Requests support code review.",
      "Conflicts occur when changes overlap.",
      "Teams can discuss changes before merging.",
    ],
    example:
      "feature branch → Pull Request → review → main",
    question:
      "What is the purpose of a Pull Request?",
    options: [
      "Review and propose changes",
      "Install dependencies",
      "Delete a repository",
      "Start a server",
    ],
    answer: 0,
  },

  GitHub: {
    explanation:
      "GitHub is a platform for hosting Git repositories and collaborating on software projects.",
    points: [
      "Repositories contain project source code.",
      "Branches support parallel development.",
      "Pull Requests support collaboration.",
      "Issues can track bugs and tasks.",
    ],
    example:
      "git push origin vivek-roadmap",
    question:
      "What is GitHub primarily used for?",
    options: [
      "Code hosting and collaboration",
      "Only video editing",
      "Only database storage",
      "Operating system installation",
    ],
    answer: 0,
  },

  "Resume Preparation": {
    explanation:
      "A strong resume presents your skills, projects, education and achievements clearly and concisely.",
    points: [
      "Keep the resume focused and readable.",
      "Use measurable project achievements.",
      "Highlight relevant technical skills.",
      "Customize the resume for the role.",
    ],
    example:
      "Built a React + FastAPI interview platform used to practice technical interviews.",
    question:
      "What makes a project description stronger?",
    options: [
      "Measurable results",
      "Long paragraphs",
      "Unrelated hobbies",
      "Generic statements",
    ],
    answer: 0,
  },

  "Technical Interviews": {
    explanation:
      "Technical interviews evaluate problem solving, programming fundamentals, system knowledge and communication.",
    points: [
      "Understand the problem before coding.",
      "Explain your approach.",
      "Discuss complexity.",
      "Test your solution with examples.",
    ],
    example:
      "Problem → Clarify → Approach → Code → Test → Complexity",
    question:
      "What should you usually do before coding an interview problem?",
    options: [
      "Understand and clarify the problem",
      "Immediately write random code",
      "Skip examples",
      "Ignore constraints",
    ],
    answer: 0,
  },

  "HR Questions": {
    explanation:
      "HR interviews evaluate communication, motivation, teamwork, behavior and cultural fit.",
    points: [
      "Prepare a concise introduction.",
      "Use examples from your experience.",
      "Be honest and professional.",
      "Use the STAR method for behavioral questions.",
    ],
    example:
      "Situation → Task → Action → Result",
    question:
      "What does STAR stand for?",
    options: [
      "Situation, Task, Action, Result",
      "Skill, Test, Answer, Review",
      "System, Technology, API, React",
      "Start, Try, Apply, Run",
    ],
    answer: 0,
  },

  "Mock Interviews": {
    explanation:
      "Mock interviews simulate real interviews so you can practice answering questions and improve confidence.",
    points: [
      "Practice speaking clearly.",
      "Track repeated mistakes.",
      "Review technical answers.",
      "Practice time management.",
    ],
    example:
      "Question → Answer → Feedback → Improvement → Repeat",
    question:
      "What is a major benefit of mock interviews?",
    options: [
      "Practice before the real interview",
      "Avoid preparation",
      "Guarantee a job",
      "Replace all technical study",
    ],
    answer: 0,
  },

  "Company Preparation": {
    explanation:
      "Company preparation focuses your interview practice around a specific company's hiring process and expectations.",
    points: [
      "Research the company.",
      "Understand the job description.",
      "Practice common interview topics.",
      "Prepare questions for the interviewer.",
    ],
    example:
      "Company research → Role requirements → DSA → Technical → HR",
    question:
      "Why should you research a company before an interview?",
    options: [
      "To understand the role and company",
      "To avoid preparing",
      "To memorize random facts",
      "To skip technical questions",
    ],
    answer: 0,
  },
};

/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_KEY = "prepnest-roadmap-progress";

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RoadmapsPage() {
  const [completedTopics, setCompletedTopics] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(STORAGE_KEY);

        return saved
          ? JSON.parse(saved)
          : {};
      } catch {
        return {};
      }
    });

  const [selectedRoadmap, setSelectedRoadmap] =
    useState(0);

  const [selectedTopic, setSelectedTopic] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("learn");

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [quizSubmitted, setQuizSubmitted] =
    useState(false);

  /* =======================================================
     SAVE PROGRESS
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(completedTopics)
    );
  }, [completedTopics]);

  /* =======================================================
     TOTAL TOPICS
  ======================================================= */

  const totalTopics = useMemo(() => {
    return ROADMAP_DATA.reduce(
      (total, roadmap) =>
        total + roadmap.topics.length,
      0
    );
  }, []);

  const completedCount = useMemo(() => {
    return Object.values(
      completedTopics
    ).filter(Boolean).length;
  }, [completedTopics]);

  const overallProgress =
    totalTopics === 0
      ? 0
      : Math.round(
          (completedCount / totalTopics) * 100
        );

  /* =======================================================
     ROADMAP PROGRESS
  ======================================================= */

  const getRoadmapProgress = (roadmap) => {
    const completed =
      roadmap.topics.filter(
        (_, index) =>
          completedTopics[
            `${roadmap.id}-${index}`
          ]
      ).length;

    return Math.round(
      (completed / roadmap.topics.length) *
        100
    );
  };

  /* =======================================================
     TOPIC UNLOCK
  ======================================================= */

  const isTopicUnlocked = (
    roadmap,
    index
  ) => {
    if (index === 0) return true;

    return Boolean(
      completedTopics[
        `${roadmap.id}-${index - 1}`
      ]
    );
  };

  /* =======================================================
     OPEN TOPIC
  ======================================================= */

  const openTopic = (
    roadmapId,
    topicIndex
  ) => {
    const roadmap = ROADMAP_DATA.find(
      (item) => item.id === roadmapId
    );

    if (!roadmap) return;

    if (
      !isTopicUnlocked(
        roadmap,
        topicIndex
      )
    ) {
      return;
    }

    const topic =
      roadmap.topics[topicIndex];

    setSelectedTopic({
      roadmapId,
      topicIndex,
      topic,
    });

    setActiveTab("learn");
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  /* =======================================================
     TOGGLE COMPLETE
  ======================================================= */

  const markComplete = () => {
    if (!selectedTopic) return;

    const key =
      `${selectedTopic.roadmapId}-${selectedTopic.topicIndex}`;

    setCompletedTopics((previous) => ({
      ...previous,
      [key]: true,
    }));
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetProgress = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to reset all roadmap progress?"
      );

    if (!confirmed) return;

    setCompletedTopics({});
    setSelectedTopic(null);
  };

  /* =======================================================
     NEXT TOPIC
  ======================================================= */

  const goToNextTopic = () => {
    if (!selectedTopic) return;

    const roadmap =
      ROADMAP_DATA.find(
        (item) =>
          item.id ===
          selectedTopic.roadmapId
      );

    if (!roadmap) return;

    const nextIndex =
      selectedTopic.topicIndex + 1;

    if (
      nextIndex <
      roadmap.topics.length
    ) {
      openTopic(
        roadmap.id,
        nextIndex
      );

      return;
    }

    setSelectedTopic(null);
  };

  /* =======================================================
     CURRENT ROADMAP
  ======================================================= */

  const currentRoadmap =
    ROADMAP_DATA[selectedRoadmap];

  /* =======================================================
     SELECTED TOPIC CONTENT
  ======================================================= */

  const selectedContent =
    selectedTopic
      ? TOPIC_CONTENT[
          selectedTopic.topic
        ]
      : null;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

      <Sidebar activeRoute="roadmaps" />

      <div className="flex-1 flex flex-col min-w-0">

        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">

                <Map className="w-4 h-4" />

                Career Roadmap

              </div>

              <h1 className="text-2xl font-extrabold text-white mt-2">
                Your Developer Roadmap
              </h1>

              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Learn step-by-step, practice each topic,
                and track your preparation progress.
              </p>

            </div>

            <button
              onClick={resetProgress}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />

              Reset Progress

            </button>

          </div>

          {/* =================================================
              OVERALL PROGRESS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">

                    <Target className="w-5 h-5 text-indigo-400" />

                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Overall Progress
                    </p>

                    <p className="text-lg font-bold text-white">
                      {overallProgress}% Complete
                    </p>

                  </div>

                </div>

                <span className="text-sm font-bold text-indigo-400">
                  {completedCount}/{totalTopics}
                </span>

              </div>

              <div className="mt-5 h-3 bg-slate-800 rounded-full overflow-hidden">

                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />

              </div>

              <p className="text-xs text-slate-500 mt-3">
                Complete topics to unlock the next step.
              </p>

            </div>

            {/* ACHIEVEMENT */}

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20">

              <Trophy className="w-6 h-6 text-indigo-400" />

              <p className="text-xs text-slate-400 mt-4">
                Current Achievement
              </p>

              <p className="text-lg font-bold text-white mt-1">

                {overallProgress >= 80
                  ? "Roadmap Master"
                  : overallProgress >= 50
                  ? "Halfway Hero"
                  : overallProgress >= 25
                  ? "Getting Started"
                  : "Beginner"}

              </p>

              <p className="text-xs text-slate-400 mt-1">
                Keep learning and completing topics.
              </p>

            </div>

          </div>

          {/* =================================================
              ROADMAP STAGES
          ================================================= */}

          <div>

            <h2 className="text-lg font-bold text-white">
              Learning Path
            </h2>

            <p className="text-xs text-slate-500 mt-1 mb-5">
              Select a stage to view its topics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {ROADMAP_DATA.map(
                (roadmap, index) => {

                  const Icon =
                    roadmap.icon;

                  const progress =
                    getRoadmapProgress(
                      roadmap
                    );

                  const selected =
                    selectedRoadmap ===
                    index;

                  return (
                    <button
                      key={roadmap.id}
                      onClick={() =>
                        setSelectedRoadmap(
                          index
                        )
                      }
                      className={`text-left p-5 rounded-2xl border transition-all ${
                        selected
                          ? "bg-indigo-500/10 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >

                      <div className="flex items-start justify-between">

                        <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">

                          <Icon className="w-5 h-5 text-indigo-400" />

                        </div>

                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                          {roadmap.level}
                        </span>

                      </div>

                      <h3 className="text-sm font-bold text-white mt-4">
                        {roadmap.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 min-h-[36px]">
                        {roadmap.description}
                      </p>

                      <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500">

                        <span className="flex items-center gap-1">

                          <Clock className="w-3.5 h-3.5" />

                          {roadmap.duration}

                        </span>

                        <span>
                          {roadmap.topics.length} topics
                        </span>

                      </div>

                      <div className="mt-4">

                        <div className="flex justify-between text-[11px] mb-2">

                          <span className="text-slate-500">
                            Progress
                          </span>

                          <span className="text-indigo-400 font-bold">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* =================================================
              SELECTED ROADMAP TOPICS
          ================================================= */}

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold text-white">
                  {currentRoadmap.title}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {currentRoadmap.description}
                </p>

              </div>

              <div className="text-right">

                <p className="text-2xl font-extrabold text-indigo-400">
                  {getRoadmapProgress(
                    currentRoadmap
                  )}
                  %
                </p>

                <p className="text-[10px] text-slate-500">
                  Completed
                </p>

              </div>

            </div>

            <div className="mt-6 space-y-3">

              {currentRoadmap.topics.map(
                (topic, index) => {

                  const key =
                    `${currentRoadmap.id}-${index}`;

                  const completed =
                    Boolean(
                      completedTopics[key]
                    );

                  const unlocked =
                    isTopicUnlocked(
                      currentRoadmap,
                      index
                    );

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        openTopic(
                          currentRoadmap.id,
                          index
                        )
                      }
                      disabled={!unlocked}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition ${
                        completed
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : unlocked
                          ? "bg-slate-800/30 border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                          : "bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed"
                      }`}
                    >

                      {/* NUMBER / STATUS */}

                      <div
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border ${
                          completed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : unlocked
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-slate-900 border-slate-800 text-slate-700"
                        }`}
                      >

                        {completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : unlocked ? (
                          <span className="font-bold text-sm">
                            {index + 1}
                          </span>
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}

                      </div>

                      {/* TOPIC */}

                      <div className="flex-1">

                        <p
                          className={`text-sm font-semibold ${
                            completed
                              ? "text-emerald-400"
                              : "text-white"
                          }`}
                        >
                          {topic}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-1">

                          {completed
                            ? "Completed — click to review"
                            : unlocked
                            ? "Click to learn and practice"
                            : "Complete the previous topic first"}

                        </p>

                      </div>

                      {/* ACTION */}

                      {unlocked && (
                        <div className="flex items-center gap-2 text-indigo-400">

                          <BookOpen className="w-4 h-4" />

                          <ChevronRight className="w-4 h-4" />

                        </div>
                      )}

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </main>

      </div>

      {/* =====================================================
          TOPIC MODAL
      ===================================================== */}

      {selectedTopic && selectedContent && (

        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-6">

              <div className="flex items-start justify-between gap-5">

                <div>

                  <p className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                    {currentRoadmap.title}
                  </p>

                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {selectedTopic.topic}
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setSelectedTopic(null)
                  }
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>

              </div>

              {/* TABS */}

              <div className="flex gap-2 mt-5">

                <button
                  onClick={() =>
                    setActiveTab("learn")
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === "learn"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >

                  <BookOpen className="w-4 h-4" />

                  Learn

                </button>

                <button
                  onClick={() =>
                    setActiveTab("practice")
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === "practice"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >

                  <PlayCircle className="w-4 h-4" />

                  Practice

                </button>

              </div>

            </div>

            {/* =================================================
                LEARN TAB
            ================================================= */}

            {activeTab === "learn" && (

              <div className="p-6 space-y-6">

                {/* EXPLANATION */}

                <div>

                  <div className="flex items-center gap-2 mb-3">

                    <Lightbulb className="w-5 h-5 text-amber-400" />

                    <h3 className="text-sm font-bold text-white">
                      What is this?
                    </h3>

                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedContent.explanation}
                  </p>

                </div>

                {/* KEY POINTS */}

                <div>

                  <h3 className="text-sm font-bold text-white mb-3">
                    Key Points
                  </h3>

                  <div className="space-y-2">

                    {selectedContent.points.map(
                      (point, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-3 rounded-lg bg-slate-800/50"
                        >

                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />

                          <p className="text-xs text-slate-300">
                            {point}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* EXAMPLE */}

                <div>

                  <h3 className="text-sm font-bold text-white mb-3">
                    Example
                  </h3>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                    {selectedContent.example}
                  </pre>

                </div>

                {/* PRACTICE BUTTON */}

                <button
                  onClick={() => {
                    setActiveTab("practice");
                    setSelectedAnswer(null);
                    setQuizSubmitted(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition"
                >

                  Practice This Topic

                  <ArrowRight className="w-4 h-4" />

                </button>

              </div>

            )}

            {/* =================================================
                PRACTICE TAB
            ================================================= */}

            {activeTab === "practice" && (

              <div className="p-6 space-y-6">

                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">

                  <div className="flex items-center gap-2">

                    <PlayCircle className="w-5 h-5 text-indigo-400" />

                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Quick Practice
                    </p>

                  </div>

                  <h3 className="text-base font-bold text-white mt-4 leading-relaxed">
                    {selectedContent.question}
                  </h3>

                </div>

                {/* OPTIONS */}

                <div className="space-y-3">

                  {selectedContent.options.map(
                    (option, index) => {

                      const selected =
                        selectedAnswer ===
                        index;

                      const correct =
                        selectedContent.answer ===
                        index;

                      let className =
                        "border-slate-700 bg-slate-800/40 hover:border-indigo-500";

                      if (
                        quizSubmitted &&
                        correct
                      ) {
                        className =
                          "border-emerald-500/50 bg-emerald-500/10";
                      }

                      if (
                        quizSubmitted &&
                        selected &&
                        !correct
                      ) {
                        className =
                          "border-rose-500/50 bg-rose-500/10";
                      }

                      if (
                        !quizSubmitted &&
                        selected
                      ) {
                        className =
                          "border-indigo-500 bg-indigo-500/10";
                      }

                      return (
                        <button
                          key={index}
                          disabled={
                            quizSubmitted
                          }
                          onClick={() =>
                            setSelectedAnswer(
                              index
                            )
                          }
                          className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition ${className}`}
                        >

                          <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">

                            {String.fromCharCode(
                              65 + index
                            )}

                          </span>

                          <span className="text-sm text-slate-200 flex-1">
                            {option}
                          </span>

                          {quizSubmitted &&
                            correct && (
                              <Check className="w-5 h-5 text-emerald-400" />
                            )}

                          {quizSubmitted &&
                            selected &&
                            !correct && (
                              <X className="w-5 h-5 text-rose-400" />
                            )}

                        </button>
                      );
                    }
                  )}

                </div>

                {/* SUBMIT */}

                {!quizSubmitted ? (

                  <button
                    disabled={
                      selectedAnswer === null
                    }
                    onClick={() =>
                      setQuizSubmitted(
                        true
                      )
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm py-3 rounded-xl transition"
                  >
                    Check Answer
                  </button>

                ) : (

                  <div
                    className={`p-5 rounded-xl border ${
                      selectedAnswer ===
                      selectedContent.answer
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-rose-500/10 border-rose-500/30"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      {selectedAnswer ===
                      selectedContent.answer ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <X className="w-6 h-6 text-rose-400" />
                      )}

                      <div>

                        <p className="text-sm font-bold text-white">

                          {selectedAnswer ===
                          selectedContent.answer
                            ? "Correct!"
                            : "Not quite right"}

                        </p>

                        <p className="text-xs text-slate-400 mt-1">

                          {selectedAnswer ===
                          selectedContent.answer
                            ? "Great job. You can now complete this topic."
                            : `The correct answer is: ${selectedContent.options[selectedContent.answer]}`}

                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* COMPLETE */}

                {quizSubmitted &&
                  selectedAnswer ===
                    selectedContent.answer && (

                    <button
                      onClick={() => {
                        markComplete();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 rounded-xl transition"
                    >

                      <CheckCircle2 className="w-5 h-5" />

                      Mark Topic Complete

                    </button>

                  )}

                {/* NEXT */}

                {completedTopics[
                  `${selectedTopic.roadmapId}-${selectedTopic.topicIndex}`
                ] && (

                  <button
                    onClick={
                      goToNextTopic
                    }
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm py-3 rounded-xl transition"
                  >

                    Next Topic

                    <ChevronRight className="w-4 h-4" />

                  </button>

                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}