export function removeHtmlTags(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export const replaceURLToAnchor = (content: string): string => {
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

  return content.replace(urlRegex, url => {
    let hyperlink = url;

    if (!hyperlink.match('^https?://')) {
      hyperlink = `http://${hyperlink}`;
    }

    return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

export const replaceTagToAnchor = (content: string): string => {
  const hashTagRegex = /#[\p{L}\d_-]+/giu;

  return content.replace(hashTagRegex, hashTag => {
    const hashtag = hashTag.replace(/^#/, '');
    const hashLink = `/channels/${hashtag}`;

    return `<a href="${hashLink}">${hashTag}</a>`;
  });
};

export const replaceHandleToAnchor = (content: string): string => {
  const handleRegex = /@[\p{L}\d_-]+/giu;

  return content.replace(handleRegex, handleText => {
    const handle = handleText.replace(/^@/, '');
    const hashLink = `/user/${handle}`;

    // XXX: some url contains @, would double wrapping <a />
    if (content[content.indexOf(handleText) - 1] === '/') {
      return handleText;
    }

    return `<a href="${hashLink}">${handleText}</a>`;
  });
};

export const messageSanitizer = (content: string): string =>
  replaceURLToAnchor(replaceHandleToAnchor(replaceTagToAnchor(removeHtmlTags(content))));
