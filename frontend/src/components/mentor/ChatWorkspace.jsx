import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Plus,
  Copy,
  Check,
  ArrowUpRight,
  PanelLeftOpen,
  PanelLeftClose,
  PanelTopOpen,
  PanelTopClose,
  ChevronsLeft,
  ChevronsRight,
  PanelRight,
  Maximize2,
  Minimize2,
  Menu
} from 'lucide-react';
import { ComponentLoader } from '@/components/ui/PrepNestLoader';
import { MarkdownContent } from './MarkdownContent';
import { MessageComposer } from './MessageComposer';
import { getContextualPrompts } from './mentorConfig';

export function ChatWorkspace({
  activeModeConfig,
  selectedMode,
  onSelectMode,
  responseLength,
  setResponseLength,
  messages,
  activeConversationId,
  isLoading,
  isLoadingConversation,
  contextSummary,
  user,
  inputValue,
  setInputValue,
  attachedFile,
  setAttachedFile,
  copiedMessageId,
  messagesEndRef,
  onSendMessage,
  onExplainMore,
  onCopyMessage,
  onNewChat,
  isGlobalSidebarCollapsed,
  onToggleGlobalSidebar,
  isConvSidebarCollapsed,
  onToggleConvSidebar,
  onOpenMobileHistory,
  isTopBarCollapsed,
  onToggleTopBar,
  isFocusMode,
  onToggleFocusMode,
  isContextOpen,
  onToggleContext
}) {
  const BLUR_DROP_EASE = [0.16, 1, 0.3, 1];
  const ModeIcon = activeModeConfig.icon || Bot;
  const contextualPrompts = getContextualPrompts(selectedMode, contextSummary);

  const userInitials = (contextSummary?.student_name || user?.full_name || user?.name || 'ME')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex-1 flex flex-col min-w-0 h-full bg-transparent">
      {/* CHAT HEADER — Floating Frosted Glass matching Top Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.42, ease: BLUR_DROP_EASE }}
        className={`mx-4 sm:mx-6 lg:mx-8 mt-2.5 min-h-[52px] px-3.5 sm:px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/80 ring-1 ring-[#E5E7EB]/65 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] flex flex-wrap items-center justify-between gap-2 shrink-0 ${
          isTopBarCollapsed ? 'md:pr-[124px] lg:pr-[132px]' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Expand/Collapse Conversation Sidebar (Desktop) */}
          <button
            onClick={onToggleConvSidebar}
            title={isConvSidebarCollapsed ? 'Show conversations sidebar' : 'Hide conversations sidebar'}
            aria-label={isConvSidebarCollapsed ? 'Show conversations sidebar' : 'Hide conversations sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg border border-[#E5E7EB]/80 bg-white/65 hover:bg-white text-[#64748B] hover:text-[#262626] transition shrink-0"
          >
            {isConvSidebarCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5 text-[#FFA116]" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Mobile Conversations History Trigger */}
          <button
            onClick={onOpenMobileHistory}
            title="Open conversations"
            aria-label="Open conversations"
            className="lg:hidden p-1.5 rounded-lg border border-[#E5E7EB]/80 bg-white/65 text-[#64748B] hover:text-[#262626] transition shrink-0"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[#E5E7EB]/80 mx-0.5 hidden sm:block shrink-0" />

          {/* Synchronized Current Mode Display: Icon | Name | Short Description */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] shrink-0">
              <ModeIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex items-baseline gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-[#262626] truncate">
                {activeModeConfig.name}
              </h2>
              <p className="text-[11px] text-[#64748B] truncate hidden xl:block">
                {activeModeConfig.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Response Depth Selector */}
          <div
            role="group"
            aria-label="Response depth"
            className="inline-flex rounded-lg bg-[#F7F8FA] p-0.5 border border-[#E5E7EB]"
          >
            {[
              { id: 'quick', label: 'Quick' },
              { id: 'normal', label: 'Normal' },
              { id: 'detailed', label: 'Detailed' }
            ].map(opt => {
              const active = responseLength === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setResponseLength(opt.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                    active
                      ? 'bg-[#FFA116] text-white font-semibold shadow-2xs'
                      : 'text-[#64748B] hover:text-[#262626]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {activeConversationId && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#262626] text-[11px] font-semibold transition"
              title="Start new conversation"
            >
              <Plus className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Context button in Chat Header */}
          <button
            onClick={onToggleContext}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
              isContextOpen
                ? 'bg-[#FFA116] border-[#FFA116] text-white'
                : 'bg-white/70 hover:bg-white border-[#E5E7EB]/80 text-[#262626]'
            }`}
            title="Toggle student context drawer"
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Context</span>
          </button>
        </div>
      </motion.div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin">
        {isLoadingConversation ? (
          <div className="h-full flex items-center justify-center">
            <ComponentLoader size="sm" message="Loading conversation..." />
          </div>
        ) : messages.length === 0 ? (
          /* EMPTY STATE */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-4">
            <motion.div
              initial={{ opacity: 0, y: -22, scale: 0.9, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: BLUR_DROP_EASE }}
              className="w-14 h-14 rounded-2xl bg-[#FFF8EE] border border-[#FFA116]/25 flex items-center justify-center p-2 mb-3 shadow-2xs"
            >
              <img
                src="/logo-icon.png"
                alt="PrepNest"
                className="w-full h-full object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -16, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.52, delay: 0.08, ease: BLUR_DROP_EASE }}
              className="flex flex-col items-center"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFA116]">
                PrepNest AI Mentor
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-[#262626] mt-1 tracking-tight">
                How can I help you today?
              </h3>

              <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-md leading-relaxed">
                Your personal assistant for placement preparation, coding interviews and career development.
              </p>
            </motion.div>

            {/* Suggested Prompt Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-7 text-left">
              {contextualPrompts.map((item, idx) => {
                const PromptIcon = item.icon || Sparkles;
                return (
                  <motion.button
                    key={`${selectedMode}-${idx}`}
                    initial={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.45, delay: 0.14 + idx * 0.055, ease: BLUR_DROP_EASE }}
                    onClick={() => onSendMessage(item.prompt, null, item.mode)}
                    className="group p-3 rounded-xl border border-[#E5E7EB] hover:border-[#FFA116]/60 bg-white/75 backdrop-blur-md hover:bg-white/90 transition flex items-center justify-between gap-2.5 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] group-hover:bg-[#FFF8EE] border border-[#E5E7EB] group-hover:border-[#FFA116]/30 flex items-center justify-center text-[#64748B] group-hover:text-[#FFA116] transition shrink-0">
                        <PromptIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-[#262626] group-hover:text-[#262626] line-clamp-2">
                        {item.label}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FFA116] transition shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          /* CONVERSATION THREAD */
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';

              if (isUser) {
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.35, ease: BLUR_DROP_EASE }}
                    className="flex justify-end gap-3"
                  >
                    <div className="max-w-[85%] sm:max-w-[75%] space-y-1 flex flex-col items-end">
                      <div className="bg-white/75 backdrop-blur-md border border-[#E5E7EB] text-[#262626] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-[0_2px_12px_-3px_rgba(15,23,42,0.05)]">
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      {msg.created_at && (
                        <span className="text-[10px] text-[#94A3B8] px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#262626] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      {userInitials}
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.38, ease: BLUR_DROP_EASE }}
                  className="flex justify-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 p-1 flex items-center justify-center shrink-0 mt-0.5">
                    <img
                      src="/logo-icon.png"
                      alt="PrepNest Mentor"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#262626]">PrepNest Mentor</span>
                      {msg.meta?.mode && (
                        <span className="px-1.5 py-0.5 rounded bg-[#F7F8FA] border border-[#E5E7EB] text-[10px] font-mono text-[#64748B]">
                          {msg.meta.mode}
                        </span>
                      )}
                      {msg.created_at && (
                        <span className="text-[#94A3B8]">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-[#262626] leading-relaxed">
                      <MarkdownContent content={msg.content} />
                    </div>

                    {/* Message Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => onExplainMore(msg.content)}
                        disabled={isLoading}
                        className="text-[11px] text-[#FFA116] hover:text-[#D97706] flex items-center gap-1 transition bg-[#FFF8EE] hover:bg-[#FFF2DE] px-2 py-1 rounded-md border border-[#FFA116]/30 font-medium"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Explain more</span>
                      </button>

                      <button
                        onClick={() => onCopyMessage(msg.content, msg.id || idx)}
                        className="text-[11px] text-[#64748B] hover:text-[#262626] flex items-center gap-1 transition bg-[#FFFFFF] hover:bg-[#F7F8FA] px-2 py-1 rounded-md border border-[#E5E7EB]"
                      >
                        {copiedMessageId === (msg.id || idx) ? (
                          <>
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span className="text-[#16A34A] font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {msg.meta?.usage && (msg.meta.usage.total_tokens > 0 || msg.meta.usage.completion_tokens > 0) && (
                        <span className="text-[10px] text-[#94A3B8] font-mono ml-1">
                          {msg.meta.usage.total_tokens || msg.meta.usage.completion_tokens} tokens
                          {msg.meta.usage.latency_ms ? ` · ${msg.meta.usage.latency_ms}ms` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* AI Thinking Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.25, ease: BLUR_DROP_EASE }}
                className="flex justify-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 p-1 flex items-center justify-center shrink-0 animate-pulse">
                  <img
                    src="/logo-icon.png"
                    alt="PrepNest Mentor"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 py-2 text-xs text-[#64748B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFA116] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFA116] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFA116] animate-bounce [animation-delay:0.3s]" />
                  <span className="ml-1 font-medium">PrepNest Mentor is thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* MESSAGE COMPOSER */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.48, delay: 0.18, ease: BLUR_DROP_EASE }}
      >
        <MessageComposer
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={onSendMessage}
          isLoading={isLoading}
          selectedMode={selectedMode}
          onSelectMode={onSelectMode}
          responseLength={responseLength}
          setResponseLength={setResponseLength}
          attachedFile={attachedFile}
          setAttachedFile={setAttachedFile}
        />
      </motion.div>
    </section>
  );
}

