#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js server..."
  npx next dev -p 3000 --webpack 2>&1 | tee dev.log
  echo "[$(date)] Server exited with code $?. Restarting in 3 seconds..."
  sleep 3
done
