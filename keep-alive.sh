#!/bin/bash
# Keep-alive server script — restarts Next.js if it dies
cd /home/z/my-project

# Re-seed data if the JSON file is missing or empty
if [ ! -s school-data.json ]; then
  echo "[$(date)] Re-seeding data..."
  node scripts/seed-data.js
fi

while true; do
  echo "[$(date)] Starting Next.js server on port 3000..."
  npx next dev -p 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 2 seconds..."
  sleep 2
done
