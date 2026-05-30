-- CreateTable
CREATE TABLE "Regulation" (
    "regulation_id" TEXT NOT NULL PRIMARY KEY,
    "area" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "obligation_name" JSONB NOT NULL,
    "legal_level" TEXT NOT NULL,
    "legal_basis" JSONB NOT NULL,
    "authority" JSONB NOT NULL,
    "official_source" TEXT NOT NULL,
    "trigger_logic" JSONB NOT NULL,
    "trigger_data_fields" JSONB NOT NULL,
    "thresholds" JSONB,
    "obligation_type" TEXT NOT NULL,
    "output_required" JSONB NOT NULL,
    "portal_or_submission" JSONB NOT NULL,
    "frequency" TEXT NOT NULL,
    "deadline" JSONB NOT NULL,
    "evidence_to_keep" JSONB NOT NULL,
    "penalty_risk" TEXT NOT NULL,
    "penalty_description" JSONB NOT NULL,
    "owner_role" TEXT NOT NULL,
    "confidence_level" TEXT NOT NULL,
    "pkd_codes" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "nip" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "krs" TEXT,
    "regon" TEXT NOT NULL,
    "legal_form" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "pkd_codes" JSONB NOT NULL,
    "employee_count" INTEGER NOT NULL,
    "revenue_pln" REAL NOT NULL,
    "assets_pln" REAL NOT NULL,
    "is_mock" BOOLEAN NOT NULL DEFAULT true
);
