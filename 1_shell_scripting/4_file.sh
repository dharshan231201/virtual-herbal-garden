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

# read -p "Enter the path where you need to find the older files: " path
# read -p "Do you need files_older_than_n_days or files_within_n_days: " option
# read -p "Enter the Number of days" days
# read -p "Enter the Directory(d) or File(f)" d_f
# case $option in
#     [+])
#        show_files_within_n_days=$(find $path -type $d_f -mtime +$days exec rm -rf {} \;) 
#        echo "$files_within_n_days"
#        find $path -type $d_f -mtime +$days exec rm -rf {} \;
#        ;;
#     [-])
#        show_files_older_than_n_Days=$(find $path -type $d_f -mtime -$days)
#        echo "$show_files_older_than_n_Days"
#        find $path -type $d_f -mtime -$days exec rm -rf {} \;
#        ;;
#     *)
#        echo "Invalid option"
#        ;;
# esac

# if you want to delete the file : find $path -type f -mtime +$days delete
#if you want to delete the directory : find $path -type d -mtime -$days exec rm -rf {} \;
