const isDev = process.env.NODE_ENV !== 'production';

export function removeHtmlTags(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export const replaceURLToAnchor = (content: string): string => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  return content.replace(urlRegex, url => {
    let hyperlink = url;

    if (!hyperlink.match('^https?://')) {
      hyperlink = `http://${hyperlink}`;
    }

    return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

export const replaceTagToAnchor = (content: string): string => {
  const hashTagRegex = /#[\p{L}\d]+/giu;

  return content.replace(hashTagRegex, hashTag => {
    const hashtag = hashTag.replace(/^#/, '');
    const hashLink = isDev ? `/tags?name=${hashtag}` : `/hashtag/${hashtag}`;

    return `<a href="${hashLink}">${hashTag}</a>`;
  });
};

export const replaceHandleToAnchor = (content: string): string => {
  const handleRegex = /@[\p{L}\d]+/giu;

  return content.replace(handleRegex, handleText => {
    console.log(handleText);

    const handle = handleText.replace(/^@/, '');
    const hashLink = isDev ? `/users/?account=${handle}` : `/${handle}`;

    return `<a href="${hashLink}">${handle}</a>`;
  });
};

export const messageSanitizer = (content: string): string =>
  replaceHandleToAnchor(replaceTagToAnchor(replaceURLToAnchor(removeHtmlTags(content))));
