#!/bin/bash

# Output file name
OUTPUT="project_documentation.md"
# Directory to scan (current directory by default)
TARGET_DIR="${1:-.}"

# Clear or create the output file
echo "# Project Documentation" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Generated on: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Directory Structure" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
# Try to use tree if installed, otherwise use find
if command -v tree &> /dev/null; then
    tree -I 'node_modules|.git|__pycache__' "$TARGET_DIR" >> "$OUTPUT"
else
    find "$TARGET_DIR" -maxdepth 3 -not -path '*/.*' >> "$OUTPUT"
fi
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## File Contents" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Find all files, exclude hidden files and specific directories
find "$TARGET_DIR" -type f -not -path '*/.*' -not -path '*/node_modules/*' -not -path '*/__pycache__/*' | sort | while read -r file; do
    # Check if the file is a text file (not binary)
    if grep -Iq . "$file"; then
        echo "### File: $file" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
        echo "" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
        echo "" >> "$OUTPUT"
        echo "Processing: $file"
    else
        echo "Skipping binary file: $file"
    fi
done

echo "Done! Documentation saved to $OUTPUT"
