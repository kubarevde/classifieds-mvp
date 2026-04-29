"use client";

import ReactMarkdown from "react-markdown";

type ArticleMarkdownProps = {
  content: string;
};

export function ArticleMarkdown({ content }: ArticleMarkdownProps) {
  return (
    <div className="support-markdown space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
      <ReactMarkdown
        components={{
          h2: ({ children }) => <h2 className="mt-6 text-lg font-semibold text-slate-900 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-4 text-base font-semibold text-slate-900">{children}</h3>,
          p: ({ children }) => <p className="text-slate-700">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
