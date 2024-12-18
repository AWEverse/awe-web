#!/bin/bash

usage() {
  echo "Usage: $0 [-m] -s <style_extension> -p <path> <ComponentName>"
  echo "  -m                        Add .module prefix to style file"
  echo "  -s <style_extension>      Specify the style file extension (e.g., css, scss, less)"
  echo "  -p <path>                 Specify the path where files should be created"
  exit 1
}

MODULE_PREFIX=false
STYLE_EXTENSION=""
PATH_DIR=""

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

shift $((OPTIND - 1))

if [ -z "$1" ]; then
  usage
fi

if [ -z "$STYLE_EXTENSION" ]; then
  usage
fi

if [ -z "$PATH_DIR" ]; then
  usage
fi

COMPONENT_NAME=$1

if [ "$MODULE_PREFIX" = true ]; then
  STYLE_FILE="${COMPONENT_NAME}.module.${STYLE_EXTENSION}"
else
  STYLE_FILE="${COMPONENT_NAME}.${STYLE_EXTENSION}"
fi

TSX_FILE="${COMPONENT_NAME}.tsx"
STYLE_PATH="${PATH_DIR}/${STYLE_FILE}"
TSX_PATH="${PATH_DIR}/${TSX_FILE}"

# Создаем директорию, если она не существует
mkdir -p "$PATH_DIR"

cat > $TSX_PATH <<EOL
import React from 'react';
import s from './${STYLE_FILE}';

interface OwnProps {
  // Define props here
}

const ${COMPONENT_NAME}: React.FC<OwnProps> = (props) => {
  return (
    <div className={s.${COMPONENT_NAME.toLowerCase()}}>
      {/* Add your component code here */}
    </div>
  );
}

export default ${COMPONENT_NAME};
EOL

cat > $STYLE_PATH <<EOL
.${COMPONENT_NAME.toLowerCase()} {
  /* Add your styles here */
}
EOL

echo "Created ${TSX_PATH} and ${STYLE_PATH}"
