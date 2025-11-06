read -p "Enter the directory where the file exists: " path
grep -i -r error $path  # lets say you are in ine directory and there are 1000 files and want to check on which files does it have ERROR Message , then you can use this 
#grep -ic error $path # to see the C (count) of the search that is found
#grep -il error $path # to see the filename(l) of the search that is found
if [[ $? -eq 0 ]]; then
    echo "there is error in the OS logs"
else
    echo "there is no error in the OS logs"
fi

