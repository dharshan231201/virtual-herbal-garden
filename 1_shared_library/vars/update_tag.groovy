// Updates the Helm values.yaml file using the yq command.
def call(Map args) {
    def valuesFile = args.valuesFile
    def frontendTag = args.frontendTag
    def backendTag = args.backendTag

    stage('SL: Update YAML (yq)') {
        steps {
            echo "SL: Updating K8s values file: ${valuesFile}"
            sh """
            yq e '.frontend.image.tag = "${frontendTag}"' -i ${valuesFile}
            yq e '.backend.image.tag = "${backendTag}"' -i ${valuesFile}
            echo 'SL: values.yaml updated successfully.'
            """
        }
    }
}