ALTER TABLE "products" ADD COLUMN "warranty" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "condition" VARCHAR(40);
ALTER TABLE "products" ADD COLUMN "tags" JSONB;
ALTER TABLE "products" ADD COLUMN "seo_title" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "seo_description" VARCHAR(500);
