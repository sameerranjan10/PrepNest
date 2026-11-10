import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { MENTOR_MODES } from '@/components/mentor/mentorConfig';
import { ConversationSidebar } from '@/components/mentor/ConversationSidebar';
import { ChatWorkspace } from '@/components/mentor/ChatWorkspace';
import { ContextDrawer } from '@/components/mentor/ContextDrawer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function AIAssistantPage() {
  const { user, token } = useAuth();

  // Core Conversation & Mode State
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
  const [responseLength, setResponseLength] = useState('normal');
  const [attachedFile, setAttachedFile] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Context, Drawers & Collapsible Layout State
  const [contextSummary, setContextSummary] = useState(null);
  const [isRefreshingContext, setIsRefreshingContext] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [isGlobalSidebarCollapsed, setIsGlobalSidebarCollapsed] = useState(false);
  const [isConvSidebarCollapsed, setIsConvSidebarCollapsed] = useState(true);
  const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(true);

  const [customTitles, setCustomTitles] = useState({});

  const messagesEndRef = useRef(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    fetchContextSummary();
    fetchConversations();
  }, [token]);

  const fetchContextSummary = async () => {
    setIsRefreshingContext(true);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/context-summary`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setContextSummary(data);
      }
    } catch (err) {
      console.warn('Could not load student context summary:', err);
    } finally {
      setIsRefreshingContext(false);
    }
  };

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/conversations`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.warn('Could not load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = async (convId) => {
    if (!convId) return;
    setActiveConversationId(convId);
    setIsLoadingConversation(true);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/conversations/${convId}`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.mode) {
          setSelectedMode(data.mode);
        }
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputValue('');
    setAttachedFile(null);
    setIsMobileHistoryOpen(false);
  };

  const handleRenameConversation = async (convId, newTitle) => {
    const clean = (newTitle || '').trim();
    if (!clean) return;
    setCustomTitles(prev => ({ ...prev, [convId]: clean }));
    setConversations(prev => prev.map(c => (c.id === convId ? { ...c, title: clean } : c)));
    try {
      await fetch(`${API_BASE}/api/mentor/conversations/${convId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ title: clean }),
      });
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/api/mentor/conversations/${convId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId));
        setCustomTitles(prev => {
          const updated = { ...prev };
          delete updated[convId];
          return updated;
        });
        if (activeConversationId === convId) {
          handleStartNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend = null, customLength = null, customMode = null) => {
    let rawText = (textToSend !== null ? textToSend : inputValue).trim();
    if (!rawText && !attachedFile) return;
    if (isLoading) return;

    if (attachedFile && textToSend === null) {
      const attachmentNote = attachedFile.textContent
        ? `\n\n[Attached File: ${attachedFile.name}]\n\`\`\`\n${attachedFile.textContent.slice(0, 6000)}\n\`\`\``
        : `\n\n[Attached File: ${attachedFile.name}]`;
      rawText = rawText
        ? `${rawText}${attachmentNote}`
        : `Please review this attached file.${attachmentNote}`;
    }

    const mode = customMode || selectedMode;
    if (customMode && customMode !== selectedMode) {
      setSelectedMode(customMode);
    }
    const lengthBudget = customLength || responseLength;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: rawText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    if (textToSend === null) {
      setInputValue('');
      setAttachedFile(null);
    }
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/mentor/chat`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          message: rawText,
          mode: mode,
          response_length: lengthBudget,
          conversation_id: activeConversationId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (!activeConversationId && data.conversation_id) {
          setActiveConversationId(data.conversation_id);
          fetchConversations();
        } else {
          // Refresh conversation list timestamps
          fetchConversations();
        }

        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          data.user_message || tempUserMsg,
          data.assistant_message
        ]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${errData.detail || 'Could not reach PrepNest AI Mentor service. Please try again.'}`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Network error: Could not connect to the backend server. Make sure the backend is running.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainMore = (msgContent) => {
    const cleanSnippet = (msgContent || '')
      .split('\n')[0]
      .replace(/[*#>`]/g, '')
      .trim()
      .slice(0, 100);
    handleSendMessage(`Explain in detail: "${cleanSnippet}"`, 'detailed');
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const activeModeConfig = MENTOR_MODES.find(m => m.id === selectedMode) || MENTOR_MODES[0];
  const isFocusMode = isGlobalSidebarCollapsed && isConvSidebarCollapsed && isTopBarCollapsed;

  const handleToggleFocusMode = () => {
    const next = !isFocusMode;
    setIsGlobalSidebarCollapsed(next);
    setIsConvSidebarCollapsed(next);
    setIsTopBarCollapsed(next);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="ai-assistant" />

      <div className="flex-1 min-w-0 flex flex-col h-[100dvh] overflow-hidden">
        <Header
          defaultCollapsed
          onTopBarChange={setIsTopBarCollapsed}
        />

        {/* C. SPLIT WORKSPACE: CONVERSATION SIDEBAR + MAIN CHAT WORKSPACE */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <ConversationSidebar
            conversations={conversations}
            isLoadingList={isLoadingConversations}
            activeConversationId={activeConversationId}
            customTitles={customTitles}
            onSelectConversation={loadConversation}
            onNewChat={handleStartNewChat}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={handleDeleteConversation}
            isDesktopCollapsed={isConvSidebarCollapsed}
            onToggleDesktopCollapse={() => setIsConvSidebarCollapsed(prev => !prev)}
            isMobileOpen={isMobileHistoryOpen}
            onCloseMobile={() => setIsMobileHistoryOpen(false)}
          />

          <ChatWorkspace
            activeModeConfig={activeModeConfig}
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            responseLength={responseLength}
            setResponseLength={setResponseLength}
            messages={messages}
            activeConversationId={activeConversationId}
            isLoading={isLoading}
            isLoadingConversation={isLoadingConversation}
            contextSummary={contextSummary}
            user={user}
            inputValue={inputValue}
            setInputValue={setInputValue}
            attachedFile={attachedFile}
            setAttachedFile={setAttachedFile}
            copiedMessageId={copiedMessageId}
            messagesEndRef={messagesEndRef}
            onSendMessage={handleSendMessage}
            onExplainMore={handleExplainMore}
            onCopyMessage={handleCopyMessage}
            onNewChat={handleStartNewChat}
            isGlobalSidebarCollapsed={isGlobalSidebarCollapsed}
            onToggleGlobalSidebar={() => setIsGlobalSidebarCollapsed(prev => !prev)}
            isConvSidebarCollapsed={isConvSidebarCollapsed}
            onToggleConvSidebar={() => setIsConvSidebarCollapsed(prev => !prev)}
            onOpenMobileHistory={() => setIsMobileHistoryOpen(true)}
            isTopBarCollapsed={isTopBarCollapsed}
            onToggleTopBar={() => setIsTopBarCollapsed(prev => !prev)}
            isFocusMode={isFocusMode}
            onToggleFocusMode={handleToggleFocusMode}
            isContextOpen={isContextOpen}
            onToggleContext={() => setIsContextOpen(prev => !prev)}
          />
        </div>
      </div>

      {/* COLLAPSIBLE RIGHT-SIDE CONTEXT DRAWER */}
      <ContextDrawer
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        contextSummary={contextSummary}
        user={user}
        onRefreshContext={fetchContextSummary}
        isRefreshing={isRefreshingContext}
      />
    </div>
  );
}
