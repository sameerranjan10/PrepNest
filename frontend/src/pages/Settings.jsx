import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AvatarCropModal } from '@/components/settings/AvatarCropModal';
import {
  CodingProfilesSection,
  SocialPortfolioSection,
} from '@/components/settings/CodingAndSocialSections';
import {
  PreparationGoalsSection,
  SecuritySection,
  AccountPreferencesSection,
} from '@/components/settings/GoalsSecurityPrefsSections';
import {
  SUGGESTED_SKILLS,
  SUGGESTED_COMPANIES,
  SUGGESTED_ROLES,
  buildFormStateFromUser,
  buildPayloadFromForm,
  calculateProfileCompletion,
} from '@/components/settings/settingsConfig';
import {
  User,
  GraduationCap,
  Code2,
  Share2,
  Target,
  ShieldCheck,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Plus,
  X,
  Pencil,
  Check,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXT_RE = /\.(jpg|jpeg|png|webp)$/i;

const NAV_TABS = [
  { id: 'personal', label: 'Personal & Career', icon: User },
  { id: 'academic', label: 'Academic Details', icon: GraduationCap },
  { id: 'platforms', label: 'Coding Profiles', icon: Code2 },
  { id: 'links', label: 'Social & Portfolio', icon: Share2 },
  { id: 'preferences', label: 'Preparation Goals', icon: Target },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'account', label: 'Account Preferences', icon: Sliders },
];

