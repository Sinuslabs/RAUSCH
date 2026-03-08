#!/bin/bash -eu

# Start total execution time measurement
overall_start=$(date +%s)

source ../info.env

config="Release"
optimization=true
clean=true
build=true
copy=true
# Linux only supports VST3
plugin_type=VST3
project=$NAME
script_root=$PWD

project_root=$PROJECT_ROOT
projucer_path=$HISE_PATH/tools/projucer/Projucer
hise=$HISE_PATH/projects/standalone/Builds/LinuxMakefile/build/HISE
output=$project_root/build/Linux/
source_vst3="$project_root/Binaries/Builds/LinuxMakefile/build/${NAME}.vst3"

echo "source_vst3: $source_vst3"

# Cleaning old build files
if [[ "$clean" = true ]]; then
    echo "Starting clean action..."
    rm -rf "$project_root"/build
    mkdir -p "$project_root"/build
    rm -rf "$project_root/Binaries"
fi

# Building the plugins
if [[ "$build" = true ]]; then
    echo "Starting plugin build..."

    chmod +x "$projucer_path"

    "$hise" compile_networks -c:$config

    if [[ "$optimization" = true ]]; then
        "$hise" export_ci XmlPresetBackups/$project.xml -t:'instrument' -p:"$plugin_type"
    else
        "$hise" export_ci XmlPresetBackups/$project.xml -t:'instrument' -p:"$plugin_type" -nolto
    fi

    echo "$project_root"
    chmod +x "$project_root"/Binaries/batchCompileLinux
    sh "$project_root"/Binaries/batchCompileLinux
fi

# Copying built plugins to the output directory
if [[ "$copy" = true ]]; then
    echo "Copying built plugins to the output directory..."

    if [ -d "$source_vst3" ]; then
        echo "Copying ${NAME}.vst3 to $output..."
        mkdir -p "$output"
        cp -r "$source_vst3" "$output"
    else
        echo "${NAME}.vst3 not found, skipping copy."
    fi
fi

# Check for build success
if [[ $? -eq 0 ]]; then
    echo "Build succeeded."
else
    echo "Build failed."
    exit 1
fi

echo "Version: $VERSION"

overall_end=$(date +%s)
duration=$(( overall_end - overall_start ))
echo "Total execution time: ${duration}s."
