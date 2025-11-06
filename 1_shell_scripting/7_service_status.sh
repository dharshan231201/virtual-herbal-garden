#!/bin/bash
#line
read  -p "which service do you need to check: " -a service_name
read -p "Enter your password within 10 second: " -s -t 10 password

for service in ${service_name[@]}
do
  echo "Checking the Status of $service"
  systemctl is-active $service
  if [[ $? -eq 0 ]];then
    echo "$service is Active"
  else
    sudo systemctl start $service
    echo "$service is Started"
  fi
done