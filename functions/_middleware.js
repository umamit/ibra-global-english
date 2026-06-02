export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Intercept the home page requests for markdown content negotiation
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const acceptHeader = request.headers.get('Accept') || '';
    if (acceptHeader.includes('text/markdown')) {
      const mdUrl = new URL('/index.md', request.url);
      const response = await fetch(mdUrl.toString());
      if (response.ok) {
        const mdText = await response.text();
        const tokens = Math.ceil(mdText.length / 4.0);
        
        return new Response(mdText, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'x-markdown-tokens': tokens.toString()
          }
        });
      }
    }
  }
  
  // Continue to serve static assets for all other cases
  return next();
}
