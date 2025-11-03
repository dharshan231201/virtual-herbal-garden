#!/bin/bash
path="$1"
echo $path
find $path -mtime -2 -type f > less_than_2_days.txt
fin $path -mtime -1 -type f  > more_than_2_days.txt
if [[ $? -eq 0 ]]; then
    echo "Files are present"
else
  echo "Files are not present"
fi

# if you want to delete the file then : find $path -type f +mtime -2 delete

