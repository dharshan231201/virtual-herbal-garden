#!/bin/bash
for i in 1 2 3 4 5; do
    if [ "$i" -eq 3 ]; then
        echo "Found 3. Breaking out of the loop."
        break  # <--- Stops the loop
    fi
    echo "Processing number: $i"
done

echo "Script continues after the loop."



Output:

Processing number: 1
Processing number: 2
Found 3. Breaking out of the loop.
Script continues after the loop.

#================================


#!/bin/bash
for i in 1 2 3 4 5; do
    if [ "$i" -eq 3 ]; then
        echo "Found 3. Exiting script successfully."
        exit 0  # <--- Terminates the entire script with success code 0
    fi
    echo "Processing number: $i"
done

echo "This line will NEVER be executed."



Output 
$ ./script.sh
Processing number: 1
Processing number: 2
Found 3. Exiting script successfully.

$ echo $?
0  # <--- The success status is set
