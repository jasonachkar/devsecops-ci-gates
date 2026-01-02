#!/bin/bash
# Aggressively remove Apple metadata files
find . -name "._*" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
# Also try to remove extended attributes
find . -type f -exec xattr -c {} \; 2>/dev/null || true
echo "✅ Metadata cleaned"
