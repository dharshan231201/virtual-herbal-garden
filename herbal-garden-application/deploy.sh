#!/bin/bash

RELEASE_NAME="herbal-final"
CHART_PATH=". " # Or "path/to/your/chart" if not in current directory
VALUES_FILE="values.yaml"

echo "Running Helm upgrade for ${RELEASE_NAME}..."
helm upgrade "${RELEASE_NAME}" "${CHART_PATH}" --values "${VALUES_FILE}"

# Check if Helm upgrade was successful before checking rollout status
if [ $? -eq 0 ]; then
    echo "Helm upgrade completed successfully. Checking deployment rollouts..."

    echo "Checking backend deployment rollout status..."
    kubectl rollout status deployment/herbal-garden-backend-deployment || { echo "Backend rollout failed!"; exit 1; }

    echo "Checking frontend deployment rollout status..."
    kubectl rollout status deployment/herbal-garden-frontend-deployment || { echo "Frontend rollout failed!"; exit 1; }

    echo "All deployments rolled out successfully."
else
    echo "Helm upgrade failed. Skipping rollout status check."
    exit 1
fi