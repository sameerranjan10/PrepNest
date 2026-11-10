import React, { useRef, useState, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Code2,
  FileText,
  X,
  ChevronUp,
  Check,
  Bot,
  SlidersHorizontal
} from 'lucide-react';
import { MODE_GROUPS, MENTOR_MODES } from './mentorConfig';

const RESPONSE_DEPTHS = [
  { id: 'quick', label: 'Quick', desc: 'Concise summary (~100 tokens)' },
  { id: 'normal', label: 'Normal', desc: 'Balanced guidance (~250 tokens)' },
  { id: 'detailed', label: 'Detailed', desc: 'Deep-dive breakdown (~500 tokens)' }
];

export function MessageComposer({
  inputValue,
  setInputValue,
  onSend,
  isLoading,
  selectedMode,
  onSelectMode,
  responseLength,
  setResponseLength,
  attachedFile,
  setAttachedFile
}) {
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [depthMenuOpen, setDepthMenuOpen] = useState(false);

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const modeDropdownRef = useRef(null);
  const depthDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target)) {
        setModeMenuOpen(false);
      }
      if (depthDropdownRef.current && !depthDropdownRef.current.contains(e.target)) {
        setDepthMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isTextLike = /\.(txt|md|py|js|jsx|ts|tsx|java|cpp|c|json|csv|html|css)$/i.test(file.name);
    if (isTextLike && file.size < 100 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          textContent: typeof reader.result === 'string' ? reader.result : null
        });
      };
      reader.readAsText(file);
    } else {
      setAttachedFile({
        name: file.name,
        size: file.size,
        textContent: null
      });
    }
    e.target.value = '';
  };

  const activeMode = MENTOR_MODES.find(m => m.id === selectedMode) || MENTOR_MODES[0];
  const ActiveModeIcon = activeMode.icon || Bot;
  const activeDepth = RESPONSE_DEPTHS.find(d => d.id === responseLength) || RESPONSE_DEPTHS[1];

  const canSend = (inputValue.trim().length > 0 || Boolean(attachedFile)) && !isLoading;

  return (
    <div className="px-4 sm:px-6 pb-4 pt-2 bg-transparent shrink-0">
      <div className="max-w-3xl mx-auto w-full">
        {/* Attached File Chip */}
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-md border border-[#E5E7EB] text-xs text-[#262626] w-fit">
            <FileText className="w-3.5 h-3.5 text-[#FFA116] shrink-0" />
            <span className="font-medium truncate max-w-xs">{attachedFile.name}</span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="p-0.5 text-[#64748B] hover:text-[#DC2626] transition"
              aria-label="Remove attachment"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Composer Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#E5E7EB] focus-within:border-[#FFA116] rounded-2xl p-2.5 transition shadow-[0_8px_24px_-6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your placement coach anything..."
            rows={2}
            className="w-full bg-transparent px-2 py-1 text-sm text-[#262626] focus:outline-none placeholder:text-[#94A3B8] resize-none max-h-40 scrollbar-thin"
          />

          {/* Bottom Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-1 border-t border-[#F1F3F5] px-1">
            {/* Left Controls: Attachment, Code, AI Mode Selector, Response Depth */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.md,.py,.js,.jsx,.ts,.tsx,.java,.cpp,.c,.json,.csv"
                className="hidden"
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] border border-transparent hover:border-[#E5E7EB] transition"
                title="Attach resume, code, or text file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Code Snippet Helper */}
              <button
                type="button"
                onClick={() => {
                  setInputValue(prev =>
                    prev ? `${prev}\n\`\`\`\n\n\`\`\`` : `\`\`\`\n// Paste your code here\n\n\`\`\``
                  );
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] border border-transparent hover:border-[#E5E7EB] transition"
                title="Insert code block"
              >
                <Code2 className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-[#E5E7EB] mx-0.5 hidden sm:block" />

              {/* AI MODE SELECTOR DROPDOWN (opens upward) */}
              <div className="relative" ref={modeDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setModeMenuOpen(prev => !prev);
                    setDepthMenuOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={modeMenuOpen}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    modeMenuOpen
                      ? 'bg-[#FFF8EE] border-[#FFA116] text-[#FFA116]'
                      : 'bg-[#F7F8FA] hover:bg-[#F1F3F5] border-[#E5E7EB] text-[#262626]'
                  }`}
                >
                  <ActiveModeIcon className="w-3.5 h-3.5 text-[#FFA116] shrink-0" />
                  <span className="truncate max-w-[125px] sm:max-w-none">{activeMode.name}</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-150 ${
                      modeMenuOpen ? 'rotate-180 text-[#FFA116]' : ''
                    }`}
                  />
                </button>

                {modeMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute bottom-full left-0 mb-2 w-[calc(100vw-3rem)] sm:w-80 max-w-[340px] max-h-[380px] overflow-y-auto bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150"
                  >
                    {MODE_GROUPS.map((group, gIdx) => {
                      const groupModes = MENTOR_MODES.filter(m => m.group === group.id);
                      if (!groupModes.length) return null;

                      return (
                        <div
                          key={group.id}
                          className={`px-2 py-1 ${gIdx > 0 ? 'mt-1 pt-2 border-t border-[#F1F3F5]' : ''}`}
                        >
                          <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                            {group.label}
                          </div>

                          <div className="space-y-0.5">
                            {groupModes.map(mode => {
                              const MIcon = mode.icon;
                              const isSelected = mode.id === selectedMode;

                              return (
                                <button
                                  key={mode.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => {
                                    onSelectMode(mode.id);
                                    setModeMenuOpen(false);
                                    inputRef.current?.focus();
                                  }}
                                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 transition ${
                                    isSelected
                                      ? 'bg-[#FFF8EE] text-[#262626]'
                                      : 'hover:bg-[#F7F8FA] text-[#262626]'
                                  }`}
                                >
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                                      isSelected
                                        ? 'bg-[#FFA116] border-[#FFA116] text-white'
                                        : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#64748B]'
                                    }`}
                                  >
                                    <MIcon className="w-3.5 h-3.5" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span
                                        className={`text-xs font-semibold truncate ${
                                          isSelected ? 'text-[#FFA116]' : 'text-[#262626]'
                                        }`}
                                      >
                                        {mode.name}
                                      </span>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-[#FFA116] shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#64748B] line-clamp-2 leading-snug mt-0.5">
                                      {mode.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RESPONSE DEPTH SELECTOR DROPDOWN (opens upward) */}
              <div className="relative" ref={depthDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setDepthMenuOpen(prev => !prev);
                    setModeMenuOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={depthMenuOpen}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                    depthMenuOpen
                      ? 'bg-[#FFF8EE] border-[#FFA116] text-[#FFA116]'
                      : 'bg-[#F7F8FA] hover:bg-[#F1F3F5] border-[#E5E7EB] text-[#64748B] hover:text-[#262626]'
                  }`}
                  title="Select response depth"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#64748B]" />
                  <span className="text-[#262626] font-semibold">{activeDepth.label}</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-150 ${
                      depthMenuOpen ? 'rotate-180 text-[#FFA116]' : ''
                    }`}
                  />
                </button>

                {depthMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute bottom-full left-0 mb-2 w-56 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xl p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Response Depth
                    </div>
                    {RESPONSE_DEPTHS.map(depth => {
                      const isSelected = depth.id === responseLength;
                      return (
                        <button
                          key={depth.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setResponseLength(depth.id);
                            setDepthMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition ${
                            isSelected ? 'bg-[#FFF8EE]' : 'hover:bg-[#F7F8FA]'
                          }`}
                        >
                          <div>
                            <p className={`text-xs font-semibold ${isSelected ? 'text-[#FFA116]' : 'text-[#262626]'}`}>
                              {depth.label}
                            </p>
                            <p className="text-[10px] text-[#64748B]">{depth.desc}</p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FFA116] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Hints & Send Button */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] text-[#94A3B8] hidden md:inline">
                Enter to send · Shift + Enter for new line
              </span>

              <button
                type="button"
                onClick={() => onSend()}
                disabled={!canSend}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition ${
                  canSend
                    ? 'bg-[#FFA116] hover:bg-[#F7931E] text-white shadow-2xs active:translate-y-[0.5px]'
                    : 'bg-[#F1F3F5] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
