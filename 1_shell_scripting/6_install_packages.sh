#!/bin/bash
if [ $# -eq 0 ]; then
    echo "Error: No Packages given"
    exit 1
elif [[ $(uname) == "Linux" ]]; then
    echo "This is a Linux System"
    sudo apt-get update -y
    for package in "$@"; do
        if which "$package" >/dev/null; then
            echo "$package is already installed"
            continue
        
        else
           sudo apt-get install "$package" -y> /dev/null 2>&1
           if [[ $? -eq 0 ]]; then
               echo "$package installed successfully"
           else
               echo "$package installation failed"
           fi
        fi
        
    done

# ./install_packages.sh git curl
# wget is used to download the zip_files/normal_file of the software and extract and run the software
# wget <tarfile_path_from_website>
# tar -zxvf <tarfile_name> and run the file