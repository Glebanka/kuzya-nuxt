export const useMetaTags = (serverReturn) => {
  const seoData = computed(() => {
      if (!serverReturn) {
          return {
              title: '',
              description: '',
              keywords: '',
              canonical: '',
              twitterTitle: '',
              twitterDescription: '',
              twitterCard: '',
              ogType: '',
              ogUrl: '',
              ogTitle: '',
              ogDescription: '',
              ogImage: '',
              ogImageWidth: '',
              ogImageHeight: '',
              ogImageSecureUrl: '',
          };
      }
  
      let siteData = {
          title: serverReturn.data.title || '',
          description: serverReturn.data.meta_desc || '',
          keywords: serverReturn.data.meta_key || '',
          canonical: serverReturn.data.canonical || '',
  
          // Twitter
          twitterTitle: serverReturn.data.twitter_title || '',
          twitterDescription: serverReturn.data.twitter_description || '',
          twitterCard: serverReturn.data.twitter_card || '',
  
          // Open Graph
          ogType: serverReturn.data.og_type || '',
          ogUrl: serverReturn.data.og_url || '',
          ogTitle: serverReturn.data.og_title || '',
          ogDescription: serverReturn.data.og_description || '',
          ogImage: serverReturn.data.og_image || '',
          ogImageWidth: serverReturn.data.og_image_width || '',
          ogImageHeight: serverReturn.data.og_image_height || '',
          ogImageSecureUrl: serverReturn.data.og_image || '',
      };
  
      // Если meta содержит SHOW_OPEN_GRAPH, заменяем Open Graph данными из meta
      if (serverReturn.meta?.SHOW_OPEN_GRAPH) {
          Object.assign(siteData, {
              ogType: serverReturn.meta.OG_TYPE || siteData.ogType,
              ogUrl: serverReturn.meta.OG_URL || siteData.ogUrl,
              ogTitle: serverReturn.meta.OG_TITLE || siteData.ogTitle,
              ogDescription: serverReturn.meta.OG_DESCRIPTION || siteData.ogDescription,
              ogImage: serverReturn.meta.OG_IMAGE || siteData.ogImage,
              ogImageWidth: serverReturn.meta.OG_IMAGE_WIDTH || siteData.ogImageWidth,
              ogImageHeight: serverReturn.meta.OG_IMAGE_HEIGHT || siteData.ogImageHeight,
              ogImageSecureUrl: serverReturn.meta.OG_IMAGE || siteData.ogImageSecureUrl,
          });
      }
  
      return siteData;
  });
  const filteredSeoData = Object.fromEntries(
      Object.entries(seoData.value).filter(([key, value]) => value !== '' && value !== undefined)
  );

  return filteredSeoData
}
