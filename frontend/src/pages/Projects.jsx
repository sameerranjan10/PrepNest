import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { ComponentLoader } from '@/components/ui/PrepNestLoader';
import { useAuth } from '@/context/AuthContext';
import {
  FolderGit2,
  Plus,
  Search,
  Star,
  ExternalLink,
  FileText,
  Video,
  CheckCircle2,
  Circle,
  Calendar,
  Award,
  Sparkles,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  X,
  BookOpen,
  Filter,
  Zap,
  HelpCircle,
  Briefcase,
  ChevronRight,
  Share2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PROJECT_TYPES = [
  'Personal',
  'Academic',
  'Minor Project',
  'Major Project',
  'Hackathon',
  'Internship',
  'Open Source',
  'Other'
];

const PROJECT_STATUSES = [
  'Planning',
  'In Progress',
  'Completed',
  'Paused'
];

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'portfolio' | 'ideas'
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total_projects: 0,
    completed_projects: 0,
    in_progress_projects: 0,
    featured_projects: 0,
    average_readiness: 0
  });
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Ideas Filters
  const [ideaDomain, setIdeaDomain] = useState('ALL');
  const [ideaDifficulty, setIdeaDifficulty] = useState('ALL');
  const [ideaTech, setIdeaTech] = useState('ALL');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewPrepData, setInterviewPrepData] = useState(null);
  const [interviewPrepLoading, setInterviewPrepLoading] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [resumeBulletsLoading, setResumeBulletsLoading] = useState(false);
  const [showPortfolioExportModal, setShowPortfolioExportModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    detailed_description: '',
    project_type: 'Personal',
    status: 'In Progress',
    start_date: '',
    end_date: '',
    technologies_str: '',
    key_features_str: '',
    user_role: 'Full Stack Developer',
    team_size: 1,
    my_contribution: '',
    github_url: '',
    live_demo_url: '',
    documentation_url: '',
    demo_video_url: '',
    is_featured: false
  });

  // Milestone Form in Detail Modal
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

  // GitHub Sync State
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [githubSyncMsg, setGithubSyncMsg] = useState(null);

  // Notifications / XP Toasts
  const [notification, setNotification] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const getAuthToken = () => localStorage.getItem('prepnest_token') || '';

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Projects and Stats
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const [projectsRes, statsRes, ideasRes] = await Promise.all([
        fetch(`${API_BASE}/api/projects`, { headers }),
        fetch(`${API_BASE}/api/projects/stats`, { headers }),
        fetch(`${API_BASE}/api/projects/ideas`, { headers })
      ]);

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);
      }
      if (ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setIdeas(ideasData.ideas || []);
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Failed to load projects. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.short_description && p.short_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || p.project_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

  // Featured Projects
  const featuredProjects = useMemo(() => {
    return projects.filter((p) => p.is_featured);
  }, [projects]);

  // Filtered Ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesDomain = ideaDomain === 'ALL' || idea.domain === ideaDomain;
      const matchesDiff = ideaDifficulty === 'ALL' || idea.difficulty === ideaDifficulty;
      const matchesTech = ideaTech === 'ALL' || (idea.technologies && idea.technologies.some(t => t.toLowerCase().includes(ideaTech.toLowerCase())));
      return matchesDomain && matchesDiff && matchesTech;
    });
  }, [ideas, ideaDomain, ideaDifficulty, ideaTech]);

  // Reset Add/Edit Form
  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      detailed_description: '',
      project_type: 'Personal',
      status: 'In Progress',
      start_date: '',
      end_date: '',
      technologies_str: '',
      key_features_str: '',
      user_role: 'Full Stack Developer',
      team_size: 1,
      my_contribution: '',
      github_url: '',
      live_demo_url: '',
      documentation_url: '',
      demo_video_url: '',
      is_featured: false
    });
    setEditingProject(null);
    setGithubSyncMsg(null);
  };

  const handleOpenAddModal = (initialData = null) => {
    resetForm();
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        technologies_str: Array.isArray(initialData.technologies)
          ? initialData.technologies.join(', ')
          : initialData.technologies_str || '',
        key_features_str: Array.isArray(initialData.key_features)
          ? initialData.key_features.join('\n')
          : initialData.key_features_str || ''
      });
    }
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      short_description: project.short_description || '',
      detailed_description: project.detailed_description || '',
      project_type: project.project_type || 'Personal',
      status: project.status || 'In Progress',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      technologies_str: (project.technologies || []).join(', '),
      key_features_str: (project.key_features || []).join('\n'),
      user_role: project.user_role || '',
      team_size: project.team_size || 1,
      my_contribution: project.my_contribution || '',
      github_url: project.github_url || '',
      live_demo_url: project.live_demo_url || '',
      documentation_url: project.documentation_url || '',
      demo_video_url: project.demo_video_url || '',
      is_featured: !!project.is_featured
    });
    setGithubSyncMsg(null);
    setShowAddEditModal(true);
  };

  // Submit Add / Edit Project
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.short_description.trim()) {
      showToast('Project title and short description are required.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      short_description: formData.short_description.trim(),
      detailed_description: formData.detailed_description.trim(),
      project_type: formData.project_type,
      status: formData.status,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      technologies: formData.technologies_str
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      key_features: formData.key_features_str
        .split('\n')
        .map((f) => f.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean),
      user_role: formData.user_role.trim(),
      team_size: parseInt(formData.team_size, 10) || 1,
      my_contribution: formData.my_contribution.trim(),
      github_url: formData.github_url.trim(),
      live_demo_url: formData.live_demo_url.trim(),
      documentation_url: formData.documentation_url.trim(),
      demo_video_url: formData.demo_video_url.trim(),
      is_featured: formData.is_featured
    };

    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      let url = `${API_BASE}/api/projects`;
      let method = 'POST';

      if (editingProject) {
        url = `${API_BASE}/api/projects/${editingProject.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save project');
      }

      const resData = await res.json();
      showToast(
        editingProject
          ? 'Project updated successfully!'
          : `Project created! ${resData.xp_earned ? `+${resData.xp_earned} XP awarded` : ''}`,
        'success'
      );

      setShowAddEditModal(false);
      resetForm();
      fetchData();

      // If we were viewing detail of this project, refresh selected project
      if (selectedProject && editingProject && selectedProject.id === editingProject.id) {
        handleViewProject(editingProject.id);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to delete project');
      }

      showToast('Project deleted successfully.', 'success');
      setShowDeleteModal(false);
      if (selectedProject?.id === projectToDelete.id) {
        setShowDetailModal(false);
        setSelectedProject(null);
      }
      setProjectToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  // Toggle Feature Project
  const handleToggleFeature = async (project, e) => {
    if (e) e.stopPropagation();
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Failed to update featured status');
      const data = await res.json();
      showToast(
        data.is_featured
          ? `Project featured on portfolio! ${data.xp_awarded ? `+${data.xp_awarded} XP` : ''}`
          : 'Project removed from featured portfolio.'
      );
      fetchData();
      if (selectedProject?.id === project.id) {
        setSelectedProject((prev) => ({ ...prev, is_featured: data.is_featured }));
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating featured status', 'error');
    }
  };

  // View Project Detail
  const handleViewProject = async (projectId, fallbackProject = null) => {
    // Immediately open modal with existing project data so it renders with zero delay
    const proj = fallbackProject || projects.find((p) => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setShowDetailModal(true);
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        const detail = data.project || data;
        if (detail) {
          setSelectedProject(detail);
        }
      }
      setShowDetailModal(true);
    } catch (err) {
      console.warn('Background project detail fetch:', err);
      if (!proj) {
        showToast('Failed to load project details', 'error');
      }
    }
  };

  // GitHub Sync Trigger
  const handleSyncGitHub = async () => {
    if (!formData.github_url) {
      setGithubSyncMsg({ text: 'Please enter a GitHub URL first.', type: 'error' });
      return;
    }

    setGithubSyncing(true);
    setGithubSyncMsg(null);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE}/api/projects/github-sync?url=${encodeURIComponent(formData.github_url)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setGithubSyncMsg({ text: data.detail || 'GitHub repository not found or inaccessible.', type: 'error' });
        return;
      }

      const meta = data.metadata;
      setFormData((prev) => ({
        ...prev,
        title: prev.title || meta.name || '',
        short_description: prev.short_description || meta.description || '',
        technologies_str: prev.technologies_str
          ? (meta.language && !prev.technologies_str.includes(meta.language) ? `${prev.technologies_str}, ${meta.language}` : prev.technologies_str)
          : (meta.language || '')
      }));

      setGithubSyncMsg({
        text: `Synced with GitHub: ★ ${meta.stars || 0} stars, ${meta.forks || 0} forks. Primary language: ${meta.language || 'N/A'}.`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setGithubSyncMsg({ text: 'Unable to connect to GitHub REST API. Please check your network.', type: 'error' });
    } finally {
      setGithubSyncing(false);
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!selectedProject || !newMilestoneTitle.trim()) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/${selectedProject.id}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          due_date: newMilestoneDueDate || null,
          is_completed: false
        })
      });

      if (!res.ok) throw new Error('Failed to add milestone');
      const data = await res.json();
      setNewMilestoneTitle('');
      setNewMilestoneDueDate('');
      showToast('Milestone added!', 'success');
      handleViewProject(selectedProject.id);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error adding milestone', 'error');
    }
  };

  // Toggle Milestone Complete
  const handleToggleMilestone = async (milestone) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: milestone.title,
          is_completed: !milestone.is_completed,
          due_date: milestone.due_date
        })
      });

      if (!res.ok) throw new Error('Failed to update milestone');
      handleViewProject(selectedProject.id);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update milestone status', 'error');
    }
  };

  // Delete Milestone
  const handleDeleteMilestone = async (milestoneId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Failed to delete milestone');
      showToast('Milestone removed', 'success');
      handleViewProject(selectedProject.id);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete milestone', 'error');
    }
  };

  // Interview Prep
  const handleOpenInterviewPrep = async (project, e) => {
    if (e) e.stopPropagation();
    setSelectedProject(project);
    setShowInterviewModal(true);
    setInterviewPrepLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Failed to generate interview prep');
      const data = await res.json();
      setInterviewPrepData(data.interview_prep);
      if (data.xp_awarded) {
        showToast(`+${data.xp_awarded} XP for preparing project interview!`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load interview preparation', 'error');
    } finally {
      setInterviewPrepLoading(false);
    }
  };

  // Launch Project in Existing Mock Interview System
  const handleStartProjectMockInterview = () => {
    if (!selectedProject || !interviewPrepData) return;

    // Package questions for Mock Interview module
    const projectMockQuestions = [
      ...(interviewPrepData.basic_questions || []),
      ...(interviewPrepData.technical_questions || []),
      ...(interviewPrepData.contribution_questions || []),
      ...(interviewPrepData.advanced_questions || [])
    ].map((q) => ({
      question: q.question,
      keywords: selectedProject.technologies || ['project', 'architecture', 'solution', 'implementation']
    }));

    const mockPayload = {
      projectTitle: selectedProject.title,
      questions: projectMockQuestions.slice(0, 5),
      interviewType: 'Project'
    };

    sessionStorage.setItem('prepnest_mock_project_data', JSON.stringify(mockPayload));
    setShowInterviewModal(false);
    navigate('/mock-interview?category=Project');
  };

  // Resume Bullets
  const handleOpenResumeBullets = async (project, e) => {
    if (e) e.stopPropagation();
    setSelectedProject(project);
    setShowResumeModal(true);
    setResumeBulletsLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/resume-bullets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Failed to generate resume bullets');
      const data = await res.json();
      setResumeData({
        bullets: data.bullets || [],
        bulletsText: (data.bullets || []).join('\n')
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to generate resume bullets', 'error');
    } finally {
      setResumeBulletsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Portfolio Summary Generation
  const generatePortfolioMarkdown = () => {
    if (!featuredProjects.length) return '';
    return featuredProjects
      .map(
        (p) => `### ${p.title}
**Role:** ${p.user_role || 'Developer'} | **Status:** ${p.status}
${p.short_description || ''}

**Tech Stack:** ${(p.technologies || []).join(', ')}
${p.github_url ? `- [GitHub Repository](${p.github_url})` : ''}
${p.live_demo_url ? `- [Live Demo](${p.live_demo_url})` : ''}

**Key Contributions:**
${(p.key_features || []).map((f) => `- ${f}`).join('\n')}
`
      )
      .join('\n---\n\n');
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="projects" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Notification Toast */}
          {notification && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
                notification.type === 'error'
                  ? 'bg-[#FFEBEF] border-[#DC2626]/20 text-[#DC2626]'
                  : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#262626]'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-[#DC2626]" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#FFA116]" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          )}

          {/* PAGE TITLE & ACTION BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:pr-[124px] lg:pr-[132px]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] bg-[#FFF8EE] border border-[#FFA116]/30 px-2.5 py-0.5 rounded-md">
                  Placement Hub
                </span>
                <span className="text-xs text-[#64748B]">•</span>
                <span className="text-xs text-[#64748B]">Technical Portfolio & Interview Readiness</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] mt-1.5 flex items-center gap-3">
                <FolderGit2 className="w-7 h-7 text-[#FFA116]" />
                Projects
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
                Manage your technical projects, calculate placement readiness, practice targeted interview defense, and build ATS-ready resume bullets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenAddModal()}
                className="flex items-center gap-2 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
          </div>

          {/* PROJECT OVERVIEW STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between hover:border-[#FFA116]/50 transition shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
                <FolderGit2 className="w-4 h-4 text-[#FFA116]" />
              </div>
              <div className="text-2xl font-bold text-[#262626]">{stats.total_projects}</div>
              <p className="text-[11px] text-[#64748B] mt-1">Managed projects</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between hover:border-[#FFA116]/50 transition shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div className="text-2xl font-bold text-[#16A34A]">{stats.completed_projects}</div>
              <p className="text-[11px] text-[#64748B] mt-1">Shipped & finished</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between hover:border-[#FFA116]/50 transition shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
                <TrendingUp className="w-4 h-4 text-[#FFA116]" />
              </div>
              <div className="text-2xl font-bold text-[#FFA116]">{stats.in_progress_projects}</div>
              <p className="text-[11px] text-[#64748B] mt-1">Actively building</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between hover:border-[#FFA116]/50 transition shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Featured</span>
                <Star className="w-4 h-4 text-[#D97706] fill-[#FFA116]" />
              </div>
              <div className="text-2xl font-bold text-[#262626]">{stats.featured_projects}</div>
              <p className="text-[11px] text-[#64748B] mt-1">On showcase portfolio</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#FFA116]/50 transition">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Readiness</span>
                <Award className="w-4 h-4 text-[#FFA116]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#262626]">{stats.average_readiness}</span>
                <span className="text-xs text-[#64748B] font-semibold">/100</span>
              </div>
              <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#FFA116] transition-all duration-500"
                  style={{ width: `${Math.min(stats.average_readiness, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION TABS */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-[#FFA116] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5]'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                My Projects ({projects.length})
              </button>

              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'portfolio'
                    ? 'bg-[#FFA116] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5]'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
                Featured Portfolio ({featuredProjects.length})
              </button>

              <button
                onClick={() => setActiveTab('ideas')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'ideas'
                    ? 'bg-[#FFA116] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Project Ideas ({ideas.length})
              </button>
            </div>

            {activeTab === 'portfolio' && featuredProjects.length > 0 && (
              <button
                onClick={() => setShowPortfolioExportModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#FFA116] border border-[#FFA116]/30 px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Generate Portfolio
              </button>
            )}
          </div>

          {/* TAB 1: ALL PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects by name, description, or tech stack..."
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs text-[#262626] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#FFA116] transition shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#262626]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-xs text-[#64748B] font-medium">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs text-[#262626] focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      {PROJECT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-sm">
                    <span className="text-xs text-[#64748B] font-medium">Type:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-transparent text-xs text-[#262626] focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Types</option>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="w-2/3 h-5 bg-[#F1F3F5] rounded" />
                        <div className="w-full h-12 bg-[#F1F3F5] rounded" />
                      </div>
                      <div className="w-full h-8 bg-[#F1F3F5] rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-dashed border-[#E5E7EB] text-center space-y-4 max-w-lg mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center mx-auto text-[#FFA116]">
                    <FolderGit2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#262626]">
                      {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                        ? 'No projects match your filter'
                        : "You haven't added any projects yet"}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                      {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                        ? 'Try clearing your search query or filters to see all projects.'
                        : 'Add your academic, hackathon, or personal engineering projects to track readiness scores and prepare for interviews.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal()}
                    className="inline-flex items-center gap-2 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    + Add Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onView={() => handleViewProject(project.id, project)}
                      onEdit={() => handleOpenEditModal(project)}
                      onDelete={() => {
                        setProjectToDelete(project);
                        setShowDeleteModal(true);
                      }}
                      onInterviewPrep={(e) => handleOpenInterviewPrep(project, e)}
                      onToggleFeature={(e) => handleToggleFeature(project, e)}
                      onAddToResume={(e) => handleOpenResumeBullets(project, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PORTFOLIO SHOWCASE */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#FFF8EE] border border-[#FFA116]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-[#262626] flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#FFA116] fill-[#FFA116]" />
                    Placement Portfolio Showcase
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Projects marked as &ldquo;Featured&rdquo; appear here as your top highlight reel for recruiter evaluations and campus placements.
                  </p>
                </div>
                <button
                  onClick={() => setShowPortfolioExportModal(true)}
                  disabled={!featuredProjects.length}
                  className="flex items-center gap-2 bg-[#FFA116] hover:bg-[#e69113] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Generate Portfolio Summary
                </button>
              </div>

              {featuredProjects.length === 0 ? (
                <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-dashed border-[#E5E7EB] text-center space-y-3 shadow-sm">
                  <Star className="w-10 h-10 text-[#64748B]/40 mx-auto" />
                  <h3 className="text-base font-bold text-[#262626]">No featured projects yet</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Click the star icon on any project card in &ldquo;My Projects&rdquo; to feature it in your highlight portfolio.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-2xl p-6 space-y-4 transition flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#FFF8EE] border border-[#FFA116]/30 px-2 py-0.5 rounded">
                              {project.project_type}
                            </span>
                            <h4 className="text-base font-bold text-[#262626] mt-1.5">{project.title}</h4>
                            <p className="text-xs text-[#64748B] font-medium">Role: {project.user_role || 'Developer'}</p>
                          </div>
                          <button
                            onClick={(e) => handleToggleFeature(project, e)}
                            title="Remove from featured"
                            className="text-[#FFA116] hover:text-[#64748B] p-1 cursor-pointer"
                          >
                            <Star className="w-5 h-5 fill-[#FFA116]" />
                          </button>
                        </div>

                        <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                          {project.short_description}
                        </p>

                        {/* Tech Stack Pills */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.technologies.map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium bg-[#F1F3F5] text-[#262626] px-2 py-0.5 rounded border border-[#E5E7EB]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Key Features */}
                        {project.key_features && project.key_features.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-[#E5E7EB]">
                            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Key Highlights:</span>
                            <ul className="text-xs text-[#262626] space-y-1 list-disc list-inside">
                              {project.key_features.slice(0, 3).map((f, i) => (
                                <li key={i} className="line-clamp-1">{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Links and Actions */}
                      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#64748B] hover:text-[#262626] flex items-center gap-1 text-xs"
                            >
                              <GithubIcon className="w-4 h-4" />
                              Repo
                            </a>
                          )}
                          {project.live_demo_url && (
                            <a
                              href={project.live_demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#FFA116] hover:underline flex items-center gap-1 text-xs font-semibold"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Live Demo
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProject(project.id, project)}
                            className="text-xs font-semibold text-[#262626] hover:bg-[#F1F3F5] px-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] transition cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => handleOpenInterviewPrep(project, e)}
                            className="text-xs font-semibold text-[#D97706] bg-[#FFF8EE] hover:bg-[#FFA116] hover:text-white border border-[#FFA116]/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Prep
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECT IDEAS */}
          {activeTab === 'ideas' && (
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-[#262626]">Curated Placement Project Ideas</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    High-impact engineering concepts vetted by tech recruiters and campus panels.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={ideaDomain}
                    onChange={(e) => setIdeaDomain(e.target.value)}
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#262626] focus:outline-none"
                  >
                    <option value="ALL">All Domains</option>
                    <option value="Web Development">Web Development</option>
                    <option value="AI/ML">AI / ML</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science">Data Science</option>
                    <option value="IoT">IoT</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Blockchain">Blockchain</option>
                  </select>

                  <select
                    value={ideaDifficulty}
                    onChange={(e) => setIdeaDifficulty(e.target.value)}
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#262626] focus:outline-none"
                  >
                    <option value="ALL">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <select
                    value={ideaTech}
                    onChange={(e) => setIdeaTech(e.target.value)}
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#262626] focus:outline-none"
                  >
                    <option value="ALL">All Technologies</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python</option>
                    <option value="FastAPI">FastAPI</option>
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="Kafka">Kafka</option>
                    <option value="Docker">Docker</option>
                    <option value="Solidity">Solidity</option>
                    <option value="React Native">React Native</option>
                  </select>
                </div>
              </div>

              {/* Ideas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#FFF8EE] border border-[#FFA116]/30 px-2 py-0.5 rounded">
                          {idea.domain}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            idea.difficulty === 'Advanced'
                              ? 'text-[#DC2626] bg-[#FFEBEF] border-[#DC2626]/20'
                              : idea.difficulty === 'Intermediate'
                              ? 'text-[#D97706] bg-[#FFF8EE] border-[#FFA116]/30'
                              : 'text-[#16A34A] bg-[#E6FAF6] border-[#16A34A]/20'
                          }`}
                        >
                          {idea.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#262626]">{idea.title}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">{idea.problem_statement}</p>

                      {/* Tech Stack */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                          Recommended Stack:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(idea.suggested_technologies || idea.technologies || []).map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-[#F1F3F5] text-[#262626] px-2 py-0.5 rounded border border-[#E5E7EB]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Placement relevance */}
                      <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 text-xs text-[#262626]">
                        <span className="font-bold text-[#D97706]">Why Recruiters Care:</span> {idea.placement_relevance}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleOpenAddModal({
                          title: idea.title,
                          short_description: idea.problem_statement,
                          detailed_description: `Target Implementation:\n${(idea.suggested_features || idea.key_features || []).join('\n')}`,
                          technologies_str: (idea.suggested_technologies || idea.technologies || []).join(', '),
                          key_features_str: (idea.suggested_features || idea.key_features || []).join('\n'),
                          project_type: 'Personal',
                          status: 'Planning'
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 bg-[#F7F8FA] hover:bg-[#FFA116] text-[#262626] hover:text-white font-semibold text-xs py-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#FFA116] transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Use as Inspiration & Add Project
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </BlurDrop>
      </div>

      {/* =========================================================
          MODAL 1: ADD / EDIT PROJECT
      ========================================================= */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-6 text-[#262626]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#262626]">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Provide real project information to calculate your placement readiness score.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddEditModal(false);
                  resetForm();
                }}
                className="text-[#64748B] hover:text-[#262626] p-2 rounded-lg hover:bg-[#F1F3F5] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitProject} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* GitHub Auto-Sync Box */}
              <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#262626] flex items-center gap-2">
                    <GithubIcon className="w-4 h-4 text-[#262626]" />
                    GitHub Sync (Optional)
                  </span>
                  <span className="text-[10px] text-[#64748B]">Official REST API</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#FFA116]"
                  />
                  <button
                    type="button"
                    onClick={handleSyncGitHub}
                    disabled={githubSyncing}
                    className="flex items-center gap-1.5 bg-[#FFA116] hover:bg-[#e69113] disabled:opacity-50 text-white px-3.5 py-2 rounded-xl font-semibold shadow-sm transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${githubSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
                {githubSyncMsg && (
                  <p
                    className={`text-[11px] font-medium ${
                      githubSyncMsg.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'
                    }`}
                  >
                    {githubSyncMsg.text}
                  </p>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Basic Information</h4>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">
                    Project Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. PrepNest - AI Placement Portal"
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">
                    Short Description (1-2 sentences) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="e.g. Full-stack placement prep platform with AI mock interviews and resume ATS auditing."
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">Detailed Description & Architecture</label>
                  <textarea
                    rows={3}
                    value={formData.detailed_description}
                    onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                    placeholder="Explain background, architectural decisions, and why you built it..."
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Project Type</label>
                    <select
                      value={formData.project_type}
                      onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Project Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    >
                      {PROJECT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">End Date / Expected Completion</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Technical Specifications</h4>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">
                    Technologies / Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.technologies_str}
                    onChange={(e) => setFormData({ ...formData, technologies_str: e.target.value })}
                    placeholder="e.g. React, FastAPI, PostgreSQL, TailwindCSS, Docker"
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">
                    Key Features (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.key_features_str}
                    onChange={(e) => setFormData({ ...formData, key_features_str: e.target.value })}
                    placeholder="Role-based JWT authentication&#10;Real-time interview voice evaluator&#10;Vector search for company past papers"
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Your Role in Project</label>
                    <input
                      type="text"
                      value={formData.user_role}
                      onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                      placeholder="e.g. Lead Backend Engineer"
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">
                    Your Personal Contribution (Crucial for Interviews)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.my_contribution}
                    onChange={(e) => setFormData({ ...formData, my_contribution: e.target.value })}
                    placeholder="Specifically what modules or queries you built, challenges faced, and trade-offs made..."
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Project Links</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      value={formData.live_demo_url}
                      onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
                      placeholder="https://myproject.vercel.app"
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#262626] font-semibold mb-1">Documentation URL</label>
                    <input
                      type="url"
                      value={formData.documentation_url}
                      onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                      placeholder="https://docs.myproject.com or Wiki link"
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#262626] font-semibold mb-1">Optional Demo Video URL</label>
                  <input
                    type="url"
                    value={formData.demo_video_url}
                    onChange={(e) => setFormData({ ...formData, demo_video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or Loom"
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FFA116]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FFA116] border-[#E5E7EB] focus:ring-[#FFA116]"
                  />
                  <label htmlFor="is_featured" className="text-[#262626] font-semibold cursor-pointer">
                    Feature on Placement Portfolio Showcase
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: PROJECT DETAIL & MILESTONES VIEW
      ========================================================= */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden my-4 text-[#262626]">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#FFF8EE] border border-[#FFA116]/30 px-2 py-0.5 rounded">
                      {selectedProject.project_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        selectedProject.status === 'Completed'
                          ? 'text-[#16A34A] bg-[#E6FAF6] border-[#16A34A]/20'
                          : 'text-[#262626] bg-[#F1F3F5] border-[#E5E7EB]'
                      }`}
                    >
                      {selectedProject.status}
                    </span>
                    {selectedProject.is_featured && (
                      <span className="text-[10px] font-bold text-[#FFA116] bg-[#FFF8EE] border border-[#FFA116]/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#FFA116]" /> Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#262626] mt-1">{selectedProject.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEditModal(selectedProject);
                    setShowDetailModal(false);
                  }}
                  className="flex items-center gap-1 text-xs text-[#262626] bg-[#F7F8FA] hover:bg-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#E5E7EB] transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#64748B]" /> Edit
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-[#64748B] hover:text-[#262626] p-2 rounded-lg hover:bg-[#F1F3F5] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Top Banner: Readiness & Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Readiness Card */}
                <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#FFA116]" />
                      Placement Readiness Score
                    </span>
                    <span className="text-2xl font-bold text-[#FFA116]">
                      {selectedProject.readiness_score || 0}/100
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Improve Your Project (Missing Items):
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {(() => {
                        const allCriteria = selectedProject.improvement_checklist || selectedProject.readiness_info?.checklist || [];
                        const missingItems = allCriteria.filter(item => !item.completed);
                        
                        if (missingItems.length === 0) {
                          return (
                            <div className="flex items-center gap-2 text-[11px] text-[#16A34A] font-semibold bg-[#E6FAF6] border border-[#16A34A]/20 p-2.5 rounded-xl">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                              All readiness criteria completed! Your project is 100% placement ready.
                            </div>
                          );
                        }
                        return missingItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-[11px] bg-[#FFFFFF] p-2 rounded-xl border border-[#E5E7EB]">
                            <div className="flex items-center gap-2">
                              <Circle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                              <span className="text-[#262626] font-medium">
                                {item.title || item.label || 'Requirement'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#FFA116] bg-[#FFF8EE] border border-[#FFA116]/30 px-2 py-0.5 rounded shrink-0">
                              +{item.weight || item.points || 10} pts
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Progress & Milestones Summary */}
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#262626] uppercase tracking-wider">
                        Milestone Progress
                      </span>
                      <span className="text-xl font-bold text-[#16A34A]">
                        {selectedProject.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#16A34A] transition-all duration-300"
                        style={{ width: `${selectedProject.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E5E7EB] text-[11px]">
                    <div>
                      <span className="text-[#64748B] block">Your Role:</span>
                      <span className="font-semibold text-[#262626]">{selectedProject.user_role || 'Developer'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Team Size:</span>
                      <span className="font-semibold text-[#262626]">{selectedProject.team_size || 1} Member(s)</span>
                    </div>
                    {selectedProject.start_date && (
                      <div>
                        <span className="text-[#64748B] block">Timeline:</span>
                        <span className="font-semibold text-[#262626]">
                          {selectedProject.start_date} {selectedProject.end_date ? `to ${selectedProject.end_date}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description & Contribution */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-[#262626] leading-relaxed bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 rounded-xl">
                    {selectedProject.detailed_description || selectedProject.short_description}
                  </p>
                </div>

                {/* Tech Stack */}
                {((selectedProject.technologies || selectedProject.tech_stack) || []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedProject.technologies || selectedProject.tech_stack || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-[#F1F3F5] border border-[#E5E7EB] text-[#262626] px-2.5 py-1 rounded-lg font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Features */}
                {selectedProject.key_features?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Key Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProject.key_features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FFFFFF] border border-[#E5E7EB] p-2.5 rounded-xl flex items-start gap-2 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#FFA116] shrink-0 mt-0.5" />
                          <span className="text-[#262626]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* My Contribution */}
                {selectedProject.my_contribution && (
                  <div>
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Personal Contribution
                    </h4>
                    <p className="text-[#262626] leading-relaxed bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 rounded-xl">
                      {selectedProject.my_contribution}
                    </p>
                  </div>
                )}

                {/* Project Links Bar */}
                <div>
                  <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Project Links</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.github_url && (
                      <a
                        href={selectedProject.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#262626] px-3.5 py-2 rounded-xl font-medium border border-[#E5E7EB] transition"
                      >
                        <GithubIcon className="w-4 h-4 text-[#262626]" />
                        GitHub Repository
                        <ExternalLink className="w-3 h-3 text-[#64748B]" />
                      </a>
                    )}
                    {selectedProject.live_demo_url && (
                      <a
                        href={selectedProject.live_demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-[#FFF8EE] hover:bg-[#FFF2DE] text-[#D97706] px-3.5 py-2 rounded-xl font-medium border border-[#FFA116]/30 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                    {selectedProject.documentation_url && (
                      <a
                        href={selectedProject.documentation_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#262626] px-3.5 py-2 rounded-xl font-medium border border-[#E5E7EB] transition"
                      >
                        <FileText className="w-4 h-4 text-[#64748B]" />
                        Documentation
                      </a>
                    )}
                    {selectedProject.demo_video_url && (
                      <a
                        href={selectedProject.demo_video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#262626] px-3.5 py-2 rounded-xl font-medium border border-[#E5E7EB] transition"
                      >
                        <Video className="w-4 h-4 text-[#DC2626]" />
                        Demo Video
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* MILESTONES & PROGRESS SECTION */}
              <div className="pt-6 border-t border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#262626] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#FFA116]" />
                      Project Milestones & Task Tracker
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Progress is calculated automatically from milestone completions.
                    </p>
                  </div>
                </div>

                {/* Add Milestone Form */}
                <form onSubmit={handleAddMilestone} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Add milestone (e.g. JWT Auth & Database migrations)..."
                    className="flex-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#262626] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#FFA116]"
                  />
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#FFA116] hover:bg-[#e69113] text-white font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>

                {/* Milestones List */}
                <div className="space-y-2">
                  {!selectedProject.milestones?.length ? (
                    <div className="p-6 rounded-xl bg-[#F7F8FA] border border-dashed border-[#E5E7EB] text-center text-[#64748B] text-xs">
                      No milestones created yet. Add milestones like &ldquo;UI Wireframing&rdquo;, &ldquo;API Integration&rdquo;, &ldquo;Cloud Deployment&rdquo; to track real progress.
                    </div>
                  ) : (
                    selectedProject.milestones.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          m.is_completed
                            ? 'bg-[#E6FAF6] border-[#16A34A]/20'
                            : 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#FFA116]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleMilestone(m)}
                            className="text-[#64748B] hover:text-[#262626] transition cursor-pointer"
                          >
                            {m.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#64748B] hover:text-[#262626]" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`font-medium ${
                                m.is_completed ? 'line-through text-[#64748B]' : 'text-[#262626]'
                              }`}
                            >
                              {m.title}
                            </span>
                            {m.due_date && (
                              <span className="text-[10px] text-[#64748B] block">Due: {m.due_date}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="text-[#64748B] hover:text-[#DC2626] p-1 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer Quick Action Buttons */}
            <div className="p-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 bg-[#F7F8FA]">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleOpenInterviewPrep(selectedProject, e)}
                  className="flex items-center gap-1.5 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Interview Prep
                </button>
                <button
                  onClick={(e) => handleOpenResumeBullets(selectedProject, e)}
                  className="flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F1F3F5] text-[#262626] font-semibold text-xs px-4 py-2 rounded-xl border border-[#E5E7EB] transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FFA116]" />
                  Add to Resume
                </button>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="text-xs text-[#64748B] hover:text-[#262626] px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: INTERVIEW PREPARATION
      ========================================================= */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden my-4 text-[#262626]">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFF8EE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#262626] flex items-center gap-2">
                    Project Interview Preparation
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] bg-[#E6FAF6] border border-[#16A34A]/20 px-2 py-0.5 rounded">
                      +50 XP
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Defend your project seamlessly. Explanations and questions are derived strictly from your entered data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-[#64748B] hover:text-[#262626] p-2 rounded-lg hover:bg-[#FFFFFF] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {interviewPrepLoading ? (
                <ComponentLoader size="md" message="Fetching interview questions..." />
              ) : interviewPrepData ? (
                <>
                  {/* PROJECT EXPLANATION PITCHES */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#FFA116]" />
                      Project Elevator Pitches
                    </h4>

                    {/* 30 Second Pitch */}
                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#262626] text-xs">30-Second Quick Pitch</span>
                        <button
                          onClick={() =>
                            copyToClipboard(interviewPrepData.explanations?.thirty_seconds, 'pitch30')
                          }
                          className="flex items-center gap-1 text-[11px] text-[#FFA116] hover:underline font-semibold cursor-pointer"
                        >
                          {copiedId === 'pitch30' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy
                        </button>
                      </div>
                      <p className="text-[#64748B] leading-relaxed italic">
                        &ldquo;{interviewPrepData.explanations?.thirty_seconds}&rdquo;
                      </p>
                    </div>

                    {/* 60 Second Walkthrough */}
                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#262626] text-xs">60-Second Walkthrough</span>
                        <button
                          onClick={() =>
                            copyToClipboard(interviewPrepData.explanations?.sixty_seconds, 'pitch60')
                          }
                          className="flex items-center gap-1 text-[11px] text-[#FFA116] hover:underline font-semibold cursor-pointer"
                        >
                          {copiedId === 'pitch60' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy
                        </button>
                      </div>
                      <p className="text-[#64748B] leading-relaxed italic">
                        &ldquo;{interviewPrepData.explanations?.sixty_seconds}&rdquo;
                      </p>
                    </div>

                    {/* 2 Minute Deep Dive */}
                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#262626] text-xs">2-Minute Architectural Deep-Dive</span>
                        <button
                          onClick={() =>
                            copyToClipboard(interviewPrepData.explanations?.two_minutes, 'pitch120')
                          }
                          className="flex items-center gap-1 text-[11px] text-[#FFA116] hover:underline font-semibold cursor-pointer"
                        >
                          {copiedId === 'pitch120' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy
                        </button>
                      </div>
                      <p className="text-[#64748B] leading-relaxed italic">
                        &ldquo;{interviewPrepData.explanations?.two_minutes}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* CATEGORIZED QUESTIONS */}
                  <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Targeted Interview Questions & Prep Guidelines
                    </h4>

                    {/* Basic Questions */}
                    <QuestionCategoryCard
                      title="1. Basic & Problem Statement Questions"
                      questions={interviewPrepData.basic_questions || []}
                    />

                    {/* Technical Questions */}
                    <QuestionCategoryCard
                      title="2. Technical & Architecture Decisions"
                      questions={interviewPrepData.technical_questions || []}
                    />

                    {/* Contribution Questions */}
                    <QuestionCategoryCard
                      title="3. Personal Contribution & Challenge Questions"
                      questions={interviewPrepData.contribution_questions || []}
                    />

                    {/* Advanced Questions */}
                    <QuestionCategoryCard
                      title="4. Scalability, Security & Future Improvements"
                      questions={interviewPrepData.advanced_questions || []}
                    />
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer with Start Mock Interview Button */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-xs text-[#64748B] hover:text-[#262626] px-4 py-2 cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleStartProjectMockInterview}
                className="flex items-center gap-2 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Video className="w-4 h-4" />
                Start Project Mock Interview
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: ADD TO RESUME (ATS BULLETS)
      ========================================================= */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-2xl flex flex-col shadow-xl overflow-hidden my-4 text-[#262626]">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#262626]">ATS-Ready Resume Project Bullets</h3>
                  <p className="text-xs text-[#64748B]">
                    Formulated strictly from your inputs using action-verbs and tech specifications. No invented metrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-[#64748B] hover:text-[#262626] p-2 rounded-lg hover:bg-[#F1F3F5] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {resumeBulletsLoading ? (
                <ComponentLoader size="sm" message="Generating ATS resume bullet points..." />
              ) : resumeData ? (
                <>
                  <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-[#262626]">
                    <span className="font-bold text-[#262626] text-xs block mb-1">
                      {selectedProject?.title} | {selectedProject?.technologies?.join(' • ')}
                    </span>
                    <span className="text-[11px] text-[#FFA116] font-semibold block">
                      Role: {selectedProject?.user_role || 'Developer'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#262626]">
                        Editable Action-Verb Resume Bullets:
                      </label>
                      <button
                        onClick={() => copyToClipboard(resumeData.bulletsText, 'allBullets')}
                        className="flex items-center gap-1 text-[11px] text-[#FFA116] hover:underline font-semibold cursor-pointer"
                      >
                        {copiedId === 'allBullets' ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        Copy Bullets
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={resumeData.bulletsText}
                      onChange={(e) => setResumeData({ ...resumeData, bulletsText: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#262626] leading-relaxed focus:outline-none focus:border-[#FFA116]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 text-[11px] text-[#262626]">
                    <span className="font-bold text-[#D97706]">Pro Tip:</span> Copy these bullets into your Resume or test them against company Job Descriptions using the PrepNest Resume Analyzer.
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-xs text-[#64748B] hover:text-[#262626] px-4 py-2 cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sessionStorage.setItem('prepnest_custom_bullet', resumeData?.bulletsText || '');
                    setShowResumeModal(false);
                    navigate('/resume-analyzer');
                  }}
                  className="flex items-center gap-1.5 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Resume Analyzer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: PORTFOLIO EXPORT MODAL
      ========================================================= */}
      {showPortfolioExportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-2xl flex flex-col shadow-xl overflow-hidden my-4 text-[#262626]">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
                  <Star className="w-5 h-5 fill-[#FFA116]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#262626]">Generated Portfolio Summary</h3>
                  <p className="text-xs text-[#64748B]">
                    Markdown summary of your featured projects ready to copy into your personal site, LinkedIn, or GitHub README.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPortfolioExportModal(false)}
                className="text-[#64748B] hover:text-[#262626] p-2 rounded-lg hover:bg-[#F1F3F5] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <textarea
                readOnly
                rows={10}
                value={generatePortfolioMarkdown()}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#262626] font-mono leading-relaxed focus:outline-none"
              />
            </div>

            <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
              <button
                onClick={() => setShowPortfolioExportModal(false)}
                className="text-xs text-[#64748B] hover:text-[#262626] px-4 py-2 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => copyToClipboard(generatePortfolioMarkdown(), 'portfolioExport')}
                className="flex items-center gap-1.5 bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                {copiedId === 'portfolioExport' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy Portfolio Markdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: DELETE CONFIRMATION
      ========================================================= */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl text-[#262626]">
            <div className="w-12 h-12 rounded-full bg-[#FFEBEF] border border-[#DC2626]/20 flex items-center justify-center text-[#DC2626] mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#262626]">Delete Project?</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Are you sure you want to delete <span className="text-[#262626] font-semibold">&ldquo;{projectToDelete.title}&rdquo;</span>? This will also remove its milestones and interview prep. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DC2626] hover:bg-[#b91c1c] text-white transition shadow-sm cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SUB-COMPONENT: PROJECT CARD
========================================================= */
function ProjectCard({ project, onView, onEdit, onDelete, onInterviewPrep, onToggleFeature, onAddToResume }) {
  const readiness = project.readiness_score || 0;
  const progress = project.progress || 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/60 rounded-2xl p-5 flex flex-col justify-between transition group shadow-sm hover:shadow-md">
      <div className="space-y-3.5">
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#FFF8EE] border border-[#FFA116]/30 px-2 py-0.5 rounded">
              {project.project_type}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                project.status === 'Completed'
                  ? 'text-[#16A34A] bg-[#E6FAF6] border-[#16A34A]/20'
                  : project.status === 'Paused'
                  ? 'text-[#D97706] bg-[#FFF8EE] border-[#FFA116]/30'
                  : 'text-[#262626] bg-[#F1F3F5] border-[#E5E7EB]'
              }`}
            >
              {project.status}
            </span>
          </div>

          <button
            onClick={onToggleFeature}
            title={project.is_featured ? 'Featured on Portfolio' : 'Feature on Portfolio'}
            className="text-[#64748B] hover:text-[#FFA116] transition p-1 cursor-pointer"
          >
            <Star
              className={`w-4 h-4 ${
                project.is_featured ? 'fill-[#FFA116] text-[#FFA116]' : 'hover:fill-[#FFA116]/20'
              }`}
            />
          </button>
        </div>

        {/* Title & Short Description */}
        <div>
          <h3
            onClick={onView}
            className="text-base font-bold text-[#262626] group-hover:text-[#FFA116] transition cursor-pointer line-clamp-1"
          >
            {project.title}
          </h3>
          <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
            {project.short_description}
          </p>
        </div>

        {/* Role & Tech Stack */}
        <div className="space-y-2">
          {project.user_role && (
            <p className="text-[11px] text-[#64748B]">
              Role: <span className="font-semibold text-[#262626]">{project.user_role}</span>
            </p>
          )}

          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-[#F1F3F5] text-[#262626] px-2 py-0.5 rounded border border-[#E5E7EB]"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="text-[10px] text-[#64748B] font-semibold self-center">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar & Readiness Badge */}
        <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">Milestone Progress:</span>
            <span className="font-bold text-[#16A34A]">{progress}%</span>
          </div>
          <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFA116] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#64748B]">Readiness Score:</span>
            <span
              className={`font-black ${
                readiness >= 80
                  ? 'text-[#16A34A]'
                  : readiness >= 50
                  ? 'text-[#FFA116]'
                  : 'text-[#D97706]'
              }`}
            >
              {readiness}/100
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Bottom Bar */}
      <div className="pt-3 mt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={onView}
            className="flex items-center gap-1 text-[#262626] hover:bg-[#F1F3F5] px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] font-medium transition cursor-pointer"
          >
            <Eye className="w-3 h-3 text-[#64748B]" />
            View
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-[#64748B] hover:text-[#262626] px-2 py-1.5 rounded-lg hover:bg-[#F1F3F5] font-medium transition cursor-pointer"
          >
            <Edit3 className="w-3 h-3 text-[#64748B]" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-[#64748B] hover:text-[#DC2626] p-1.5 rounded-lg hover:bg-[#FFEBEF] transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onInterviewPrep}
            className="flex items-center gap-1 bg-[#FFF8EE] hover:bg-[#FFA116] text-[#D97706] hover:text-white border border-[#FFA116]/30 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Prep
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENT: QUESTION CATEGORY CARD
========================================================= */
function QuestionCategoryCard({ title, questions }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!questions || !questions.length) return null;

  return (
    <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] overflow-hidden shadow-sm">
      <div className="p-3.5 bg-[#F7F8FA] border-b border-[#E5E7EB] font-bold text-[#262626] text-xs">
        {title} ({questions.length} questions)
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {questions.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="p-3.5 hover:bg-[#F7F8FA] transition">
              <div
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#FFA116] shrink-0 mt-0.5" />
                  <p className="font-semibold text-[#262626] text-xs">{item.question}</p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${
                    isOpen ? 'rotate-90 text-[#FFA116]' : ''
                  }`}
                />
              </div>

              {isOpen && (
                <div className="mt-2.5 pl-6 space-y-1.5 text-[#64748B] text-[11px] leading-relaxed border-l-2 border-[#FFA116] ml-1">
                  <p>
                    <span className="font-bold text-[#262626]">Target Focus:</span>{' '}
                    {item.target_focus || 'Explain problem context and implementation.'}
                  </p>
                  <p>
                    <span className="font-bold text-[#64748B]">Tips:</span>{' '}
                    {item.tips || 'Be concise, refer to actual technologies used, and state technical trade-offs.'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
