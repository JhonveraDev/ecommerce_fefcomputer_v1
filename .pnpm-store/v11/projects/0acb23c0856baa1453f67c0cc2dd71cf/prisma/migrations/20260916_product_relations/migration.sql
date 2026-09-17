CREATE TABLE "product_relations" (
    "product_id" UUID NOT NULL,
    "related_product_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_relations_pkey" PRIMARY KEY ("product_id", "related_product_id")
);

CREATE INDEX "product_relations_related_product_id_idx" ON "product_relations"("related_product_id");

ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
