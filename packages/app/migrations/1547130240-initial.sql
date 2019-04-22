CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "award-submission" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created" timestamp NOT NULL DEFAULT current_timestamp,
    "updated" timestamp NOT NULL DEFAULT current_timestamp,
    "citation" text,
    "date" timestamp,
    "award_type" text
);