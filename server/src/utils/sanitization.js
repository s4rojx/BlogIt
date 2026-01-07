import xss from 'xss';

export const sanitizeContent = (content) => {
  return xss(content, {
    whiteList: {
      b: [],
      i: [],
      em: [],
      strong: [],
      a: ['href', 'title'],
      p: [],
      br: [],
      ul: [],
      ol: [],
      li: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      blockquote: [],
      code: [],
      pre: []
    },
    onTagAttr: (tag, name, value) => {
      if (tag === 'a' && name === 'href') {
        if (value.match(/^(https?|ftp):\/\//i) || value.match(/^mailto:/i)) {
          return `${name}="${xss.escapeAttrValue(value)}"`;
        }
        return '';
      }
    }
  });
};

export const sanitizeText = (text) => {
  return xss(text, {
    whiteList: {},
    stripIgnoredTag: true
  });
};

export const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};
