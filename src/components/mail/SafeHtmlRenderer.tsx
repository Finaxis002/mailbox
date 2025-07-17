"use client";

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

export function SafeHtmlRenderer({ html }: { html?: string }) {
  const [cleanHtml, setCleanHtml] = useState('');

  useEffect(() => {
    if (html) {
      // Sanitize HTML and preserve basic formatting
      const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'a', 'strong', 'em', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'style', 'class']
      });
      setCleanHtml(sanitized);
    }
  }, [html]);

  if (!cleanHtml) return null;

  return (
    <div 
      className="prose prose-sm max-w-none" 
      dangerouslySetInnerHTML={{ __html: cleanHtml }} 
    />
  );
}