import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Users,
  Search,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  Clock3,
  UserPlus,
  Handshake,
  Award,
  TrendingUp,
  Filter,
  Bell,
  ChevronRight,
  Sparkles,
  BookOpen,
  Code2,
  Target,
  CalendarDays,
  Flame,
  Trophy,
  Globe,
  Mail,
  Video,
  MessageSquare,
  UserRound,
  Check,
  Clock,
  SlidersHorizontal,
  Hash,
  Share2,
} from "lucide-react";

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_POSTS = [
  {
    id: 1,
    author: "Rahul Sharma",
    initials: "RS",
    role: "Final Year • CSE",
    time: "12 min ago",
    category: "Placement",
    title: "How I prepared for my first technical interview",
    content:
      "I focused mainly on DSA, DBMS, OS and Computer Networks. Solving problems consistently was much more useful than trying to study everything at once.",
    likes: 42,
    comments: [
      {
        id: 101,
        author: "Priya Singh",
        initials: "PS",
        text: "How many DSA problems did you solve daily?",
      },
      {
        id: 102,
        author: "Sam Kumar",
        initials: "SK",
        text: "This is really useful. Thanks for sharing!",
      },
    ],
    tags: ["DSA", "Interview", "Placement"],
    liked: false,
    saved: false,
  },
  {
    id: 2,
    author: "Ananya Rao",
    initials: "AR",
    role: "3rd Year • IT",
    time: "38 min ago",
    category: "DSA",
    title: "Best resources for learning Dynamic Programming?",
    content:
      "I understand recursion and memoization, but I am struggling with identifying DP patterns. What resources or practice strategies worked for you?",
    likes: 31,
    comments: [
      {
        id: 201,
        author: "Arjun Das",
        initials: "AD",
        text: "Try solving one DP pattern at a time instead of random problems.",
      },
    ],
    tags: ["DSA", "Dynamic Programming"],
    liked: false,
    saved: false,
  },
  {
    id: 3,
    author: "Sameer Ranjan",
    initials: "SR",
    role: "Software Engineer • Alumni",
    time: "1 hr ago",
    category: "Career",
    title: "Ask me anything about software engineering interviews",
    content:
      "I recently went through multiple product-company interviews. Happy to help students with preparation strategies, resume tips and technical interview questions.",
    likes: 87,
    comments: [],
    tags: ["Mentorship", "Interview", "Career"],
    liked: false,
    saved: false,
  },
  {
    id: 4,
    author: "Neha Mishra",
    initials: "NM",
    role: "2nd Year • CSE",
    time: "2 hrs ago",
    category: "Study Group",
    title: "Looking for people to practice aptitude together",
    content:
      "Looking for 3–4 people who want to practice quantitative aptitude and logical reasoning together every evening.",
    likes: 24,
    comments: [],
    tags: ["Aptitude", "Study Group"],
    liked: false,
    saved: false,
  },
  {
    id: 5,
    author: "Vikash Patel",
    initials: "VP",
    role: "Final Year • ECE",
    time: "3 hrs ago",
    category: "Resume",
    title: "Can someone review my software developer resume?",
    content:
      "I am applying for frontend developer roles. I would appreciate feedback on my projects, skills section and resume structure.",
    likes: 18,
    comments: [],
    tags: ["Resume", "Frontend", "Career"],
    liked: false,
    saved: false,
  },
];

