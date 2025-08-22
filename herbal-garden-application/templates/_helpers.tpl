{{- define "frontend.labels" }}
    labels:
        deployment_name: herbal-garden-frontend-deployment
        deployment_label: herbal-garden-frontend-deployment-label
        pod_label: herbal-garden-frontend-pod
        container_name: herbal-garden-frontend-container
        service_name: herbal-garden-frontend-service
        service_label: herbal-garden-frontend-service-label
{{- end }}        