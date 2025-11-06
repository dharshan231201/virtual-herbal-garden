#!/bin/bash
cpu_load=$(top -bn1 | head -1 | cut -d ',' -f '4')
cpu_load_value=$(top -bn1 | head -1 | cut -d ',' -f '4' | awk '{print $3}')

if [[ cp_load_value > 1 ]]; then
    echo -e "CPU load is very high: $cpu_load_value"
else
    echo "CPU load is normal"
fi


# Load_average=$(top -bn1 | head -1 | cut -d ',' -f4)
# Load_average_value=$( top -bn1 | head -1 | cut -d ',' -f4 | awk '{ print $3 }')   #bn1 top shows live data , if you want the snapshot of top output after 1 refresh then use top -bn1
# threshold=5
# echo "$Load_average_value"
# if [[ $Load_average_value > $threshold ]]; then
#     echo " The load value reached more than 1 which is $Load_average_value "
# else
#     echo " $Load_average"
# fi 

