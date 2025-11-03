#!/bin/bash
backup_directory=("/etc" "/home")
dest_direcotry="/backup"
mkdir -p $dest_direcotry
backup_date=$(date +"%Y-%m-%d_%H-%M-%S")
echo $backup_date
for i in "${backup_directory[@]}"; do
    echo $i
    sudo tar -Pczf  /tmp/$i-$backup_date.tar.gz $i  #sudo tar -Pczf <tar_file_name> dir_pathcd / 
    cp /tmp/$i-$backup_date.tar.gz $dest_direcotry
done



