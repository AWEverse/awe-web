#!/bin/bash

# Display usage information and exit
usage() {
  echo "Usage: $0 [-m] -s <style_extension> -p <path> <ComponentName>"
  echo "  -m                        Add .module prefix to style file"
  echo "  -s <style_extension>      Specify the style file extension (e.g., css, scss, less)"
  echo "  -p <path>                 Specify the path where files should be created"
  exit 1
}

# Default values
MODULE_PREFIX=false
STYLE_EXTENSION=""
PATH_DIR=""

# Parse command-line options
while getopts "ms:p:" opt; do
  case $opt in
    m)
      MODULE_PREFIX=true
      ;;
    s)
      STYLE_EXTENSION=$OPTARG
      ;;
    p)
      PATH_DIR=$OPTARG
      ;;
    *)
      usage
      ;;
  esac
done

# Shift past the options
shift $((OPTIND - 1))

# Validate required arguments
if [ -z "$1" ] || [ -z "$STYLE_EXTENSION" ] || [ -z "$PATH_DIR" ]; then
  usage
fi

COMPONENT_NAME=$1

# Construct file names
if [ "$MODULE_PREFIX" = true ]; then
  STYLE_FILE="${COMPONENT_NAME}.module.${STYLE_EXTENSION}"
else
  STYLE_FILE="${COMPONENT_NAME}.${STYLE_EXTENSION}"
fi

TSX_FILE="${COMPONENT_NAME}.tsx"
STYLE_PATH="${PATH_DIR}/${STYLE_FILE}"
TSX_PATH="${PATH_DIR}/${TSX_FILE}"

# Check if files already exist to prevent overwriting
if [ -e "$TSX_PATH" ] || [ -e "$STYLE_PATH" ]; then
  echo "Error: One of the files already exists: $TSX_PATH or $STYLE_PATH"
  exit 1
fi

# Convert ComponentName to kebab-case for CSS class naming
CLASS_NAME=$(echo "$COMPONENT_NAME" | sed -e 's/\([A-Z]\)/-\L\1/g' -e 's/^-//')

# Create directory if it doesn’t exist
mkdir -p "$PATH_DIR"

# Create the TSX file with a minimal template
cat > "$TSX_PATH" <<EOL
import React from 'react';
import s from './${STYLE_FILE}';

const ${COMPONENT_NAME} = () => {
  return (
    <div className={s['${CLASS_NAME}']}>
      {/* Add your component code here */}
    </div>
  );
}

export default ${COMPONENT_NAME};
EOL

# Create the style file with the matching class name
cat > "$STYLE_PATH" <<EOL
.${CLASS_NAME} {
  /* Add your styles here */
}
EOL

# Confirm file creation
echo "Created ${TSX_PATH} and ${STYLE_PATH}"
