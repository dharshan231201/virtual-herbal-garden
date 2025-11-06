// Clones the repository with retry logic.
def call(Map args) {
    def branch = args.branch
    def repoUrl = args.repoUrl
    def credentialsId = args.credentialsId

    stage('SL: Clone Repository') {
        steps {
            echo "--- SL: Cloning branch ${branch} ---"
            retry(3) {
                script {
                    dir(env.WORKSPACE) {
                        git(
                            branch: branch,
                            url: repoUrl,
                            credentialsId: credentialsId
                        )
                    }
                }
            }
        }
    }
}
