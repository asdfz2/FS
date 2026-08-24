import DOMPurify from 'dompurify'

export function sanitizeHtml(value) {
  return DOMPurify.sanitize(String(value || ''), {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'img', 'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']
  })
}
