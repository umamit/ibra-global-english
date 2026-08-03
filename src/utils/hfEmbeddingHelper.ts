export async function generateEmbedding(text: string) {
  if (!text || text.trim().length === 0) throw new Error("Text cannot be empty for embedding");
  const truncatedText = text.slice(0, 2000);
  const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

  const tryFetch = async (useToken: boolean, usePipelineUrl: boolean): Promise<Response> => {
    const url = usePipelineUrl
      ? `https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2`
      : `https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (useToken && hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

    return await fetch(url, { method: "POST", headers, body: JSON.stringify({ inputs: truncatedText, options: { wait_for_model: true } }) });
  };

  let response: Response | undefined;
  const attempts = [
    { useToken: true, usePipelineUrl: false }, { useToken: false, usePipelineUrl: false },
    { useToken: true, usePipelineUrl: true }, { useToken: false, usePipelineUrl: true }
  ];
  let lastError: any = null;

  for (const opt of attempts) {
    if (opt.useToken && !hfToken) continue;
    try {
      response = await tryFetch(opt.useToken, opt.usePipelineUrl);
      if (response.ok) break;
      const errText = await response.text();
      if (response.status === 503) {
        await new Promise((r) => setTimeout(r, 3500));
        response = await tryFetch(opt.useToken, opt.usePipelineUrl);
        if (response.ok) break;
      }
      lastError = new Error(`HF Status ${response.status}: ${errText}`);
    } catch (err: any) { lastError = err; }
  }

  if (!response || !response.ok) throw new Error(`Embedding API failed: ${lastError?.message || "unknown"}`);
  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) return data[0] as number[];
  if (Array.isArray(data) && typeof data[0] === "number") return data as number[];
  throw new Error("Unexpected embedding output structure");
}
