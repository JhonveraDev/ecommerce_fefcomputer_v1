-- Create the notification at the same database transition that confirms a sale.
-- The unique order_id constraint makes the operation idempotent on repeated webhooks.
CREATE OR REPLACE FUNCTION "create_sale_notification_on_confirmation"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."status" IN ('PAYMENT_APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED')
     AND (TG_OP = 'INSERT' OR OLD."status" NOT IN ('PAYMENT_APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED')) THEN
    INSERT INTO "sale_notifications" ("id", "order_id", "created_at")
    VALUES (md5(random()::text || clock_timestamp()::text || NEW."id"::text)::uuid, NEW."id", CURRENT_TIMESTAMP)
    ON CONFLICT ("order_id") DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "orders_create_sale_notification"
AFTER INSERT OR UPDATE OF "status" ON "orders"
FOR EACH ROW EXECUTE FUNCTION "create_sale_notification_on_confirmation"();
