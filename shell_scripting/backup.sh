#!/bin/bash
# date=$(date +%b-%d-%y)
date=$(date +"%Y-%m-%d_%H-%M-%S")
echo $date
backup_directory=("/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/python_automation/" "/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/multiple_file/")
final_destination="/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/shell_scripting"
echo $final_destination


for i in "${backup_directory[@]}"; do 
    destine=$(echo $i | sed 's|/|-|g' )
    echo $destine
    tar -Pczf $final_destination/a$destine-$date.tar.gz $i
done