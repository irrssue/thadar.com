-- CreateTable
CREATE TABLE "ParentLink" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParentLink_parentId_status_idx" ON "ParentLink"("parentId", "status");

-- CreateIndex
CREATE INDEX "ParentLink_childId_idx" ON "ParentLink"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentLink_parentId_childId_key" ON "ParentLink"("parentId", "childId");

-- AddForeignKey
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
