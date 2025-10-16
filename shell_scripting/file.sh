#!/bin/bash
path=$1
directory=$2
for folder in $( find $path -type d );
do
    echo $folder
    if [ -d $directory ]; then   # you cant use double bracket inside the for statement
        echo "removing the folder"
        rm -rf $folder
    else
        echo "folder does not exist"
    fi
done
