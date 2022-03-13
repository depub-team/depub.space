import NextHead from 'next/head';
import Script from 'next/script';
import React, { FC } from 'react';

export interface MetaProps {
  title?: string;
  image?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  lang?: string;
}

export const Meta: FC<MetaProps> = ({
  title,
  canonical,
  keywords,
  description,
  image,
  lang = 'en-HK',
}) => {
  const titleWithTagline = title ? `${title} | depub.SPACE` : 'depub.SPACE';
  const defaultDescription = 'Not your key, not your tweet. Be web3 native.';
  const ogImage = image || '/app-logo.png';
  const ogUrl = typeof window !== 'undefined' ? window.location.href : 'https://depub.space';

  return (
    <>
      <NextHead>
        <meta charSet="utf-8" />
        <meta content={lang} httpEquiv="Content-Language" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <meta content="true" name="HandheldFriendly" />
        <meta
          content="width=device-width,user-scalable=no,initial-scale=1.0,maximum-scale=1.0"
          name="viewport"
        />

        {/* eslint-disable-next-line global-require */}
        <meta content={titleWithTagline} property="og:title" />
        <meta content={description || defaultDescription} property="og:description" />
        <meta content="website" property="og:type" />
        <meta content={ogUrl} property="og:url" />
        <meta content={ogImage} property="og:image" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
        <link href="/site.webmanifest" rel="manifest" />
        <meta content="#ffffff" name="theme-color" />

        <title>{titleWithTagline}</title>
        {canonical && <link href={canonical} rel="canonical" />}
        <meta content={description || defaultDescription} name="description" />
        {keywords && <meta content={keywords} name="keywords" />}
      </NextHead>

      {process.env.NEXT_PUBLIC_GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer', "${process.env.NEXT_PUBLIC_GTM_ID}");
      `}
        </Script>
      )}
    </>
  );
};
