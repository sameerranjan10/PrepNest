import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BlurDrop } from "@/components/ui/BlurDrop";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { UserAvatar } from "@/components/UserAvatar";
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
  Loader2,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Placement",
  "DSA",
  "Career",
  "Resume",
  "Aptitude",
  "Study Group",
];

function formatRelativeTime(isoString) {
  if (!isoString) return "Recently";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "Recently";
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("community");

  const [posts, setPosts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState({
    members: 0,
    connections: 0,
    discussions: 0,
    mentors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [notifications, setNotifications] = useState(0);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Placement",
    tags: "",
    anonymous: false,
  });

  const loadCommunityData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [overviewRes, postsRes, mentorsRes] = await Promise.all([
        apiFetch("/api/community/overview"),
        apiFetch("/api/community/posts"),
        apiFetch("/api/community/mentors"),
      ]);

      if (!overviewRes.ok || !postsRes.ok || !mentorsRes.ok) {
        throw new Error("Failed to load community records");
      }

      const [overviewData, postsData, mentorsData] = await Promise.all([
        overviewRes.json(),
        postsRes.json(),
        mentorsRes.json(),
      ]);

      setStats(overviewData.stats || { members: 0, connections: 0, discussions: 0, mentors: 0 });
      setGroups(overviewData.groups || []);
      setEvents(overviewData.events || []);
      setTrending(overviewData.trending || []);
      setPosts(
        (postsData.posts || []).map((p) => ({
          ...p,
          time: formatRelativeTime(p.created_at),
        }))
      );
      setMentors(mentorsData.mentors || []);
      setConnectionRequests(mentorsData.connected_ids || []);
      setMentorshipRequests(mentorsData.mentorship_ids || []);
      setNotifications((mentorsData.mentorship_ids || []).length);
    } catch (err) {
      console.error("Community load failed:", err);
      setLoadError("Unable to load community discussions and peers from the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunityData();
  }, [user?.id, loadCommunityData]);

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
    return mentors.filter((mentor) => {
      const searchText =
        `${mentor.name} ${mentor.company} ${mentor.role} ${
          (mentor.skills || []).join(" ")
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
        (mentor.skills || []).includes(mentorSkill);

      return (
        matchesSearch &&
        matchesType &&
        matchesSkill
      );
    });
  }, [mentors, mentorSearch, mentorType, mentorSkill]);

  const toggleLike = async (id) => {
    try {
      const res = await apiFetch(`/api/community/posts/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts((current) =>
          current.map((post) =>
            post.id === id ? { ...post, liked: data.liked, likes: data.likes } : post
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleSave = async (id) => {
    try {
      const res = await apiFetch(`/api/community/posts/${id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts((current) =>
          current.map((post) =>
            post.id === id ? { ...post, saved: data.saved } : post
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const addComment = async (postId) => {
    if (!newComment.trim()) return;
    try {
      const res = await apiFetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (res.ok) {
        const savedComment = await res.json();
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, savedComment] }
              : post
          )
        );
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    const tags = newPost.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const res = await apiFetch("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          category: newPost.category,
          tags,
          is_anonymous: newPost.anonymous,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setPosts((current) => [
          { ...created, time: formatRelativeTime(created.created_at) },
          ...current,
        ]);
        setStats((s) => ({ ...s, discussions: s.discussions + 1 }));
        setNewPost({
          title: "",
          content: "",
          category: "Placement",
          tags: "",
          anonymous: false,
        });
        setShowCreatePost(false);
      }
    } catch (err) {
      console.error("Failed to create discussion:", err);
    }
  };

  const connectWith = async (mentorId) => {
    if (connectionRequests.includes(mentorId)) return;
    try {
      const res = await apiFetch(`/api/community/connections/${mentorId}`, {
        method: "POST",
        body: JSON.stringify({ relation_type: "connect" }),
      });
      if (res.ok) {
        setConnectionRequests((current) => [...current, mentorId]);
        setStats((s) => ({ ...s, connections: s.connections + 1 }));
      }
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  const requestMentorship = async (mentorId) => {
    if (mentorshipRequests.includes(mentorId)) return;
    try {
      const res = await apiFetch(`/api/community/connections/${mentorId}`, {
        method: "POST",
        body: JSON.stringify({ relation_type: "mentorship" }),
      });
      if (res.ok) {
        setMentorshipRequests((current) => [...current, mentorId]);
        setNotifications((current) => current + 1);
      }
    } catch (err) {
      console.error("Failed to request mentorship:", err);
    }
  };

  const handleToggleGroupJoin = async (groupId) => {
    try {
      const res = await apiFetch(`/api/community/groups/${groupId}/toggle-join`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, is_joined: data.is_joined, members: data.members } : g
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle group:", err);
    }
  };

  const handleToggleEventRsvp = async (eventId) => {
    try {
      const res = await apiFetch(`/api/community/events/${eventId}/toggle-rsvp`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === eventId ? { ...ev, is_rsvped: data.is_rsvped, members: data.members } : ev
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle event RSVP:", err);
    }
  };

  const avgMentorMatch = useMemo(() => {
    if (!mentors.length) return 0;
    return Math.round(
      mentors.reduce((acc, m) => acc + Number(m.match || 0), 0) / mentors.length
    );
  }, [mentors]);

  const joinedActivitiesCount = useMemo(
    () =>
      groups.filter((g) => g.is_joined).length +
      events.filter((e) => e.is_rsvped).length,
    [groups, events]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">

      <Sidebar activeRoute="community" />

      <div className="flex-1 min-w-0 flex flex-col">

        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-4 lg:p-6 space-y-6 overflow-y-auto">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-xs">

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 text-[#FFA116] text-xs font-bold uppercase tracking-wider">

                  <Users className="w-4 h-4 text-[#FFA116]" />

                  PrepNest Community

                </div>

                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#262626] mt-2">
                  Learn. Connect. Grow.
                </h1>

                <p className="text-xs text-[#64748B] mt-2 max-w-2xl leading-relaxed">
                  Ask questions, share placement experiences, connect with batchmates and get mentorship from seniors and alumni.
                </p>

                <div className="flex flex-wrap gap-2.5 mt-5">

                  <button
                    onClick={() =>
                      setActiveTab("mentors")
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFA116] hover:bg-[#FFA116]/90 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Handshake className="w-4 h-4" />
                    Find a Mentor
                  </button>

                  <button
                    onClick={() =>
                      setShowCreatePost(true)
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E5E7EB] text-xs font-semibold text-[#262626] transition"
                  >
                    <Plus className="w-4 h-4 text-[#64748B]" />
                    Start a Discussion
                  </button>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[240px]">

                <MiniStat
                  icon={Users}
                  value={stats.members}
                  label="Members"
                />

                <MiniStat
                  icon={Handshake}
                  value={stats.connections}
                  label="Connections"
                />

                <MiniStat
                  icon={MessageCircle}
                  value={stats.discussions}
                  label="Discussions"
                />

                <MiniStat
                  icon={Award}
                  value={stats.mentors}
                  label="Peers & Mentors"
                />

              </div>

            </div>

          </section>

          {/* =================================================
              TABS
          ================================================= */}

          <div className="flex items-center justify-between gap-4 flex-wrap">

            <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xs">

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

            <div className="flex items-center gap-2 text-xs text-[#64748B]">

              <div className="relative">

                <Bell className="w-4 h-4 text-[#64748B]" />

                {notifications > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#DC2626] text-[9px] font-bold text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}

              </div>

              <span className="text-[11px] text-[#64748B]">
                Community notifications
              </span>

            </div>

          </div>

          {/* =================================================
              COMMUNITY TAB
          ================================================= */}

          {/* =================================================
              COMMUNITY TAB
          ================================================= */}

          {loadError && !loading && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/25 text-xs text-[#DC2626] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loadError}</span>
              </div>
              <button
                type="button"
                onClick={loadCommunityData}
                className="font-semibold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="p-12 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] flex flex-col items-center justify-center gap-2 text-xs text-[#64748B]">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFA116]" />
              <span>Loading community discussions, peers, and study groups...</span>
            </div>
          ) : (
            activeTab === "community" && (

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              <div className="xl:col-span-2 space-y-5">

                {/* SEARCH + SORT */}

                <div className="flex flex-col md:flex-row gap-3">

                  <div className="relative flex-1">

                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search discussions, questions, people..."
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#262626] placeholder-[#64748B]/60 outline-none focus:border-[#FFA116] transition shadow-xs"
                    />

                  </div>

                  <div className="relative">

                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value
                        )
                      }
                      className="appearance-none bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg pl-9 pr-8 py-2.5 text-xs text-[#262626] outline-none focus:border-[#FFA116] transition shadow-xs font-medium"
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
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition ${
                          category === item
                            ? "bg-[#FFF8EE] border-[#FFA116] text-[#FFA116]"
                            : "bg-[#FFFFFF] border-[#E5E7EB] text-[#64748B] hover:text-[#262626] hover:border-[#CBD5E1]"
                        }`}
                      >
                        {item}
                      </button>

                    )
                  )}

                </div>

                {/* POST LIST */}

                <div className="space-y-4">
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

              </div>

              {/* RIGHT COLUMN */}

              <aside className="space-y-5">

                <TrendingCard
                  trending={trending}
                  onSelectTag={(tag) => setSearch(tag)}
                />

                <MentorHighlight
                  onClick={() =>
                    setActiveTab(
                      "mentors"
                    )
                  }
                />

                <StudyGroups
                  groups={groups}
                  onToggleJoin={handleToggleGroupJoin}
                />

                <EventsCard
                  events={events}
                  onToggleRsvp={handleToggleEventRsvp}
                />

              </aside>

            </div>

          )
          )}

          {/* =================================================
              MENTORS TAB
          ================================================= */}

          {activeTab === "mentors" && (

            <section className="space-y-6">

              <div className="rounded-xl border border-[#FFA116]/30 bg-[#FFF8EE] p-6 shadow-xs">

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

                  <div>

                    <div className="flex items-center gap-2 text-[#D97706] text-xs font-bold uppercase tracking-wider">

                      <Sparkles className="w-4 h-4 text-[#FFA116]" />

                      Smart Mentor Matching

                    </div>

                    <h2 className="text-xl lg:text-2xl font-extrabold text-[#262626] mt-2">
                      Find the right person to guide you
                    </h2>

                    <p className="text-xs text-[#64748B] mt-1 max-w-xl leading-relaxed">
                      Connect with alumni, seniors or batchmates based on your skills, interests and career goals.
                    </p>

                  </div>

                  <div className="flex gap-6">

                    <div>
                      <p className="text-2xl font-extrabold text-[#262626]">
                        {mentors.length}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-[#64748B]">
                        Active mentors
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-extrabold text-[#16A34A]">
                        {avgMentorMatch}%
                      </p>
                      <p className="text-[10px] uppercase font-bold text-[#64748B]">
                        Avg match
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* MENTOR FILTERS */}

              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

                <div className="flex flex-col lg:flex-row gap-3">

                  <div className="relative flex-1">

                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />

                    <input
                      value={mentorSearch}
                      onChange={(e) =>
                        setMentorSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search mentor, company, role or skill..."
                      className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#262626] placeholder-[#64748B]/60 outline-none focus:border-[#FFA116] transition"
                    />

                  </div>

                  <select
                    value={mentorType}
                    onChange={(e) =>
                      setMentorType(
                        e.target.value
                      )
                    }
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-xs text-[#262626] outline-none focus:border-[#FFA116] transition font-medium"
                  >
                    <option value="All">
                      All People
                    </option>
                    <option value="Alumni">
                      Alumni
                    </option>
                    <option value="Senior">
                      Senior
                    </option>
                    <option value="Batchmate">
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
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-xs text-[#262626] outline-none focus:border-[#FFA116] transition font-medium"
                  >
                    <option value="All">
                      All Skills
                    </option>
                    <option value="DSA">
                      DSA
                    </option>
                    <option value="React">
                      React
                    </option>
                    <option value="JavaScript">
                      JavaScript
                    </option>
                    <option value="Python">
                      Python
                    </option>
                    <option value="Resume">
                      Resume
                    </option>
                    <option value="Aptitude">
                      Aptitude
                    </option>
                    <option value="Interview">
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
                  value={joinedActivitiesCount}
                  label="Groups & Events Joined"
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

                    mentors.filter(
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

                    mentors.filter(
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

              <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-[#FFF8EE] flex items-center justify-center">

                    <Target className="w-5 h-5 text-[#FFA116]" />

                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-[#262626]">
                      Build your professional network
                    </h3>

                    <p className="text-xs text-[#64748B] mt-0.5">
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

        </BlurDrop>

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

          <div className="space-y-4">

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
                  className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116] transition"
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
                  className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-[#262626] placeholder-[#64748B]/60 focus:outline-none focus:border-[#FFA116] transition"
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
                className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-[#262626] placeholder-[#64748B]/60 focus:outline-none focus:border-[#FFA116] transition"
              />

            </Field>

            <Field label="Description">

              <textarea
                rows={5}
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    content:
                      e.target.value,
                  })
                }
                placeholder="Share your question, experience or advice..."
                className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-[#262626] placeholder-[#64748B]/60 focus:outline-none focus:border-[#FFA116] transition resize-none"
              />

            </Field>

            <label className="flex items-center gap-2.5 cursor-pointer">

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
                className="accent-[#FFA116] rounded"
              />

              <span className="text-xs text-[#64748B]">
                Post anonymously
              </span>

            </label>

            <button
              onClick={createPost}
              className="w-full py-2.5 rounded-lg bg-[#FFA116] hover:bg-[#FFA116]/90 text-white text-xs font-bold shadow-xs transition"
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
              <div className="space-y-4">

                <div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8EE] text-[#FFA116] text-[10px] font-bold">
                    {post.category}
                  </span>

                  <h3 className="text-base font-bold text-[#262626] mt-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    {post.content}
                  </p>

                </div>

                <div className="border-t border-[#E5E7EB] pt-4">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] mb-3">
                    {post.comments.length} Comments
                  </p>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">

                    {post.comments.length ===
                      0 && (
                      <p className="text-xs text-[#64748B] text-center py-6">
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
                            initials={comment.initials}
                            avatarUrl={comment.author_avatar}
                            userId={comment.user_id}
                            name={comment.author}
                            small
                          />

                          <div className="flex-1 p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">

                            <p className="text-xs font-bold text-[#262626]">
                              {comment.author}
                            </p>

                            <p className="text-xs text-[#64748B] mt-1">
                              {comment.text}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                <div className="flex gap-2 pt-2">

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
                    className="flex-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-[#262626] placeholder-[#64748B]/60 focus:outline-none focus:border-[#FFA116] transition"
                  />

                  <button
                    onClick={() =>
                      addComment(
                        post.id
                      )
                    }
                    className="w-10 shrink-0 rounded-lg bg-[#FFA116] hover:bg-[#FFA116]/90 text-white flex items-center justify-center transition shadow-xs"
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
    <article className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/40 transition shadow-xs overflow-hidden">

      <div className="p-5">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <Avatar
              initials={post.initials}
              avatarUrl={post.author_avatar}
              userId={post.user_id}
              isAnonymous={post.is_anonymous}
              name={post.author}
            />

            <div>

              <div className="flex items-center gap-1.5">

                <p className="text-xs font-bold text-[#262626]">
                  {post.author}
                </p>

                {post.author !==
                  "Anonymous Member" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                )}

              </div>

              <p className="text-[11px] text-[#64748B]">
                {post.role} • {post.time}
              </p>

            </div>

          </div>

          <button className="text-[#64748B] hover:text-[#262626] p-1">

            <MoreHorizontal className="w-4 h-4" />

          </button>

        </div>

        <div className="mt-4">

          <div className="flex items-center gap-2">

            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8EE] text-[#FFA116] text-[10px] font-bold">
              {post.category}
            </span>

            {post.comments.length ===
              0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8EE] text-[#D97706] text-[10px] font-bold">
                Unanswered
              </span>
            )}

          </div>

          <h3 className="text-sm font-bold text-[#262626] mt-2.5">
            {post.title}
          </h3>

          <p className="text-xs text-[#64748B] leading-relaxed mt-1.5">
            {post.content}
          </p>

        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">

          {post.tags.map(
            (tag) => (

              <span
                key={tag}
                className="flex items-center gap-0.5 text-[10px] font-medium text-[#64748B] bg-[#F1F3F5] px-2 py-0.5 rounded"
              >
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>

            )
          )}

        </div>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#E5E7EB]">

          <div className="flex items-center gap-4">

            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                post.liked
                  ? "text-[#DC2626]"
                  : "text-[#64748B] hover:text-[#DC2626]"
              }`}
            >

              <Heart
                className={`w-3.5 h-3.5 ${
                  post.liked
                    ? "fill-current"
                    : ""
                }`}
              />

              <span>{post.likes}</span>

            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#FFA116] transition"
            >

              <MessageCircle className="w-3.5 h-3.5" />

              <span>{post.comments.length}</span>

            </button>

            <button className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#FFA116] transition">

              <Share2 className="w-3.5 h-3.5" />

              <span>Share</span>

            </button>

          </div>

          <button
            onClick={onSave}
            className={`transition ${
              post.saved
                ? "text-[#FFA116]"
                : "text-[#64748B] hover:text-[#262626]"
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
    <div className="group rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/40 hover:shadow-xs transition overflow-hidden">

      <div className="h-1 bg-[#FFA116]" />

      <div className="p-5">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="relative">

              <Avatar
                initials={mentor.initials}
                avatarUrl={mentor.avatar_url}
                userId={mentor.id}
                name={mentor.name}
              />

              {mentor.available && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white" />
              )}

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="text-xs font-bold text-[#262626]">
                  {mentor.name}
                </h3>

              </div>

              <p className="text-[11px] text-[#64748B] mt-0.5">
                {mentor.role}
              </p>

            </div>

          </div>

          <div className="text-right">

            <p className="text-[9px] uppercase font-bold text-[#64748B]">
              Match
            </p>

            <p className="text-xs font-bold text-[#16A34A] bg-[#E6FAF6] px-2 py-0.5 rounded-full mt-0.5">
              {mentor.match}%
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3 mt-4 text-[11px] text-[#64748B]">

          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#64748B]" />
            {mentor.company}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#64748B]" />
            {mentor.location}
          </span>

        </div>

        <div className="flex items-center gap-3 mt-2 text-[11px] text-[#64748B]">

          <span className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-[#64748B]" />
            {mentor.graduation}
          </span>

          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[#FFA116] fill-[#FFA116]" />
            {mentor.rating}
          </span>

          <span>
            {mentor.sessions} sessions
          </span>

        </div>

        <div className="flex flex-wrap gap-1.5 mt-3.5">

          {mentor.skills.map(
            (skill) => (

              <span
                key={skill}
                className="px-2 py-0.5 rounded bg-[#F1F3F5] text-[10px] font-medium text-[#262626]"
              >
                {skill}
              </span>

            )
          )}

        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[#E5E7EB]">

          <button
            onClick={onProfile}
            className="py-2 rounded-lg bg-[#F7F8FA] hover:bg-[#F1F3F5] border border-[#E5E7EB] text-xs font-semibold text-[#262626] transition"
          >
            View Profile
          </button>

          <button
            onClick={onConnect}
            disabled={connected}
            className={`py-2 rounded-lg text-xs font-semibold transition ${
              connected
                ? "bg-[#E6FAF6] text-[#16A34A] border border-[#16A34A]/20"
                : "bg-[#FFA116] hover:bg-[#FFA116]/90 text-white shadow-xs"
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
          className={`w-full mt-2 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
            requested
              ? "bg-[#FFF8EE] text-[#D97706] border border-[#FFA116]/30"
              : "bg-[#FFF8EE] hover:bg-[#FFF8EE]/80 text-[#D97706] border border-[#FFA116]/40"
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
    <div className="fixed inset-0 z-50 bg-[#262626]/40 backdrop-blur-xs flex items-center justify-center p-4">

      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="h-24 bg-[#FFF8EE] border-b border-[#FFA116]/20 relative">

          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 w-8 h-8 rounded-lg bg-white/80 border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:text-[#262626] transition"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        <div className="px-6 pb-6">

          <div className="-mt-10 flex items-end justify-between">

            <UserAvatar
              src={mentor.avatar_url}
              initials={mentor.initials}
              name={mentor.name}
              shape="rounded"
              size="custom"
              className="w-18 h-18 rounded-xl border-4 border-white shadow-sm text-xl"
              fallbackClassName="bg-[#FFA116] text-white"
            />

            <span className="mb-1 px-2.5 py-1 rounded-full bg-[#E6FAF6] text-[#16A34A] text-xs font-bold border border-[#16A34A]/20">
              {mentor.match}% Match
            </span>

          </div>

          <h2 className="text-lg font-bold text-[#262626] mt-3">
            {mentor.name}
          </h2>

          <p className="text-xs text-[#64748B] mt-0.5">
            {mentor.role} at <span className="font-medium text-[#262626]">{mentor.company}</span>
          </p>

          <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#64748B]">

            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
              {mentor.location}
            </span>

            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#64748B]" />
              {mentor.branch} • {mentor.graduation}
            </span>

            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#FFA116] fill-[#FFA116]" />
              {mentor.rating}
            </span>

          </div>

          <div className="mt-5">

            <p className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">
              About
            </p>

            <p className="text-xs text-[#262626] leading-relaxed mt-1.5">
              {mentor.bio}
            </p>

          </div>

          <div className="mt-4">

            <p className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">
              Expertise
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2">

              {mentor.skills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md bg-[#F1F3F5] text-xs font-medium text-[#262626]"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">

            <button
              onClick={onConnect}
              disabled={connected}
              className={`py-2.5 rounded-lg text-xs font-semibold transition ${
                connected
                  ? "bg-[#E6FAF6] text-[#16A34A] border border-[#16A34A]/20"
                  : "bg-[#FFFFFF] border border-[#E5E7EB] text-[#262626] hover:bg-[#F7F8FA]"
              }`}
            >
              {connected
                ? "✓ Connected"
                : "Connect"}
            </button>

            <button
              onClick={onMentorship}
              disabled={requested}
              className={`py-2.5 rounded-lg text-xs font-semibold transition ${
                requested
                  ? "bg-[#FFF8EE] text-[#D97706] border border-[#FFA116]/30"
                  : "bg-[#FFA116] text-white hover:bg-[#FFA116]/90 shadow-xs"
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

function TrendingCard({ trending = [], onSelectTag }) {
  return (
    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

      <div className="flex items-center gap-2">

        <Flame className="w-4 h-4 text-[#FFA116]" />

        <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
          Trending Topics
        </h3>

      </div>

      <div className="space-y-3 mt-4">

        {trending.length === 0 ? (
          <p className="text-xs text-[#64748B]">
            Tags from discussions will appear here once posts are created.
          </p>
        ) : (
          trending.map(({ tag, count }, index) => (
            <div
              key={tag}
              onClick={() => onSelectTag?.(tag)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F7F8FA] transition cursor-pointer"
            >
              <span className="text-xs text-[#64748B] font-bold">
                0{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#262626] truncate">
                  #{tag}
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  {count} {count === 1 ? "discussion" : "discussions"}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
          ))
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
    <div className="p-5 rounded-xl border border-[#FFA116]/30 bg-[#FFF8EE] shadow-xs">

      <div className="w-9 h-9 rounded-lg bg-white border border-[#FFA116]/30 flex items-center justify-center">

        <GraduationCap className="w-4 h-4 text-[#FFA116]" />

      </div>

      <h3 className="text-sm font-bold text-[#262626] mt-3">
        Need career guidance?
      </h3>

      <p className="text-xs text-[#64748B] leading-relaxed mt-1.5">
        Get 1-on-1 mentorship from alumni and seniors who have already cracked top tech roles.
      </p>

      <button
        onClick={onClick}
        className="w-full mt-4 py-2 rounded-lg bg-[#FFA116] hover:bg-[#FFA116]/90 text-white text-xs font-bold shadow-xs transition"
      >
        Find Your Mentor
      </button>

    </div>
  );
}

/* =========================================================
   STUDY GROUPS
========================================================= */

function StudyGroups({ groups = [], onToggleJoin }) {
  return (
    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <BookOpen className="w-4 h-4 text-[#FFA116]" />

          <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
            Study Groups
          </h3>

        </div>

      </div>

      <div className="space-y-2 mt-3.5">

        {groups.map((group) => (
          <div
            key={group.id || group.name}
            onClick={() => onToggleJoin?.(group.id)}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] hover:bg-[#F1F3F5] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#FFA116]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#262626] truncate">
                {group.name}
              </p>
              <p className="text-[10px] text-[#64748B]">
                {group.members} {group.members === 1 ? "member" : "members"}
              </p>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              group.is_joined
                ? "bg-[#E6FAF6] text-[#16A34A]"
                : "bg-white border border-[#E5E7EB] text-[#64748B]"
            }`}>
              {group.is_joined ? "Joined" : "Join"}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

/* =========================================================
   EVENTS
========================================================= */

function EventsCard({ events = [], onToggleRsvp }) {
  return (
    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

      <div className="flex items-center gap-2">

        <CalendarDays className="w-4 h-4 text-[#16A34A]" />

        <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
          Upcoming Events
        </h3>

      </div>

      <div className="space-y-3 mt-3.5">

        {events.map((event) => (
          <div
            key={event.id || event.title}
            onClick={() => onToggleRsvp?.(event.id)}
            className="flex gap-3 items-center p-1.5 rounded-lg hover:bg-[#F7F8FA] transition cursor-pointer"
          >
            <div className="w-12 h-9 rounded-lg bg-[#E6FAF6] border border-[#16A34A]/20 flex flex-col items-center justify-center shrink-0 px-1 text-center">
              <span className="text-[9px] font-bold text-[#16A34A] leading-tight">
                {event.date}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#262626] truncate">
                {event.title}
              </p>
              <p className="text-[10px] text-[#64748B]">
                {event.time} • {event.members} joined
              </p>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              event.is_rsvped
                ? "bg-[#E6FAF6] text-[#16A34A]"
                : "bg-[#F7F8FA] border border-[#E5E7EB] text-[#64748B]"
            }`}>
              {event.is_rsvped ? "Going" : "RSVP"}
            </span>
          </div>
        ))}

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
    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

      <div className="w-8 h-8 rounded-lg bg-[#FFF8EE] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#FFA116]" />
      </div>

      <p className="text-2xl font-extrabold text-[#262626] mt-3">
        {value}
      </p>

      <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider mt-0.5">
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
    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">

      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E7EB]">

        <Icon className="w-4 h-4 text-[#FFA116]" />

        <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
          {title}
        </h3>

      </div>

      <div className="space-y-2.5">
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">

      <Avatar
        initials={mentor.initials}
        avatarUrl={mentor.avatar_url}
        userId={mentor.id}
        name={mentor.name}
        small
      />

      <div className="flex-1 min-w-0">

        <p className="text-xs font-bold text-[#262626] truncate">
          {mentor.name}
        </p>

        <p className="text-[10px] text-[#64748B] truncate">
          {mentor.role} • {mentor.company}
        </p>

      </div>

      <span className="px-2 py-0.5 rounded-full bg-[#E6FAF6] text-[#16A34A] text-[10px] font-bold border border-[#16A34A]/20">
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
    <div className="py-8 text-center">

      <Users className="w-6 h-6 mx-auto text-[#64748B]" />

      <p className="text-xs text-[#64748B] mt-2">
        {text}
      </p>

      <button
        onClick={onClick}
        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#FFA116] hover:bg-[#FFA116]/90 text-white text-xs font-semibold shadow-xs transition"
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
    <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]">

      <Icon className="w-4 h-4 text-[#FFA116]" />

      <p className="text-lg font-bold text-[#262626] mt-2">
        {value}
      </p>

      <p className="text-[9px] text-[#64748B] uppercase tracking-wider font-semibold">
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
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
        active
          ? "bg-[#FFA116] text-white shadow-xs"
          : "text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function Avatar({
  initials,
  avatarUrl,
  userId,
  isAnonymous = false,
  name,
  small = false,
}) {
  const { user } = useAuth();
  const isSelf = !isAnonymous && user?.id && userId && Number(user.id) === Number(userId);
  const resolvedSrc = isAnonymous ? null : (isSelf ? (user?.avatar_url || avatarUrl) : avatarUrl);

  return (
    <UserAvatar
      src={resolvedSrc}
      initials={initials}
      name={name}
      shape="rounded"
      size={small ? "sm" : "md"}
      className={small ? "text-[10px]" : "text-xs"}
      fallbackClassName="bg-[#FFF8EE] text-[#FFA116] border border-[#FFA116]/30"
    />
  );
}

function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#262626]/40 backdrop-blur-xs flex items-center justify-center p-4">

      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-150">

        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#FFFFFF] border-b border-[#E5E7EB]">

          <h2 className="text-sm font-bold text-[#262626]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:text-[#262626] transition"
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

      <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">
        {label}
      </label>

      <div className="mt-1.5">
        {children}
      </div>

    </div>
  );
}

function EmptyState({
  text = "No discussions found.",
}) {
  return (
    <div className="py-14 text-center rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">

      <Search className="w-7 h-7 mx-auto text-[#64748B]" />

      <p className="text-xs font-bold text-[#262626] mt-3">
        {text}
      </p>

      <p className="text-[11px] text-[#64748B] mt-1">
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
    <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]">

      <Icon className="w-4 h-4 text-[#FFA116]" />

      <p className="text-xs font-bold text-[#262626] mt-2">
        {title}
      </p>

      <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed">
        {text}
      </p>

    </div>
  );
}