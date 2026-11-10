import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function formatInline(str) {
  if (!str) return '';
  const codeParts = str.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#F1F3F5] border border-[#E5E7EB] text-[#D97706] font-mono text-[12px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={bIdx} className="font-semibold text-[#262626]">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

export function MarkdownContent({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-[#262626] text-sm">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineBreak = part.indexOf('\n');
          const lang = firstLineBreak !== -1 ? part.slice(3, firstLineBreak).trim() || 'code' : 'code';
          const code = firstLineBreak !== -1 ? part.slice(firstLineBreak + 1, -3) : part.slice(3, -3);

          return (
            <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F7F8FA] font-mono text-xs">
              <div className="bg-[#F1F3F5] px-4 py-2 flex items-center justify-between border-b border-[#E5E7EB] text-[#64748B]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FFA116]">{lang}</span>
                <button
                  onClick={() => handleCopyCode(code, pIdx)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#64748B] hover:text-[#262626] transition text-[11px] border border-[#E5E7EB]"
                >
                  {copiedIndex === pIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-[#16A34A] font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[#262626] whitespace-pre bg-[#FFFFFF]">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-sm sm:text-base font-bold text-[#262626] mt-3 mb-1">
                    {formatInline(trimmed.replace(/^###\s+/, ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="text-base sm:text-lg font-bold text-[#262626] mt-4 mb-2 border-b border-[#E5E7EB] pb-1">
                    {formatInline(trimmed.replace(/^##\s+/, ''))}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lIdx} className="text-lg sm:text-xl font-bold text-[#262626] mt-4 mb-2">
                    {formatInline(trimmed.replace(/^#\s+/, ''))}
                  </h1>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletText = trimmed.replace(/^[-*]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-2">
                    <span className="text-[#FFA116] mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FFA116] shrink-0" />
                    <span className="flex-1">{formatInline(bulletText)}</span>
                  </div>
                );
              }

              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-[#FFA116] font-bold text-xs mt-0.5 shrink-0">{numMatch[1]}.</span>
                    <span className="flex-1">{formatInline(numMatch[2])}</span>
                  </div>
                );
              }

              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="border-l-2 border-[#FFA116] pl-3 py-1 my-2 bg-[#FFF8EE] text-[#64748B] italic rounded-r text-xs sm:text-sm">
                    {formatInline(trimmed.replace(/^>\s+/, ''))}
                  </blockquote>
                );
              }

              return <p key={lIdx}>{formatInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

