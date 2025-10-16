#!/usr/bin/env bash
set -euo pipefail
export NODE_ENV=development
export PORT=${PORT:-5000}
export MONGO_URI=${MONGO_URI:-mongodb://localhost:27017/lms}
(cd server && npm run dev)