const MENTORS = [
  {
    id: 1,
    name: "Aditya Verma",
    initials: "AV",
    type: "Alumni",
    company: "Google",
    role: "Software Engineer",
    experience: "4 years",
    branch: "CSE",
    graduation: "2022",
    location: "Bengaluru",
    rating: 4.9,
    sessions: 48,
    match: 96,
    skills: ["DSA", "System Design", "Interview"],
    available: true,
    bio: "I help students prepare for product-company technical interviews and system design rounds.",
  },
  {
    id: 2,
    name: "Sneha Patel",
    initials: "SP",
    type: "Alumni",
    company: "Microsoft",
    role: "SDE II",
    experience: "5 years",
    branch: "IT",
    graduation: "2021",
    location: "Hyderabad",
    rating: 4.8,
    sessions: 36,
    match: 92,
    skills: ["React", "JavaScript", "Frontend"],
    available: true,
    bio: "Frontend engineer passionate about helping students become job-ready developers.",
  },
  {
    id: 3,
    name: "Arjun Das",
    initials: "AD",
    type: "Senior",
    company: "Amazon",
    role: "SDE Intern",
    experience: "1 year",
    branch: "CSE",
    graduation: "2025",
    location: "Chennai",
    rating: 4.7,
    sessions: 21,
    match: 89,
    skills: ["DSA", "Java", "OOP"],
    available: true,
    bio: "Final-year senior helping juniors with DSA, OOP and interview preparation.",
  },
  {
    id: 4,
    name: "Priya Nair",
    initials: "PN",
    type: "Senior",
    company: "Accenture",
    role: "Software Engineer",
    experience: "2 years",
    branch: "ECE",
    graduation: "2024",
    location: "Pune",
    rating: 4.8,
    sessions: 29,
    match: 87,
    skills: ["Aptitude", "HR Interview", "Resume"],
    available: false,
    bio: "I help students with aptitude, HR interviews and creating placement-ready resumes.",
  },
  {
    id: 5,
    name: "Karan Singh",
    initials: "KS",
    type: "Batchmate",
    company: "PrepNest",
    role: "Placement Aspirant",
    experience: "Final Year",
    branch: "CSE",
    graduation: "2026",
    location: "Bhubaneswar",
    rating: 4.6,
    sessions: 12,
    match: 84,
    skills: ["Python", "DSA", "Backend"],
    available: true,
    bio: "Looking for study partners and collaborative coding sessions.",
  },
  {
    id: 6,
    name: "Riya Mohanty",
    initials: "RM",
    type: "Batchmate",
    company: "PrepNest",
    role: "Placement Aspirant",
    experience: "Final Year",
    branch: "IT",
    graduation: "2026",
    location: "Bhubaneswar",
    rating: 4.7,
    sessions: 16,
    match: 82,
    skills: ["Java", "Aptitude", "SQL"],
    available: true,
    bio: "Preparing for software and analyst roles. Interested in group study.",
  },
];

const GROUPS = [
  {
    name: "DSA Daily",
    members: 128,
    category: "DSA",
    color: "indigo",
  },
  {
    name: "Placement 2026",
    members: 86,
    category: "Placement",
    color: "purple",
  },
  {
    name: "Aptitude Warriors",
    members: 54,
    category: "Aptitude",
    color: "emerald",
  },
  {
    name: "Frontend Developers",
    members: 71,
    category: "Development",
    color: "cyan",
  },
];

const EVENTS = [
  {
    title: "Mock Interview Night",
    date: "Sep 05",
    time: "7:00 PM",
    members: 42,
  },
  {
    title: "Resume Review Session",
    date: "Sep 08",
    time: "6:30 PM",
    members: 31,
  },
  {
    title: "DSA Problem Solving",
    date: "Sep 10",
    time: "8:00 PM",
    members: 58,
  },
];

const TRENDING = [
  ["#Placement2026", "428 discussions"],
  ["#DSAPreparation", "312 discussions"],
  ["#ResumeReview", "241 discussions"],
  ["#InterviewTips", "198 discussions"],
  ["#OffCampusJobs", "156 discussions"],
];

