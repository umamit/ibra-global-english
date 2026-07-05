-- CreateIndex
CREATE INDEX "rag_documents_source_idx" ON "rag_documents"("source");

-- CreateIndex
CREATE INDEX "rag_documents_createdAt_idx" ON "rag_documents"("createdAt");
