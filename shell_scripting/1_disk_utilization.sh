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

# #!/bin/bash
# read -p "enter the disk you need to check : " disk
# threshold=80
# diskfree=$(df -h | grep $disk | awk '{print $5}' | cut -d '%' -f 1)
# if [ $diskfree -ge $threshold ]; then
#   echo " The disk has reached the threshold limit "
# else
#   echo " The disk have not reached the limit yet $diskfree"
# fi

