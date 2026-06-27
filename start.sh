#!/bin/bash
if [ ! -d ".next" ]; then
  echo "Building Next.js app..."
  npm run build
fi
echo "Starting Next.js server..."
exec npx next start -p ${PORT:-10000}
