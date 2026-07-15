#!/bin/bash

# Vercel Ignored Build Step Script
# Exit code 0 tells Vercel to IGNORE (cancel) the build.
# Exit code 1 tells Vercel to PROCEED with the build.

echo "Checking if build should be ignored..."
echo "Git Author: $VERCEL_GIT_COMMIT_AUTHOR_LOGIN"
echo "Git Branch: $VERCEL_GIT_COMMIT_REF"

# 1. Ignore if author is dependabot
if [ "$VERCEL_GIT_COMMIT_AUTHOR_LOGIN" = "dependabot[bot]" ] || [ "$VERCEL_GIT_COMMIT_AUTHOR_LOGIN" = "dependabot" ]; then
  echo "🛑 Build ignored: Triggered by Dependabot."
  exit 0
fi

# 2. Ignore if branch name starts with dependabot/
if [[ "$VERCEL_GIT_COMMIT_REF" == dependabot/* ]]; then
  echo "🛑 Build ignored: Dependabot branch ($VERCEL_GIT_COMMIT_REF)."
  exit 0
fi

# Otherwise, build normally
echo "✅ Build allowed: Non-Dependabot commit."
exit 1
