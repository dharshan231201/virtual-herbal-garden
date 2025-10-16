#!/bin/bash
cpu_load=$(top -bn1 | head -1 | cut -d ',' -f '4')
cpu_load_value=$(top -bn1 | head -1 | cut -d ',' -f '4' | awk '{print $3}')

if [[ cp_load_value > 1 ]]; then
    echo -e "CPU load is very high: $cpu_load_value"
else
    echo "CPU load is normal"
fi
