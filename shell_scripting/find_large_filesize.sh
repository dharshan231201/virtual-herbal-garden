#!/bin/bash

path="$1"
echo "$path"
du -ah $path | sort -hr | head -10 > file_size.txt
du -ah $path | sort -hr | head -n 10 | awk '{print $2}' > file.txt

cat file_size.txt file.txt