#!/bin/bash
read_input()
{
read -p "Enter the number 1: " num1
read -p "Enter the number 2: " num2
}
echo -e "[a]addition\n[s]subtraction\n[m]multiplication\n[d]division\n"
read -p "Enter your option: " option
case $option in
  [aA])
      read_input
      result=$((num1+num2))
      echo "Result: $result"
      ;;
  [sS])
      read_input
      result=$((num1-num2))
      echo "Result: $result"
      ;;
  [mM])
      read_input
      result=$((num1*num2))
      echo "Result: $result"
      ;;
  [dD])
      read_input
      result=$((num1/num2))
      echo "Result: $result"
      ;;
  *)
      echo "Invalid option"
      ;;
esac