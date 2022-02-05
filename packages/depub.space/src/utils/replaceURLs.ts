function removeHtmlTags(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export function replaceURLToAnchors(content: string): string {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  return removeHtmlTags(content).replace(urlRegex, url => {
    let hyperlink = url;

    if (!hyperlink.match('^https?://')) {
      hyperlink = `http://${hyperlink}`;
    }

    return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}
