-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resume_createdAt_idx" ON "Resume"("createdAt");

-- CreateIndex
CREATE INDEX "Analysis_resumeId_idx" ON "Analysis"("resumeId");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
