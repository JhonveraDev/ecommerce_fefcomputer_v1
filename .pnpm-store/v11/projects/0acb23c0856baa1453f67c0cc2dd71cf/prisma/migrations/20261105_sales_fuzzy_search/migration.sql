CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "orders_public_number_trgm_idx" ON "orders" USING GIN ("public_number" gin_trgm_ops);
CREATE INDEX "orders_customer_email_trgm_idx" ON "orders" USING GIN ("customer_email" gin_trgm_ops);
CREATE INDEX "order_items_name_snapshot_trgm_idx" ON "order_items" USING GIN ("name_snapshot" gin_trgm_ops);
CREATE INDEX "users_full_name_trgm_idx" ON "users" USING GIN ((lower(COALESCE("name", '') || ' ' || COALESCE("last_name", ''))) gin_trgm_ops);
CREATE INDEX "orders_recipient_name_trgm_idx" ON "orders" USING GIN ((lower(COALESCE("shipping_address_snapshot"->>'recipientName', ''))) gin_trgm_ops);
