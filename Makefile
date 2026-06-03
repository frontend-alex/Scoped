.PHONY: dev db server client

dev: db
	$(MAKE) --no-print-directory -j2 server client

db:
	docker start scoped-postgres

server:
	cd app/backend && uv run uvicorn main:app --reload

client:
	cd app/client && pnpm dev
