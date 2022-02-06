function removeHtmlTags(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export function messageSanitizer(content: string): string {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const hashTagRegex = /(#[a-zA-Z0-9]+)/g;

  return removeHtmlTags(content)
    .replace(urlRegex, url => {
      let hyperlink = url;

      if (!hyperlink.match('^https?://')) {
        hyperlink = `http://${hyperlink}`;
      }

      return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    })
    .replace(hashTagRegex, hashTag => {
      const hashLink = `/tags?name=${hashTag.replace(/^#/, '')}`;

      return `<a href="${hashLink}">${hashTag}</a>`;
    });
}