const CATEGORIES = [
  "All",
  "Placement",
  "DSA",
  "Career",
  "Resume",
  "Aptitude",
  "Study Group",
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("community");

  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("prepnest-community-posts");
      return saved ? JSON.parse(saved) : DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorType, setMentorType] = useState("All");
  const [mentorSkill, setMentorSkill] = useState("All");

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMentor, setShowMentor] = useState(null);
  const [showComments, setShowComments] = useState(null);

  const [newComment, setNewComment] = useState("");

  const [connectionRequests, setConnectionRequests] =
    useState([]);

  const [mentorshipRequests, setMentorshipRequests] =
    useState([]);

  const [notifications, setNotifications] = useState(3);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Placement",
    tags: "",
    anonymous: false,
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "prepnest-community-posts",
        JSON.stringify(posts)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [posts]);

  /* =======================================================
     FILTER POSTS
  ======================================================= */

  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      const text =
        `${post.title} ${post.content} ${post.author} ${
          post.tags?.join(" ") || ""
        }`.toLowerCase();

      const matchesSearch =
        !search ||
        text.includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        post.category === category ||
        post.tags?.includes(category);

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "Popular") {
      result.sort((a, b) => b.likes - a.likes);
    }

    if (sortBy === "Unanswered") {
      result = result.filter(
        (post) => post.comments.length === 0
      );
    }

    return result;
  }, [posts, search, category, sortBy]);

  /* =======================================================
     FILTER MENTORS
  ======================================================= */

  const filteredMentors = useMemo(() => {
    return MENTORS.filter((mentor) => {
      const searchText =
        `${mentor.name} ${mentor.company} ${mentor.role} ${
          mentor.skills.join(" ")
        }`.toLowerCase();

      const matchesSearch =
        !mentorSearch ||
        searchText.includes(
          mentorSearch.toLowerCase()
        );

      const matchesType =
        mentorType === "All" ||
        mentor.type === mentorType;

      const matchesSkill =
        mentorSkill === "All" ||
        mentor.skills.includes(mentorSkill);

      return (
        matchesSearch &&
        matchesType &&
        matchesSkill
      );
    });
  }, [mentorSearch, mentorType, mentorSkill]);

  /* =======================================================
     LIKE
  ======================================================= */

  const toggleLike = (id) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked
                ? post.likes - 1
                : post.likes + 1,
            }
          : post
      )
    );
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const toggleSave = (id) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              saved: !post.saved,
            }
          : post
      )
    );
  };

  /* =======================================================
     COMMENT
  ======================================================= */

  const addComment = (postId) => {
    if (!newComment.trim()) return;

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(),
                  author: "Vivek",
                  initials: "V",
                  text: newComment.trim(),
                },
              ],
            }
          : post
      )
    );

    setNewComment("");
  };

  /* =======================================================
     CREATE POST
  ======================================================= */

  const createPost = () => {
    if (
      !newPost.title.trim() ||
      !newPost.content.trim()
    ) {
      return;
    }

    const tags = newPost.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const post = {
      id: Date.now(),
      author: newPost.anonymous
        ? "Anonymous Member"
        : "Vivek",
      initials: newPost.anonymous ? "AM" : "V",
      role: newPost.anonymous
        ? "PrepNest Member"
        : "Community Member",
      time: "Just now",
      category: newPost.category,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      likes: 0,
      comments: [],
      tags:
        tags.length > 0
          ? tags
          : [newPost.category],
      liked: false,
      saved: false,
    };

    setPosts((current) => [
      post,
      ...current,
    ]);

    setNewPost({
      title: "",
      content: "",
      category: "Placement",
      tags: "",
      anonymous: false,
    });

    setShowCreatePost(false);
  };

  /* =======================================================
     CONNECTION
  ======================================================= */

  const connectWith = (mentorId) => {
    if (
      connectionRequests.includes(
        mentorId
      )
    ) {
      return;
    }

    setConnectionRequests((current) => [
      ...current,
      mentorId,
    ]);

    setNotifications(
      (current) => current + 1
    );
  };

  /* =======================================================
     MENTORSHIP
  ======================================================= */

  const requestMentorship = (mentorId) => {
    if (
      mentorshipRequests.includes(
        mentorId
      )
    ) {
      return;
    }

    setMentorshipRequests(
      (current) => [
        ...current,
        mentorId,
      ]
    );

    setNotifications(
      (current) => current + 1
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

      <Sidebar activeRoute="community" />

      <div className="flex-1 min-w-0 flex flex-col">

        <Header />

        <main className="p-5 lg:p-8 space-y-7 overflow-y-auto">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-slate-900 p-7">

            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">

                  <Users className="w-4 h-4" />

                  PrepNest Community

                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-white mt-3">
                  Learn. Connect. Grow.
                </h1>

                <p className="text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
                  Ask questions, share placement experiences,
                  connect with batchmates and get mentorship
                  from seniors and alumni.
                </p>

                <div className="flex flex-wrap gap-3 mt-5">

                  <button
                    onClick={() =>
                      setActiveTab("mentors")
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
                  >
                    <Handshake className="w-4 h-4" />
                    Find a Mentor
                  </button>

                  <button
                    onClick={() =>
                      setShowCreatePost(true)
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Start a Discussion
                  </button>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[250px]">

                <MiniStat
                  icon={Users}
                  value="2.4K"
                  label="Members"
                />

                <MiniStat
                  icon={Handshake}
                  value="186"
                  label="Connections"
                />

                <MiniStat
                  icon={MessageCircle}
                  value="1.2K"
                  label="Discussions"
                />

                <MiniStat
                  icon={Award}
                  value="94"
                  label="Mentors"
                />

              </div>

            </div>

          </section>

          {/* =================================================
              TABS
          ================================================= */}

          <div className="flex items-center justify-between gap-4 flex-wrap">

            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">

              <TabButton
                active={
                  activeTab ===
                  "community"
                }
                onClick={() =>
                  setActiveTab(
                    "community"
                  )
                }
                icon={MessageSquare}
                label="Community"
              />

              <TabButton
                active={
                  activeTab === "mentors"
                }
                onClick={() =>
                  setActiveTab("mentors")
                }
                icon={Handshake}
                label="Find Mentors"
              />

              <TabButton
                active={
                  activeTab ===
                  "connections"
                }
                onClick={() =>
                  setActiveTab(
                    "connections"
                  )
                }
                icon={Users}
                label="My Network"
              />

            </div>

            <div className="flex items-center gap-2">

              <div className="relative">

                <Bell className="w-4 h-4 text-slate-500" />

                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 text-[8px] font-black flex items-center justify-center">
                    {notifications}
                  </span>
                )}

              </div>

              <span className="text-[10px] text-slate-600">
                Community notifications
              </span>

            </div>

          </div>

          {/* =================================================
              COMMUNITY TAB
          ================================================= */}

          {activeTab === "community" && (

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              <div className="xl:col-span-2 space-y-5">

                {/* SEARCH + SORT */}

                <div className="flex flex-col md:flex-row gap-3">

                  <div className="relative flex-1">

                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search discussions, questions, people..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div className="relative">

                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value
                        )
                      }
                      className="appearance-none bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-3 text-xs text-slate-300 outline-none"
                    >
                      <option>
                        Latest
                      </option>
                      <option>
                        Popular
                      </option>
                      <option>
                        Unanswered
                      </option>
                    </select>

                  </div>

                </div>

                {/* CATEGORY FILTER */}

                <div className="flex gap-2 overflow-x-auto pb-1">

                  {CATEGORIES.map(
                    (item) => (

                      <button
                        key={item}
                        onClick={() =>
                          setCategory(item)
                        }
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap border transition ${
                          category === item
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>

                    )
                  )}

                </div>

                {/* POST LIST */}

                {filteredPosts.map(
                  (post) => (

                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() =>
                        toggleLike(
                          post.id
                        )
                      }
                      onSave={() =>
                        toggleSave(
                          post.id
                        )
                      }
                      onComment={() =>
                        setShowComments(
                          post.id
                        )
                      }
                    />

                  )
                )}

                {filteredPosts.length ===
                  0 && (
                  <EmptyState />
                )}

              </div>

              {/* RIGHT COLUMN */}

              <aside className="space-y-5">

                <TrendingCard />

                <MentorHighlight
                  onClick={() =>
                    setActiveTab(
                      "mentors"
                    )
                  }
                />

                <StudyGroups />

                <EventsCard />

              </aside>

            </div>

          )}

          {/* =================================================
              MENTORS TAB
          ================================================= */}

          {activeTab === "mentors" && (

            <section className="space-y-6">

              <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/15 to-purple-600/10 p-7">

                <div className="flex flex-col lg:flex-row justify-between gap-6">

                  <div>

                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest">

                      <Sparkles className="w-4 h-4" />

                      Smart Mentor Matching

                    </div>

                    <h2 className="text-2xl font-black text-white mt-3">
                      Find the right person to guide you
                    </h2>

                    <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
                      Connect with alumni, seniors or
                      batchmates based on your skills,
                      interests and career goals.
                    </p>

                  </div>

                  <div className="flex gap-6">

                    <div>
                      <p className="text-2xl font-black text-white">
                        94
                      </p>
                      <p className="text-[9px] uppercase text-slate-600">
                        Active mentors
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-black text-emerald-400">
                        92%
                      </p>
                      <p className="text-[9px] uppercase text-slate-600">
                        Avg match
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* MENTOR FILTERS */}

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">

                <div className="flex flex-col lg:flex-row gap-3">

                  <div className="relative flex-1">

                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />

                    <input
                      value={mentorSearch}
                      onChange={(e) =>
                        setMentorSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search mentor, company, role or skill..."
                      className="w-full bg-slate-800/70 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                    />

                  </div>

                  <select
                    value={mentorType}
                    onChange={(e) =>
                      setMentorType(
                        e.target.value
                      )
                    }
                    className="bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none"
                  >
                    <option>
                      All People
                    </option>
                    <option>
                      Alumni
                    </option>
                    <option>
                      Senior
                    </option>
                    <option>
                      Batchmate
                    </option>
                  </select>

                  <select
                    value={mentorSkill}
                    onChange={(e) =>
                      setMentorSkill(
                        e.target.value
                      )
                    }
                    className="bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none"
                  >
                    <option>
                      All Skills
                    </option>
                    <option>
                      DSA
                    </option>
                    <option>
                      React
                    </option>
                    <option>
                      JavaScript
                    </option>
                    <option>
                      Resume
                    </option>
                    <option>
                      Aptitude
                    </option>
                    <option>
                      Interview
                    </option>
                  </select>

                </div>

              </div>

              {/* MENTOR CARDS */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {filteredMentors.map(
                  (mentor) => (

                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      connected={connectionRequests.includes(
                        mentor.id
                      )}
                      requested={mentorshipRequests.includes(
                        mentor.id
                      )}
                      onConnect={() =>
                        connectWith(
                          mentor.id
                        )
                      }
                      onMentorship={() =>
                        requestMentorship(
                          mentor.id
                        )
                      }
                      onProfile={() =>
                        setShowMentor(
                          mentor
                        )
                      }
                    />

                  )
                )}

              </div>

              {filteredMentors.length ===
                0 && (
                <EmptyState text="No mentors found. Try a different search or filter." />
              )}

            </section>

          )}

          {/* =================================================
              NETWORK
          ================================================= */}

          {activeTab === "connections" && (

            <section className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <NetworkStat
                  icon={Users}
                  value={
                    connectionRequests.length
                  }
                  label="Connections"
                />

                <NetworkStat
                  icon={Clock}
                  value={
                    mentorshipRequests.length
                  }
                  label="Pending mentorship"
                />

                <NetworkStat
                  icon={Handshake}
                  value="12"
                  label="Completed sessions"
                />

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <NetworkPanel
                  title="Your Connections"
                  icon={Users}
                >

                  {connectionRequests.length ===
                    0 ? (

                    <NetworkEmpty
                      text="You haven't connected with anyone yet."
                      onClick={() =>
                        setActiveTab(
                          "mentors"
                        )
                      }
                    />

                  ) : (

                    MENTORS.filter(
                      (mentor) =>
                        connectionRequests.includes(
                          mentor.id
                        )
                    ).map((mentor) => (
                      <ConnectionRow
                        key={mentor.id}
                        mentor={mentor}
                        status="Connected"
                      />
                    ))

                  )}

                </NetworkPanel>

                <NetworkPanel
                  title="Mentorship Requests"
                  icon={Handshake}
                >

                  {mentorshipRequests.length ===
                    0 ? (

                    <NetworkEmpty
                      text="No mentorship requests yet."
                      onClick={() =>
                        setActiveTab(
                          "mentors"
                        )
                      }
                    />

                  ) : (

                    MENTORS.filter(
                      (mentor) =>
                        mentorshipRequests.includes(
                          mentor.id
                        )
                    ).map((mentor) => (
                      <ConnectionRow
                        key={mentor.id}
                        mentor={mentor}
                        status="Request Sent"
                      />
                    ))

                  )}

                </NetworkPanel>

              </div>

              {/* NETWORK TIPS */}

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">

                    <Target className="w-5 h-5 text-indigo-400" />

                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-white">
                      Build your professional network
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-1">
                      Connect with people who can help you
                      reach your placement goals.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                  <Tip
                    icon={UserPlus}
                    title="Connect"
                    text="Build meaningful professional connections."
                  />

                  <Tip
                    icon={MessageCircle}
                    title="Start conversations"
                    text="Ask specific questions and share experiences."
                  />

                  <Tip
                    icon={Award}
                    title="Give back"
                    text="Help other students with what you learn."
                  />

                </div>

              </div>

            </section>

          )}

        </main>

      </div>

      {/* =====================================================
          CREATE POST MODAL
      ===================================================== */}

      {showCreatePost && (
        <Modal
          title="Create a Community Post"
          onClose={() =>
            setShowCreatePost(false)
          }
        >

          <div className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Field label="Category">

                <select
                  value={newPost.category}
                  onChange={(e) =>
                    setNewPost({
                      ...newPost,
                      category:
                        e.target.value,
                    })
                  }
                  className="input-style"
                >
                  {CATEGORIES.filter(
                    (x) => x !== "All"
                  ).map((item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ))}
                </select>

              </Field>

              <Field label="Tags">

                <input
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost({
                      ...newPost,
                      tags: e.target.value,
                    })
                  }
                  placeholder="DSA, Interview, Java"
                  className="input-style"
                />

              </Field>

            </div>

            <Field label="Title">

              <input
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    title: e.target.value,
                  })
                }
                placeholder="What would you like to discuss?"
                className="input-style"
              />

            </Field>

            <Field label="Description">

              <textarea
                rows={6}
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    content:
                      e.target.value,
                  })
                }
                placeholder="Share your question, experience or advice..."
                className="input-style resize-none"
              />

            </Field>

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={newPost.anonymous}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    anonymous:
                      e.target.checked,
                  })
                }
                className="accent-indigo-600"
              />

              <span className="text-xs text-slate-400">
                Post anonymously
              </span>

            </label>

            <button
              onClick={createPost}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold"
            >
              Publish Discussion
            </button>

          </div>

        </Modal>
      )}

      {/* =====================================================
          COMMENTS MODAL
      ===================================================== */}

      {showComments && (
        <Modal
          title="Discussion"
          onClose={() =>
            setShowComments(null)
          }
        >

          {(() => {
            const post = posts.find(
              (item) =>
                item.id === showComments
            );

            if (!post) return null;

            return (
              <div className="space-y-5">

                <div>

                  <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
                    {post.category}
                  </span>

                  <h3 className="text-base font-black text-white mt-3">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {post.content}
                  </p>

                </div>

                <div className="border-t border-slate-800 pt-4">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-4">
                    {post.comments.length} Comments
                  </p>

                  <div className="space-y-3 max-h-64 overflow-y-auto">

                    {post.comments.length ===
                      0 && (
                      <p className="text-xs text-slate-600 text-center py-8">
                        No comments yet. Start the discussion.
                      </p>
                    )}

                    {post.comments.map(
                      (comment) => (

                        <div
                          key={comment.id}
                          className="flex gap-3"
                        >

                          <Avatar
                            initials={
                              comment.initials
                            }
                            small
                          />

                          <div className="flex-1 p-3 rounded-xl bg-slate-800/60">

                            <p className="text-[10px] font-bold text-white">
                              {comment.author}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {comment.text}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                <div className="flex gap-2">

                  <input
                    value={newComment}
                    onChange={(e) =>
                      setNewComment(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        addComment(
                          post.id
                        );
                      }
                    }}
                    placeholder="Write a comment..."
                    className="input-style"
                  />

                  <button
                    onClick={() =>
                      addComment(
                        post.id
                      )
                    }
                    className="w-11 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })()}

        </Modal>
      )}

      {/* =====================================================
          MENTOR PROFILE MODAL
      ===================================================== */}

      {showMentor && (
        <MentorProfileModal
          mentor={showMentor}
          connected={connectionRequests.includes(
            showMentor.id
          )}
          requested={mentorshipRequests.includes(
            showMentor.id
          )}
          onClose={() =>
            setShowMentor(null)
          }
          onConnect={() =>
            connectWith(
              showMentor.id
            )
          }
          onMentorship={() =>
            requestMentorship(
              showMentor.id
            )
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   POST CARD
========================================================= */

function PostCard({
  post,
  onLike,
  onSave,
  onComment,
}) {
  return (
    <article className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition overflow-hidden">

      <div className="p-6">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <Avatar
              initials={post.initials}
            />

            <div>

              <div className="flex items-center gap-2">

                <p className="text-sm font-bold text-white">
                  {post.author}
                </p>

                {post.author !==
                  "Anonymous Member" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                )}

              </div>

              <p className="text-[10px] text-slate-600 mt-1">
                {post.role} • {post.time}
              </p>

            </div>

          </div>

          <button className="text-slate-600 hover:text-white">

            <MoreHorizontal className="w-4 h-4" />

          </button>

        </div>

        <div className="mt-5">

          <div className="flex items-center gap-2">

            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
              {post.category}
            </span>

            {post.comments.length ===
              0 && (
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[9px] font-bold">
                Unanswered
              </span>
            )}

          </div>

          <h3 className="text-base font-black text-white mt-3">
            {post.title}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            {post.content}
          </p>

        </div>

        <div className="flex flex-wrap gap-2 mt-4">

          {post.tags.map(
            (tag) => (

              <span
                key={tag}
                className="flex items-center gap-1 text-[9px] text-slate-500"
              >
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>

            )
          )}

        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">

          <div className="flex items-center gap-5">

            <button
              onClick={onLike}
              className={`flex items-center gap-2 text-[10px] font-bold transition ${
                post.liked
                  ? "text-rose-400"
                  : "text-slate-500 hover:text-rose-400"
              }`}
            >

              <Heart
                className={`w-4 h-4 ${
                  post.liked
                    ? "fill-current"
                    : ""
                }`}
              />

              {post.likes}

            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-400"
            >

              <MessageCircle className="w-4 h-4" />

              {post.comments.length}

            </button>

            <button className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-400">

              <Share2 className="w-4 h-4" />

              Share

            </button>

          </div>

          <button
            onClick={onSave}
            className={`${
              post.saved
                ? "text-indigo-400"
                : "text-slate-600 hover:text-white"
            }`}
          >

            <Bookmark
              className={`w-4 h-4 ${
                post.saved
                  ? "fill-current"
                  : ""
              }`}
            />

          </button>

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   MENTOR CARD
========================================================= */

function MentorCard({
  mentor,
  connected,
  requested,
  onConnect,
  onMentorship,
  onProfile,
}) {
  return (
    <div className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition overflow-hidden">

      <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="p-5">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="relative">

              <Avatar
                initials={mentor.initials}
              />

              {mentor.available && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              )}

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="text-sm font-bold text-white">
                  {mentor.name}
                </h3>

              </div>

              <p className="text-[10px] text-slate-500 mt-1">
                {mentor.role}
              </p>

            </div>

          </div>

          <div className="text-right">

            <p className="text-[8px] uppercase font-bold text-slate-600">
              Match
            </p>

            <p className="text-sm font-black text-emerald-400">
              {mentor.match}%
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3 mt-5 text-[10px] text-slate-500">

          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {mentor.company}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {mentor.location}
          </span>

        </div>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">

          <span className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {mentor.graduation}
          </span>

          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {mentor.rating}
          </span>

          <span>
            {mentor.sessions} sessions
          </span>

        </div>

        <div className="flex flex-wrap gap-2 mt-4">

          {mentor.skills.map(
            (skill) => (

              <span
                key={skill}
                className="px-2 py-1 rounded-lg bg-slate-800 text-[9px] text-slate-400"
              >
                {skill}
              </span>

            )
          )}

        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">

          <button
            onClick={onProfile}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
          >
            View Profile
          </button>

          <button
            onClick={onConnect}
            disabled={connected}
            className={`py-2.5 rounded-xl text-[10px] font-bold ${
              connected
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {connected
              ? "Connected"
              : "Connect"}
          </button>

        </div>

        <button
          onClick={onMentorship}
          disabled={requested}
          className={`w-full mt-2 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold ${
            requested
              ? "bg-purple-500/10 text-purple-400"
              : "bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20"
          }`}
        >

          {requested ? (
            <>
              <Clock3 className="w-3.5 h-3.5" />
              Mentorship Requested
            </>
          ) : (
            <>
              <Handshake className="w-3.5 h-3.5" />
              Request Mentorship
            </>
          )}

        </button>

      </div>

    </div>
  );
}

/* =========================================================
   MENTOR PROFILE MODAL
========================================================= */

function MentorProfileModal({
  mentor,
  connected,
  requested,
  onClose,
  onConnect,
  onMentorship,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-5">

      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">

        <div className="h-28 bg-gradient-to-r from-indigo-600/40 to-purple-600/30 relative">

          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-9 h-9 rounded-xl bg-slate-950/50 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        <div className="px-6 pb-6">

          <div className="-mt-10 flex items-end justify-between">

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 border-4 border-slate-900 flex items-center justify-center text-xl font-black">
              {mentor.initials}
            </div>

            <span className="mb-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
              {mentor.match}% Match
            </span>

          </div>

          <h2 className="text-xl font-black text-white mt-4">
            {mentor.name}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {mentor.role} at {mentor.company}
          </p>

          <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-slate-500">

            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {mentor.location}
            </span>

            <span className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {mentor.branch} • {mentor.graduation}
            </span>

            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {mentor.rating}
            </span>

          </div>

          <div className="mt-6">

            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              About
            </p>

            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              {mentor.bio}
            </p>

          </div>

          <div className="mt-5">

            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Expertise
            </p>

            <div className="flex flex-wrap gap-2 mt-3">

              {mentor.skills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-[9px] text-slate-300"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">

            <button
              onClick={onConnect}
              disabled={connected}
              className={`py-3 rounded-xl text-xs font-bold ${
                connected
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {connected
                ? "✓ Connected"
                : "Connect"}
            </button>

            <button
              onClick={onMentorship}
              disabled={requested}
              className={`py-3 rounded-xl text-xs font-bold ${
                requested
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {requested
                ? "Request Sent"
                : "Request Mentorship"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   TRENDING
========================================================= */

function TrendingCard() {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <div className="flex items-center gap-2">

        <Flame className="w-4 h-4 text-orange-400" />

        <h3 className="text-sm font-bold text-white">
          Trending
        </h3>

      </div>

      <div className="space-y-4 mt-5">

        {TRENDING.map(
          ([topic, count], index) => (

            <div
              key={topic}
              className="flex items-center gap-3"
            >

              <span className="text-[9px] text-slate-700 font-black">
                0{index + 1}
              </span>

              <div className="flex-1">

                <p className="text-xs font-bold text-slate-300">
                  {topic}
                </p>

                <p className="text-[9px] text-slate-600 mt-1">
                  {count}
                </p>

              </div>

              <ChevronRight className="w-3 h-3 text-slate-700" />

            </div>

          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   MENTOR HIGHLIGHT
========================================================= */

function MentorHighlight({ onClick }) {
  return (
    <div className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/5">

      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">

        <GraduationCap className="w-5 h-5 text-purple-400" />

      </div>

      <h3 className="text-sm font-bold text-white mt-4">
        Need career guidance?
      </h3>

      <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
        Get guidance from alumni and seniors who have already experienced the placement journey.
      </p>

      <button
        onClick={onClick}
        className="w-full mt-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-bold"
      >
        Find Your Mentor
      </button>

    </div>
  );
}

/* =========================================================
   STUDY GROUPS
========================================================= */

function StudyGroups() {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <BookOpen className="w-4 h-4 text-indigo-400" />

          <h3 className="text-sm font-bold text-white">
            Study Groups
          </h3>

        </div>

        <button className="text-[9px] text-indigo-400 font-bold">
          View all
        </button>

      </div>

      <div className="space-y-3 mt-4">

        {GROUPS.map(
          (group) => (

            <div
              key={group.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition"
            >

              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">

                <Users className="w-4 h-4 text-indigo-400" />

              </div>

              <div className="flex-1">

                <p className="text-[10px] font-bold text-slate-300">
                  {group.name}
                </p>

                <p className="text-[9px] text-slate-600 mt-1">
                  {group.members} members
                </p>

              </div>

              <ChevronRight className="w-3 h-3 text-slate-700" />

            </div>

          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   EVENTS
========================================================= */

function EventsCard() {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <div className="flex items-center gap-2">

        <CalendarDays className="w-4 h-4 text-emerald-400" />

        <h3 className="text-sm font-bold text-white">
          Upcoming Events
        </h3>

      </div>

      <div className="space-y-3 mt-4">

        {EVENTS.map(
          (event) => (

            <div
              key={event.title}
              className="flex gap-3"
            >

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center">

                <span className="text-[8px] font-bold text-emerald-400">
                  {event.date}
                </span>

              </div>

              <div className="flex-1">

                <p className="text-[10px] font-bold text-slate-300">
                  {event.title}
                </p>

                <p className="text-[9px] text-slate-600 mt-1">
                  {event.time} • {event.members} joined
                </p>

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   NETWORK
========================================================= */

function NetworkStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <Icon className="w-5 h-5 text-indigo-400" />

      <p className="text-2xl font-black text-white mt-4">
        {value}
      </p>

      <p className="text-[9px] uppercase text-slate-600 tracking-wider mt-1">
        {label}
      </p>

    </div>
  );
}

function NetworkPanel({
  title,
  icon: Icon,
  children,
}) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <div className="flex items-center gap-2 mb-5">

        <Icon className="w-4 h-4 text-indigo-400" />

        <h3 className="text-sm font-bold text-white">
          {title}
        </h3>

      </div>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  );
}

function ConnectionRow({
  mentor,
  status,
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">

      <Avatar
        initials={mentor.initials}
        small
      />

      <div className="flex-1">

        <p className="text-xs font-bold text-white">
          {mentor.name}
        </p>

        <p className="text-[9px] text-slate-600 mt-1">
          {mentor.role} • {mentor.company}
        </p>

      </div>

      <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8px] font-bold">
        {status}
      </span>

    </div>
  );
}

function NetworkEmpty({
  text,
  onClick,
}) {
  return (
    <div className="py-10 text-center">

      <Users className="w-7 h-7 mx-auto text-slate-700" />

      <p className="text-xs text-slate-500 mt-3">
        {text}
      </p>

      <button
        onClick={onClick}
        className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-[9px] font-bold"
      >
        Find People
      </button>

    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MiniStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">

      <Icon className="w-4 h-4 text-indigo-400" />

      <p className="text-xl font-black text-white mt-3">
        {value}
      </p>

      <p className="text-[8px] text-slate-600 uppercase tracking-wider">
        {label}
      </p>

    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-500 hover:text-white"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function Avatar({
  initials,
  small = false,
}) {
  return (
    <div
      className={`shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white ${
        small
          ? "w-9 h-9 text-[9px]"
          : "w-11 h-11 text-xs"
      }`}
    >
      {initials}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-5">

      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-slate-900 border-b border-slate-800">

          <h2 className="text-base font-black text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        <div className="p-5">
          {children}
        </div>

      </div>

    </div>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <div>

      <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
        {label}
      </label>

      <div className="mt-2">
        {children}
      </div>

    </div>
  );
}

function EmptyState({
  text = "No discussions found.",
}) {
  return (
    <div className="py-20 text-center rounded-2xl bg-slate-900/50 border border-slate-800">

      <Search className="w-8 h-8 mx-auto text-slate-700" />

      <p className="text-sm font-bold text-slate-400 mt-4">
        {text}
      </p>

      <p className="text-xs text-slate-600 mt-2">
        Try changing your search or filters.
      </p>

    </div>
  );
}

function Tip({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/40">

      <Icon className="w-4 h-4 text-indigo-400" />

      <p className="text-xs font-bold text-slate-300 mt-3">
        {title}
      </p>

      <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">
        {text}
      </p>

    </div>
  );
}