export default function SettingsPage() {
  const { user, logout, updateProfile, changePassword, uploadAvatar, removeAvatar } = useAuth();
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState(() => buildFormStateFromUser(user));
  const [savedSnapshotJson, setSavedSnapshotJson] = useState(() =>
    JSON.stringify(buildPayloadFromForm(buildFormStateFromUser(user)))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Avatar upload / crop / remove state
  const fileInputRef = useRef(null);
  const [avatarError, setAvatarError] = useState(null);
  const [isAvatarBusy, setIsAvatarBusy] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [cropDraft, setCropDraft] = useState({
    isOpen: false,
    imageSrc: null,
    fileName: '',
    fileSize: 0,
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Tag & inline skill edit states
  const [newCompanyInput, setNewCompanyInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editingSkillIdx, setEditingSkillIdx] = useState(null);
  const [editingSkillValue, setEditingSkillValue] = useState('');

  // Unsaved navigation confirmation modal
  const [pendingNavHref, setPendingNavHref] = useState(null);

  // Synchronize form with backend user whenever user loads or updates (unless dirty)
  const currentPayloadJson = useMemo(
    () => JSON.stringify(buildPayloadFromForm(formData)),
    [formData]
  );
  const hasUnsavedChanges = currentPayloadJson !== savedSnapshotJson;

  useEffect(() => {
    if (!user) return;
    const syncedForm = buildFormStateFromUser(user);
    const syncedJson = JSON.stringify(buildPayloadFromForm(syncedForm));
    setFormData((prev) => {
      const prevJson = JSON.stringify(buildPayloadFromForm(prev));
      if (prevJson === savedSnapshotJson) {
        return syncedForm;
      }
      return prev;
    });
    setSavedSnapshotJson(syncedJson);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn on tab close / reload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept in-app link clicks when unsaved changes exist (compatible with BrowserRouter)
  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      if (anchor.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href === '/settings') return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNavHref(href);
    };
    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [hasUnsavedChanges]);

  // Revoke temporary object URL when crop modal closes
  useEffect(() => {
    return () => {
      if (cropDraft.imageSrc) {
        URL.revokeObjectURL(cropDraft.imageSrc);
      }
    };
  }, [cropDraft.imageSrc]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    handleFieldChange(name, type === 'checkbox' ? checked : value);
  };

  // Profile Picture Validation + Preview/Crop Trigger
  const processSelectedAvatarFile = (file) => {
    setAvatarError(null);
    if (!file) return;

    const validMime = file.type ? ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) : false;
    const validExt = ALLOWED_EXT_RE.test(file.name || '');

    if (!validMime && !validExt) {
      setAvatarError('Invalid file type. Please choose a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image exceeds 5 MB limit. Please upload a smaller photo.');
      return;
    }

    if (file.size === 0) {
      setAvatarError('Selected image file is empty.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCropDraft({
      isOpen: true,
      imageSrc: previewUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  };

  const handleAvatarFileInput = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    processSelectedAvatarFile(file);
  };

  const handleConfirmAvatarCrop = async (croppedBlob, outName) => {
    setIsAvatarBusy(true);
    setAvatarError(null);
    const res = await uploadAvatar(croppedBlob, outName);
    setIsAvatarBusy(false);

    if (res.success) {
      if (cropDraft.imageSrc) URL.revokeObjectURL(cropDraft.imageSrc);
      setCropDraft({ isOpen: false, imageSrc: null, fileName: '', fileSize: 0 });
      setStatusMessage({
        type: 'success',
        text: 'Profile picture updated across PrepNest!',
      });
    } else {
      setAvatarError(res.error || 'Could not save profile picture.');
    }
  };

  const handleRemovePhoto = async () => {
    setIsAvatarBusy(true);
    setAvatarError(null);
    const res = await removeAvatar();
    setIsAvatarBusy(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'Profile picture removed. Showing initials avatar.',
      });
    } else {
      setAvatarError(res.error || 'Could not remove profile picture.');
    }
  };

  // Company & Skill Tag Helpers
  const handleAddCompany = (companyToAdd) => {
    const comp = (companyToAdd ?? newCompanyInput).trim();
    if (!comp) return;
    if (!formData.target_companies.some((c) => c.toLowerCase() === comp.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        target_companies: [...prev.target_companies, comp],
      }));
    }
    if (companyToAdd === undefined) setNewCompanyInput('');
  };

  const handleRemoveCompany = (companyToRemove) => {
    setFormData((prev) => ({
      ...prev,
      target_companies: prev.target_companies.filter((c) => c !== companyToRemove),
    }));
  };

  const handleAddSkill = (skillToAdd) => {
    const skill = (skillToAdd ?? newSkillInput).trim();
    if (!skill) return;
    if (!formData.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    if (skillToAdd === undefined) setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditingSkillIdx(null);
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleCommitSkillEdit = (idx) => {
    const nextVal = editingSkillValue.trim();
    if (!nextVal) {
      setEditingSkillIdx(null);
      return;
    }
    setFormData((prev) => {
      const copy = [...prev.skills];
      if (
        copy.some(
          (item, i) => i !== idx && item.toLowerCase() === nextVal.toLowerCase()
        )
      ) {
        return prev;
      }
      copy[idx] = nextVal;
      return { ...prev, skills: copy };
    });
    setEditingSkillIdx(null);
    setEditingSkillValue('');
  };

  const handleDiscardChanges = () => {
    const resetForm = buildFormStateFromUser(user);
    setFormData(resetForm);
    setSavedSnapshotJson(JSON.stringify(buildPayloadFromForm(resetForm)));
    setEditingSkillIdx(null);
    setStatusMessage(null);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = buildPayloadFromForm(formData);
      const res = await updateProfile(payload);
      if (res.success) {
        const updatedForm = buildFormStateFromUser(res.user);
        setFormData(updatedForm);
        setSavedSnapshotJson(JSON.stringify(buildPayloadFromForm(updatedForm)));
        setStatusMessage({
          type: 'success',
          text: 'All changes saved to your PrepNest profile.',
        });
        return true;
      }
      setStatusMessage({
        type: 'error',
        text: res.warning || 'Could not save changes.',
      });
      return false;
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save changes.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordStatus({
        type: 'error',
        text: 'New password must be at least 6 characters long.',
      });
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordStatus({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSignOut = () => {
    navigate('/landing', { replace: true });
    logout();
  };

  const completion = useMemo(
    () => calculateProfileCompletion(formData, user),
    [formData, user]
  );

  const displayName = formData.full_name || user?.full_name || user?.name || 'Student Account';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0D1117] text-[#1E293B] dark:text-[#E6EDF3] font-sans">
      <Sidebar activeRoute="settings" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        {/* Hidden Shared Avatar File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleAvatarFileInput}
          className="hidden"
        />

        <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-[1440px]">
          {/* Page Header */}
          <div className="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-5 sm:p-6 md:pr-[132px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" size="sm">
                  Account Management
                </Badge>
                <Badge variant="neutral" size="sm">
                  {user?.plan || 'Pro'} Plan
                </Badge>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-[#D97706]/15 border border-[#F59E0B]/40 text-[11px] font-semibold text-[#D97706] dark:text-[#FFA116]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                    Unsaved changes
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-[#E6EDF3] tracking-tight">
                Settings &amp; Candidate Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Manage your profile identity, academic credentials, coding handles, preparation goals, and account security.
              </p>
            </div>

            {activeTab !== 'security' && (
              <div className="flex items-center gap-2.5 shrink-0">
                {hasUnsavedChanges && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleDiscardChanges}
                    disabled={isSaving}
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Discard
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={isSaving}
                  onClick={handleSaveProfile}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

          {/* Save Status Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                statusMessage.type === 'success'
                  ? 'bg-[#F0FDF4] dark:bg-[#16A34A]/15 border-[#16A34A]/30 text-[#16A34A] font-semibold'
                  : 'bg-[#FEF2F2] dark:bg-[#F85149]/15 border-[#DC2626]/30 text-[#DC2626] font-semibold'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="p-0.5 rounded hover:bg-black/5 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Two-Column Settings Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Profile Overview + 7-Category Navigation */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
              {/* Dedicated Profile Overview Panel */}
              <div className="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Large Circular Avatar with Camera Overlay */}
                  <div className="relative group">
                    <UserAvatar
                      src={user?.avatar_url}
                      name={displayName}
                      size="2xl"
                      className="ring-4 ring-[#F8FAFC] dark:ring-[#0D1117] border-2 border-[#F59E0B] shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAvatarBusy}
                      title={user?.avatar_url ? 'Change profile picture' : 'Upload profile picture'}
                      aria-label={user?.avatar_url ? 'Change profile picture' : 'Upload profile picture'}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-white border-2 border-white dark:border-[#161B22] flex items-center justify-center shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Upload / Change / Remove Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAvatarBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#F59E0B]/40 text-xs font-semibold text-[#D97706] dark:text-[#FFA116] hover:bg-[#F59E0B] hover:text-white transition cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{user?.avatar_url ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>

                    {user?.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isAvatarBusy}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-medium text-[#64748B] hover:text-[#DC2626] hover:border-[#DC2626]/40 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-[#64748B]">
                    JPG, JPEG, PNG or WebP • Max 5 MB
                  </p>

                  {avatarError && (
                    <div className="w-full p-2.5 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 text-[11px] text-[#DC2626] font-medium text-left">
                      {avatarError}
                    </div>
                  )}

                  {/* Identity Details */}
                  <div className="w-full pt-1 space-y-1">
                    <h2 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                      {displayName}
                    </h2>
                    <p className="text-xs font-medium text-[#F59E0B] truncate">
                      {formData.target_role || 'Target role not set'}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      {formData.email || user?.email || 'No email on file'}
                    </p>
                  </div>
                </div>

                {/* Profile Completeness */}
                <div className="pt-3.5 border-t border-[#E2E8F0] dark:border-[#30363D] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">Profile Completeness</span>
                    <span
                      className={`font-bold tabular-nums ${
                        completion.percentage >= 80 ? 'text-[#16A34A]' : 'text-[#F59E0B]'
                      }`}
                    >
                      {completion.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E2E8F0] dark:bg-[#21262D] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        completion.percentage >= 80 ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'
                      }`}
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    {completion.completed} of {completion.total} key profile milestones completed
                  </p>
                </div>
              </div>

              {/* Settings Categories Navigation */}
              <nav
                aria-label="Settings sections"
                className="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-2 shadow-sm flex flex-row lg:flex-col gap-1.5 lg:gap-1 overflow-x-auto lg:overflow-visible"
              >
                {NAV_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 lg:shrink lg:w-full flex items-center justify-between gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition text-left cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116] border border-[#F59E0B]/30 shadow-xs'
                          : 'text-[#64748B] hover:text-[#1E293B] dark:hover:text-[#E6EDF3] hover:bg-[#F8FAFC] dark:hover:bg-[#21262D] border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#F59E0B]' : 'text-[#64748B]'
                          }`}
                        />
                        <span>{tab.label}</span>
                      </span>
                      {isActive && <span className="hidden lg:inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* RIGHT COLUMN: Active Category Content Panel */}
            <section className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-5 sm:p-7 shadow-sm">
                {/* 1. PERSONAL & CAREER */}
                {activeTab === 'personal' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
                      <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                        Personal &amp; Career Identity
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Update your profile picture, contact information, career objective, target companies, and verified skills.
                      </p>
                    </div>

                    {/* Profile Picture Dropzone Card */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOverAvatar(true);
                      }}
                      onDragLeave={() => setIsDragOverAvatar(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverAvatar(false);
                        const dropped = e.dataTransfer.files?.[0];
                        if (dropped) processSelectedAvatarFile(dropped);
                      }}
                      className={`p-4 rounded-xl border border-dashed transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isDragOverAvatar
                          ? 'border-[#F59E0B] bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10'
                          : 'border-[#E2E8F0] dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          src={user?.avatar_url}
                          name={displayName}
                          size="xl"
                          className="border-2 border-[#F59E0B]/60 shadow-sm"
                        />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                            Profile Picture
                          </h4>
                          <p className="text-[11px] text-[#64748B]">
                            Drag &amp; drop an image here or click to upload &amp; crop. Visible across Topbar, Sidebar, Community &amp; Leaderboard.
                          </p>
                          <p className="text-[11px] text-[#94A3B8]">
                            Supported: JPG, JPEG, PNG, WebP (Max 5 MB)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          loading={isAvatarBusy}
                          onClick={() => fileInputRef.current?.click()}
                          icon={<Upload className="w-3.5 h-3.5" />}
                        >
                          {user?.avatar_url ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        {user?.avatar_url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isAvatarBusy}
                            onClick={handleRemovePhoto}
                            className="text-[#DC2626] hover:bg-[#FEF2F2]"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Personal Information Group */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Full Name</span>
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className="lc-input"
                            placeholder="Your full name"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>Email Address</span>
                            </span>
                            <span className="text-[10px] font-semibold text-[#16A34A]">
                              Verified
                            </span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            className="lc-input opacity-80 cursor-not-allowed bg-[#F8FAFC] dark:bg-[#0D1117]"
                            title="Email address is linked to your authentication session"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Phone Number</span>
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="lc-input"
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Location</span>
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="lc-input"
                            placeholder="City, State"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Career Information Group */}
                    <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#30363D]">
                      <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Career Information</span>
                      </h4>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          Target Role
                        </label>
                        <input
                          type="text"
                          name="target_role"
                          value={formData.target_role}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. Software Development Engineer (SDE-1)"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {SUGGESTED_ROLES.slice(0, 4).map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleFieldChange('target_role', role)}
                              className="text-[11px] px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] hover:text-[#F59E0B] hover:border-[#F59E0B]/40 transition cursor-pointer"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          Career Objective
                        </label>
                        <input
                          type="text"
                          name="career_objective"
                          value={formData.career_objective}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. Seeking a backend-focused SDE role building distributed, low-latency systems."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          Professional Summary
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={3}
                          className="lc-input resize-none"
                          placeholder="Summarize your core engineering strengths, notable projects, and placement focus..."
                        />
                      </div>
                    </div>

                    {/* Target Companies */}
                    <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#30363D]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Target Companies</span>
                        </label>
                        <span className="text-[11px] text-[#64748B]">
                          {formData.target_companies.length} selected
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {formData.target_companies.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#F59E0B]/30 text-xs font-semibold text-[#D97706] dark:text-[#FFA116]"
                          >
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCompany(c)}
                              className="hover:text-[#DC2626] cursor-pointer"
                              aria-label={`Remove ${c}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCompanyInput}
                          onChange={(e) => setNewCompanyInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && (e.preventDefault(), handleAddCompany())
                          }
                          placeholder="Add target company (e.g. Uber, Swiggy)..."
                          className="lc-input text-xs"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddCompany()}
                          icon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-[#64748B]">
                        <span>Suggestions:</span>
                        {SUGGESTED_COMPANIES.filter(
                          (c) => !formData.target_companies.includes(c)
                        )
                          .slice(0, 7)
                          .map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleAddCompany(c)}
                              className="px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B] hover:text-[#F59E0B] transition cursor-pointer"
                            >
                              + {c}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Technical Skills (Add, Inline Edit & Remove) */}
                    <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#30363D]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                          Technical Skills
                        </label>
                        <span className="text-[11px] text-[#64748B]">
                          Click edit icon on any tag to rename
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {formData.skills.map((s, idx) =>
                          editingSkillIdx === idx ? (
                            <span
                              key={`edit-${idx}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#0D1117] border border-[#F59E0B]"
                            >
                              <input
                                type="text"
                                value={editingSkillValue}
                                onChange={(e) => setEditingSkillValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCommitSkillEdit(idx);
                                  } else if (e.key === 'Escape') {
                                    setEditingSkillIdx(null);
                                  }
                                }}
                                autoFocus
                                className="text-xs w-28 bg-transparent outline-none text-[#1E293B] dark:text-[#E6EDF3]"
                              />
                              <button
                                type="button"
                                onClick={() => handleCommitSkillEdit(idx)}
                                className="text-[#16A34A] cursor-pointer"
                                aria-label="Confirm skill edit"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </span>
                          ) : (
                            <span
                              key={`${s}-${idx}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-medium text-[#1E293B] dark:text-[#E6EDF3]"
                            >
                              <span>{s}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSkillIdx(idx);
                                  setEditingSkillValue(s);
                                }}
                                className="text-[#94A3B8] hover:text-[#F59E0B] cursor-pointer"
                                title="Edit skill"
                                aria-label={`Edit ${s}`}
                              >
                                <Pencil className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(s)}
                                className="text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"
                                title="Remove skill"
                                aria-label={`Remove ${s}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && (e.preventDefault(), handleAddSkill())
                          }
                          placeholder="Add technical skill (e.g. FastAPI, Redis, Kubernetes)..."
                          className="lc-input text-xs"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddSkill()}
                          icon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-[#64748B]">
                        <span>Popular:</span>
                        {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s))
                          .slice(0, 7)
                          .map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleAddSkill(s)}
                              className="px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B] hover:text-[#F59E0B] transition cursor-pointer"
                            >
                              + {s}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSaving}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Personal &amp; Career
                      </Button>
                    </div>
                  </form>
                )}

                {/* 2. ACADEMIC DETAILS */}
                {activeTab === 'academic' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
                      <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                        Academic Details
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Keep your university records accurate for campus placement eligibility tracking.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                          University / Institution
                        </label>
                        <input
                          type="text"
                          name="college"
                          value={formData.college}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. National Institute of Technology"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">Degree</label>
                        <input
                          type="text"
                          name="degree"
                          value={formData.degree}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. B.Tech / B.E. / MCA"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          Department / Branch
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. Computer Science & Engineering"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          Graduation Year
                        </label>
                        <select
                          name="grad_year"
                          value={formData.grad_year}
                          onChange={handleInputChange}
                          className="lc-input cursor-pointer"
                        >
                          {[2023, 2024, 2025, 2026, 2027, 2028, 2029].map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          Current Semester
                        </label>
                        <select
                          name="current_semester"
                          value={formData.current_semester}
                          onChange={handleInputChange}
                          className="lc-input cursor-pointer"
                        >
                          {[
                            'Semester 1',
                            'Semester 2',
                            'Semester 3',
                            'Semester 4',
                            'Semester 5',
                            'Semester 6',
                            'Semester 7',
                            'Semester 8',
                            'Graduated',
                          ].map((sem) => (
                            <option key={sem} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          CGPA (Out of 10.0)
                        </label>
                        <input
                          type="text"
                          name="cgpa"
                          value={formData.cgpa}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. 8.75"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          Active Backlogs (if applicable)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          name="backlogs"
                          value={formData.backlogs}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          Class 10th Percentage
                        </label>
                        <input
                          type="text"
                          name="tenth_percentage"
                          value={formData.tenth_percentage}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. 92.4%"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#64748B]">
                          Class 12th / Diploma Percentage
                        </label>
                        <input
                          type="text"
                          name="twelfth_percentage"
                          value={formData.twelfth_percentage}
                          onChange={handleInputChange}
                          className="lc-input"
                          placeholder="e.g. 89.6%"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSaving}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Academic Details
                      </Button>
                    </div>
                  </form>
                )}

                {/* 3. CODING PROFILES */}
                {activeTab === 'platforms' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <CodingProfilesSection
                      formData={formData}
                      onFieldChange={handleFieldChange}
                    />
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSaving}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Coding Profiles
                      </Button>
                    </div>
                  </form>
                )}

                {/* 4. SOCIAL & PORTFOLIO */}
                {activeTab === 'links' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <SocialPortfolioSection
                      formData={formData}
                      onFieldChange={handleFieldChange}
                    />
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSaving}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Social &amp; Portfolio
                      </Button>
                    </div>
                  </form>
                )}

                {/* 5. PREPARATION GOALS */}
                {activeTab === 'preferences' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <PreparationGoalsSection
                      formData={formData}
                      onFieldChange={handleFieldChange}
                      onAddCompany={handleAddCompany}
                      onRemoveCompany={handleRemoveCompany}
                    />
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSaving}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Preparation Goals
                      </Button>
                    </div>
                  </form>
                )}

                {/* 6. SECURITY */}
                {activeTab === 'security' && (
                  <SecuritySection
                    user={user}
                    passwordData={passwordData}
                    setPasswordData={setPasswordData}
                    passwordStatus={passwordStatus}
                    isChangingPass={isChangingPass}
                    onChangePasswordSubmit={handleChangePasswordSubmit}
                    onLogout={handleSignOut}
                  />
                )}

                {/* 7. ACCOUNT PREFERENCES */}
                {activeTab === 'account' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <AccountPreferencesSection
                      formData={formData}
                      onFieldChange={handleFieldChange}
                      isDark={isDark}
                      setTheme={setTheme}
                    />
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSaving}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Account Preferences
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        </BlurDrop>
      </div>

      {/* Avatar Crop & Preview Modal */}
      <AvatarCropModal
        isOpen={cropDraft.isOpen}
        imageSrc={cropDraft.imageSrc}
        fileName={cropDraft.fileName}
        fileSize={cropDraft.fileSize}
        isUploading={isAvatarBusy}
        error={avatarError}
        onClose={() => {
          if (cropDraft.imageSrc) URL.revokeObjectURL(cropDraft.imageSrc);
          setCropDraft({ isOpen: false, imageSrc: null, fileName: '', fileSize: 0 });
        }}
        onConfirm={handleConfirmAvatarCrop}
      />

      {/* Unsaved Changes Navigation Guard Modal */}
      {pendingNavHref && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/55 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] dark:bg-[#D97706]/15 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                  Unsaved Profile Changes
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  You have modified your settings without saving. Would you like to save your changes before leaving?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPendingNavHref(null)}
              >
                Stay on Page
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const dest = pendingNavHref;
                  handleDiscardChanges();
                  setPendingNavHref(null);
                  navigate(dest);
                }}
              >
                Discard &amp; Leave
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={isSaving}
                onClick={async () => {
                  const dest = pendingNavHref;
                  const ok = await handleSaveProfile();
                  if (ok) {
                    setPendingNavHref(null);
                    navigate(dest);
                  }
                }}
              >
                Save &amp; Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
