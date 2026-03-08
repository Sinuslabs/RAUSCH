#!/bin/bash -eu

# TESTING USING PLUGINVAL

source ../info.env

# Adjust this path to your pluginval installation
pluginval=/usr/local/bin/pluginval
project=$NAME
script_root=$PWD
project_root=$PROJECT_ROOT
plugin_path_vst3=$project_root/build/Linux/$NAME.vst3

# Log directory
log_dir="logs"
mkdir -p "$log_dir"

echo "Starting plugin validation..."
"$pluginval" --validate "$plugin_path_vst3" --strictness-level 10 --output-dir "$log_dir" --verbose

if [ $? -eq 0 ]; then
    echo "Plugin validation succeeded."
else
    echo "Plugin validation failed."
    exit 1
fi
