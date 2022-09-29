export const isMobileDevice = () => {
  const isLine = /\bLine\//i.test(navigator.userAgent) || false;
  const isMobile = /(iPad|iPhone|Android|Mobile)/i.test(navigator.userAgent) || false;
  const rules = [
    'WebView',
    '(iPhone|iPod|iPad)(?!.*Safari/)',
    'Android.*(wv|.0.0.0)',
    'DappTab',
    'Cosmostation',
  ];
  const regex = new RegExp(`(${rules.join('|')})`, 'ig');
  const isInApp = Boolean(navigator.userAgent.match(regex));

  return isInApp || isLine || isMobile;
};
