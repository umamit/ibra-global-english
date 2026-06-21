/**
 * Security and sanitization utilities for the AI features.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param {string} text 
 * @returns {string}
 */
export function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Parses inline markdown elements (bold, italic, inline code) securely.
 * @param {string} text 
 * @returns {string}
 */
export function parseInlineMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class=\"bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono\">$1</code>");
}

/**
 * Converts markdown text to HTML securely by first escaping HTML tags
 * and then parsing markdown structures (tables, lists, headers, blockquotes, codeblocks).
 * @param {string} text 
 * @returns {string}
 */
export function parseMarkdownSecure(text) {
  if (!text) return "";

  // 1. Escape HTML first to neutralize all XSS vectors (e.g. <script>, onload=, onerror=)
  let escaped = escapeHtml(text);

  // 2. Extract and format multi-line code blocks: ```lang ... ```
  escaped = escaped.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, (match, code) => {
    return `<pre class="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono my-3 overflow-x-auto"><code>${code}</code></pre>`;
  });

  const lines = escaped.split("\n");
  const result = [];
  let inList = false;
  let inOrderedList = false;
  let inTable = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle Tables (| Header | Header |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        // Close other block structures
        if (inList) { result.push("</ul>"); inList = false; }
        if (inOrderedList) { result.push("</ol>"); inOrderedList = false; }
        if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false; }

        inTable = true;
        result.push('<div class="overflow-x-auto my-3"><table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg text-left text-xs">');

        // Parse Table Header
        const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
        result.push('<thead class="bg-gray-100 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-200"><tr>');
        cells.forEach(cell => {
          result.push(`<th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">${parseInlineMarkdown(cell)}</th>`);
        });
        result.push('</tr></thead><tbody class="divide-y divide-gray-150 bg-white dark:bg-gray-900">');
        continue;
      } else {
        // Skip separator line: |---|---|
        if (trimmed.replace(/[\s\-|:|]/g, "") === "") {
          continue;
        }
        // Parse Table Body Row
        const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
        result.push('<tr class="hover:bg-gray-50 dark:hover:bg-gray-850">');
        cells.forEach(cell => {
          result.push(`<td class="px-3 py-2 text-gray-600 dark:text-gray-300">${parseInlineMarkdown(cell)}</td>`);
        });
        result.push('</tr>');
        continue;
      }
    } else if (inTable) {
      result.push('</tbody></table></div>');
      inTable = false;
    }

    // Handle Blockquotes (> text)
    if (trimmed.startsWith("&gt;")) { // HTML escaped '>' is &gt;
      const quoteText = trimmed.substring(4).trim();
      if (!inBlockquote) {
        if (inList) { result.push("</ul>"); inList = false; }
        if (inOrderedList) { result.push("</ol>"); inOrderedList = false; }
        inBlockquote = true;
        result.push('<blockquote class="border-l-4 border-yellow-600 pl-3 my-2 text-gray-500 dark:text-gray-400 italic">');
      }
      result.push(parseInlineMarkdown(quoteText) + "<br/>");
      continue;
    } else if (inBlockquote) {
      result.push('</blockquote>');
      inBlockquote = false;
    }

    // Handle Unordered Lists (- item or * item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.substring(2).trim();
      if (!inList) {
        if (inOrderedList) { result.push("</ol>"); inOrderedList = false; }
        inList = true;
        result.push('<ul class="list-disc pl-5 my-2 space-y-1">');
      }
      result.push(`<li class="text-gray-700 dark:text-gray-300">${parseInlineMarkdown(itemText)}</li>`);
      continue;
    } else if (inList) {
      result.push('</ul>');
      inList = false;
    }

    // Handle Ordered Lists (1. item)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const itemText = olMatch[2].trim();
      if (!inOrderedList) {
        inOrderedList = true;
        result.push('<ol class="list-decimal pl-5 my-2 space-y-1">');
      }
      result.push(`<li class="text-gray-700 dark:text-gray-300">${parseInlineMarkdown(itemText)}</li>`);
      continue;
    } else if (inOrderedList) {
      result.push('</ol>');
      inOrderedList = false;
    }

    // Handle Headings (### heading)
    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.substring(4).trim();
      result.push(`<h3 class="text-sm font-extrabold text-gray-900 dark:text-white mt-4 mb-2">${parseInlineMarkdown(headingText)}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      const headingText = trimmed.substring(3).trim();
      result.push(`<h2 class="text-base font-black text-gray-900 dark:text-white mt-5 mb-2">${parseInlineMarkdown(headingText)}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      const headingText = trimmed.substring(2).trim();
      result.push(`<h1 class="text-lg font-black text-gray-900 dark:text-white mt-6 mb-3">${parseInlineMarkdown(headingText)}</h1>`);
      continue;
    }

    // Handle normal text lines
    if (trimmed === "") {
      result.push("<br/>");
    } else {
      result.push(parseInlineMarkdown(line));
    }
  }

  // Close any open tags
  if (inTable) result.push('</tbody></table></div>');
  if (inBlockquote) result.push('</blockquote>');
  if (inList) result.push('</ul>');
  if (inOrderedList) result.push('</ol>');

  return result.join("\n");
}

/**
 * Detects prompt injection patterns in the user input.
 * Returns true if a potential prompt injection is detected.
 * @param {string} text 
 * @returns {boolean}
 */
export function detectPromptInjection(text) {
  if (!text) return false;
  
  const textLower = text.toLowerCase();
  
  // List of common prompt injection patterns
  const injectionPatterns = [
    "ignore previous",
    "ignore the above",
    "abaikan instruksi",
    "abaikan perintah",
    "lupakan perintah",
    "lupakan aturan",
    "forget rules",
    "forget instructions",
    "system override",
    "override system",
    "bypass instructions",
    "bypass guidelines",
    "you are now a",
    "kamu sekarang adalah",
    "perintah baru:",
    "new instructions:",
    "system prompt:",
    "change personality",
    "forget what i said",
    "forget what was said",
    "act as a",
    "bertindaklah sebagai",
    "menyamarlah sebagai"
  ];

  return injectionPatterns.some(pattern => textLower.includes(pattern));
}
