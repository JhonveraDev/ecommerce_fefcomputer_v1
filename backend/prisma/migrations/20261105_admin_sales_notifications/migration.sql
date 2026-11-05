-- Persistent, per-administrator read receipts for confirmed-sale notifications.
CREATE TABLE "sale_notifications" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sale_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sale_notification_reads" (
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sale_notification_reads_pkey" PRIMARY KEY ("notification_id", "user_id")
);

CREATE UNIQUE INDEX "sale_notifications_order_id_key" ON "sale_notifications"("order_id");
CREATE INDEX "sale_notifications_created_at_idx" ON "sale_notifications"("created_at");
CREATE INDEX "sale_notification_reads_user_id_read_at_idx" ON "sale_notification_reads"("user_id", "read_at");

ALTER TABLE "sale_notifications" ADD CONSTRAINT "sale_notifications_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sale_notification_reads" ADD CONSTRAINT "sale_notification_reads_notification_id_fkey"
  FOREIGN KEY ("notification_id") REFERENCES "sale_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sale_notification_reads" ADD CONSTRAINT "sale_notification_reads_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
