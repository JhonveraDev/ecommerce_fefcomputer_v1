CREATE TABLE "user_shopping_states" (
  "user_id" UUID NOT NULL,
  "cart" JSONB NOT NULL DEFAULT '[]',
  "wishlist" JSONB NOT NULL DEFAULT '[]',
  "compare" JSONB NOT NULL DEFAULT '[]',
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_shopping_states_pkey" PRIMARY KEY ("user_id"),
  CONSTRAINT "user_shopping_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);