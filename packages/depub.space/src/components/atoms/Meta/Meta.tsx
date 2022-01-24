import NextHead from 'next/head';
import Script from 'next/script';
import React, { FC } from 'react';

export interface MetaProps {
  title?: string;
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
  lang = 'en-HK',
}) => {
  const titleWithTagline = title ? `${title} | Depub Space` : 'Depub Space';

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
        {/* eslint-disable react/no-invalid-html-attribute */}
        {/* eslint-disable-next-line global-require */}
        <meta content={titleWithTagline} property="og:title" />
        {description && <meta content={description} property="og:description" />}
        <meta content="website" property="og:type" />
        <meta content="https://depub.space" property="og:url" />
        <link href="/apple-icon-57x57.png" rel="apple-touch-icon" sizes="57x57" />
        <link href="/apple-icon-60x60.png" rel="apple-touch-icon" sizes="60x60" />
        <link href="/apple-icon-72x72.png" rel="apple-touch-icon" sizes="72x72" />
        <link href="/apple-icon-76x76.png" rel="apple-touch-icon" sizes="76x76" />
        <link href="/apple-icon-114x114.png" rel="apple-touch-icon" sizes="114x114" />
        <link href="/apple-icon-120x120.png" rel="apple-touch-icon" sizes="120x120" />
        <link href="/apple-icon-144x144.png" rel="apple-touch-icon" sizes="144x144" />
        <link href="/apple-icon-152x152.png" rel="apple-touch-icon" sizes="152x152" />
        <link href="/apple-icon-180x180.png" rel="apple-touch-icon" sizes="180x180" />
        <link href="/android-icon-192x192.png" rel="icon" sizes="192x192" type="image/png" />
        <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
        <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
        <link href="/manifest.json" rel="manifest" />
        <meta content="#ffffff" name="msapplication-TileColor" />
        <meta content="/ms-icon-144x144.png" name="msapplication-TileImage" />
        <meta content="#ffffff" name="theme-color" />
        <meta content="#ffffff" name="theme-color" />

        {/* eslint-enable react/no-invalid-html-attribute */}

        <title>{titleWithTagline}</title>
        {canonical && <link href={canonical} rel="canonical" />}
        {description && <meta content={description} name="description" />}
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
