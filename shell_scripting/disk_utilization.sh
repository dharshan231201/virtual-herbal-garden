#!/bin/bash
echo "checking the disk size"
disk_size=$(df -h | grep '/dev/sda1' | awk '{print $5}' | cut -d '%' -f 1)
threshold=5
echo "$disk_size"
echo "$threshold"
if [ $disk_size -le $threshold ]; then
    echo "The Threshold is $threshold and the disk size is $disk_size therefore the limit is exceeded"
    exit 1
else
    echo "disk size is ok"
    exit 0
fi

