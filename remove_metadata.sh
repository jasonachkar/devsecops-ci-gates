#!/bin/bash
# Remove all Apple metadata files recursively
find . -name "._*" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
echo "✅ Metadata files removed"
