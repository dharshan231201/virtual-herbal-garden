// Builds a Docker image and securely pushes it.
def call(Map args) {
    def buildDir = args.dir
    def repo = args.repo
    def imageTag = args.imageTag
    def dockerUser = args.dockerUser
    def dockerPwd = args.dockerPwd

    stage("SL: Build and Push ${repo}") {
        steps {
            echo "SL: Building image: ${repo}:${imageTag} from ${buildDir}"
            
            // Build
            dir(buildDir) { 
                sh "docker build -t ${repo}:${imageTag} ."
            }
            
            // Secure Login & Push
            sh "echo ${dockerPwd} | docker login -u ${dockerUser} --password-stdin"
            sh "docker push ${repo}:${imageTag}"
        }
    }
}