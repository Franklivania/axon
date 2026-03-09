ALTER TABLE "agents" ALTER COLUMN "execution_lock" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "execution_lock" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "agents_status_idx" ON "agents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agents_last_execution_idx" ON "agents" USING btree ("last_execution_at");--> statement-breakpoint
CREATE INDEX "logs_agent_id_idx" ON "logs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "transactions_agent_id_idx" ON "transactions" USING btree ("agent_id");