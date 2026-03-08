#!/bin/bash -eu

# Load environment variables
source ../info.env

script_root=$PWD
project_root=$PROJECT_ROOT
source_vst3="$project_root/build/Linux/${NAME}.vst3"
output_zip="${NAME}-Linux.zip"
staging_dir=$(mktemp -d)

echo "Staging directory: $staging_dir"

# Copy the VST3 plugin
if [ ! -d "$source_vst3" ]; then
    echo "Error: ${NAME}.vst3 not found at $source_vst3"
    exit 1
fi
cp -r "$source_vst3" "$staging_dir/"

# Copy README
cp "$script_root/Resources/README.txt" "$staging_dir/"

# Create the zip archive
rm -f "$script_root/$output_zip"
(cd "$staging_dir" && zip -r "$script_root/$output_zip" .)

# Cleanup
rm -rf "$staging_dir"

echo "Package created: $script_root/$output_zip"
