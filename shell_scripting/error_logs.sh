read -p "Enter the file along with the path to check the error: " path
grep -i error $path
if [[ $? -eq 0 ]]; then
    echo "there is error in the OS logs"
else
    echo "there is no error in the OS logs"
fi