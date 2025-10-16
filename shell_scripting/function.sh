#!/bin/bash
disk_usage() {
    disk=$(df -h)
    echo -e "The disk usage is:\n$disk"    #if you want to make use of new line character then make use of -e flag
}

disk_usage