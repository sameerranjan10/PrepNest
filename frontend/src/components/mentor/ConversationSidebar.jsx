import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
  X,
  Check,
  PanelLeftClose
} from 'lucide-react';

function groupConversationsByDate(conversations) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOf7Days = new Date(startOfToday);
  startOf7Days.setDate(startOf7Days.getDate() - 7);

  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: []
  };

  conversations.forEach(conv => {
    const rawDate = conv.updated_at || conv.created_at;
    const d = rawDate ? new Date(rawDate) : now;
    if (isNaN(d.getTime())) {
      groups.Today.push(conv);
    } else if (d >= startOfToday) {
      groups.Today.push(conv);
    } else if (d >= startOfYesterday) {
      groups.Yesterday.push(conv);
    } else if (d >= startOf7Days) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  return groups;
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationSidebar({
  conversations,
  isLoadingList,
  activeConversationId,
  customTitles,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  isDesktopCollapsed,
  onToggleDesktopCollapse,
  isMobileOpen,
  onCloseMobile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => {
      const displayTitle = (customTitles[c.id] || c.title || 'Untitled Conversation').toLowerCase();
      return displayTitle.includes(q);
    });
  }, [conversations, searchQuery, customTitles]);

  const grouped = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  const startRename = (e, conv) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setRenamingId(conv.id);
    setRenameValue(customTitles[conv.id] || conv.title || 'New Conversation');
  };

  const commitRename = (e, convId) => {
    if (e) e.stopPropagation();
    if (renameValue.trim()) {
      onRenameConversation(convId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const cancelRename = (e) => {
    if (e) e.stopPropagation();
    setRenamingId(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-[250px] bg-white/55 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/80 ring-1 ring-[#E5E7EB]/60 select-none shadow-[inset_-1px_0_0_rgba(255,255,255,0.8)]">
      {/* Header: Conversations + New Chat + Search */}
      <div className="p-3 border-b border-[#E5E7EB]/60 space-y-2.5 bg-white/45 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#FFA116]" />
            Conversations
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="flex items-center gap-1 bg-[#FFA116] hover:bg-[#F7931E] text-white text-[11px] font-semibold px-2 py-1 rounded-lg transition shadow-2xs"
              title="New conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              onClick={onToggleDesktopCollapse}
              className="hidden lg:flex p-1 text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] rounded-md transition"
              title="Collapse conversations sidebar"
              aria-label="Collapse conversations sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#64748B] hover:text-[#262626] rounded-md"
              aria-label="Close conversations"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] focus:border-[#FFA116] focus:bg-[#FFFFFF] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#262626] placeholder-[#94A3B8] outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#262626]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin">
        {isLoadingList ? (
          <div className="space-y-2 p-1">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-11 rounded-lg bg-[#E5E7EB]/60 animate-pulse" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-10 px-3">
            <MessageSquare className="w-6 h-6 text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#64748B]">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              {searchQuery ? 'Try a different keyword' : 'Start a new chat to get placement guidance'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([groupLabel, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={groupLabel} className="space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  {groupLabel}
                </div>

                {items.map(conv => {
                  const isActive = activeConversationId === conv.id;
                  const displayTitle = customTitles[conv.id] || conv.title || 'New Conversation';
                  const isRenaming = renamingId === conv.id;
                  const isMenuOpen = openMenuId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        if (!isRenaming) {
                          onSelectConversation(conv.id);
                          onCloseMobile();
                        }
                      }}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition border ${
                        isActive
                          ? 'bg-[#FFFFFF] border-[#FFA116]/40 text-[#262626] shadow-2xs'
                          : 'bg-transparent border-transparent hover:bg-[#FFFFFF]/80 text-[#64748B] hover:text-[#262626]'
                      }`}
                    >
                      {/* Active Vertical Indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#FFA116]" />
                      )}

                      {isRenaming ? (
                        <div
                          className="flex items-center gap-1 flex-1 min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(e, conv.id);
                              if (e.key === 'Escape') cancelRename(e);
                            }}
                            className="flex-1 min-w-0 bg-[#F7F8FA] border border-[#FFA116] rounded px-1.5 py-0.5 text-xs text-[#262626] outline-none"
                          />
                          <button
                            onClick={(e) => commitRename(e, conv.id)}
                            className="p-0.5 text-[#16A34A] hover:bg-[#E6FAF6] rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelRename}
                            className="p-0.5 text-[#64748B] hover:bg-[#F1F3F5] rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1 pr-1">
                            <p
                              className={`text-xs truncate leading-snug ${
                                isActive ? 'font-semibold text-[#262626]' : 'font-medium'
                              }`}
                            >
                              {displayTitle}
                            </p>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                              {formatRelativeTime(conv.updated_at || conv.created_at)}
                            </p>
                          </div>

                          {/* Three-dot Menu Trigger */}
                          <div className="relative shrink-0" ref={isMenuOpen ? menuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : conv.id);
                              }}
                              className={`p-1 rounded-md hover:bg-[#F1F3F5] text-[#64748B] hover:text-[#262626] transition ${
                                isMenuOpen || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              aria-label="Conversation options"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-7 w-32 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-30"
                              >
                                <button
                                  onClick={(e) => startRename(e, conv)}
                                  className="w-full px-3 py-1.5 text-left text-xs text-[#262626] hover:bg-[#F7F8FA] flex items-center gap-2 transition"
                                >
                                  <Pencil className="w-3 h-3 text-[#64748B]" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    setOpenMenuId(null);
                                    onDeleteConversation(e, conv.id);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs text-[#DC2626] hover:bg-[#FFEBEF]/60 flex items-center gap-2 transition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isDesktopCollapsed && (
        <aside className="hidden lg:flex shrink-0 h-full">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile / Tablet Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-xl animate-in slide-in-from-left duration-150">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

