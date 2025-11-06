#!/bin/bash

read -p "enter the URL: " URL 
response=$( curl -s -w "%{http_code}" $URL)
code=$( tail -n1 <<< $response) # get the last line from the response
content=$( sed '$d' <<< $response) # while showing from the response please do not show the last line
echo -e "$response\n"
echo -e "$code\n"
echo -e "$content\n"

if [[ $code -eq 200 ]]; then
    echo "the website is working fine"
else
    echo "it is not working fine"
fi