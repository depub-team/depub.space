export interface LinkPreviewItem {
  url: string;
  title: string;
  siteName?: string;
  description?: string;
  mediaType: string;
  contentType?: string;
  images: string[];
  videos: {
    url?: string;
    secureUrl?: string | null;
    type?: string | null;
    width?: string;
    height?: string;
  }[];
  favicons: string[];
}
