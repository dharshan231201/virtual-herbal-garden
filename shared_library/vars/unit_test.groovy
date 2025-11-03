// Runs unit tests using a shell command.
def call(String testCommand) {
    stage('SL: Run Unit Tests') {
        steps {
            echo "SL: Executing test command: ${testCommand}"
            sh testCommand
            // NOTE: Add JUnit reporting here if needed: junit '**/target/surefire-reports/*.xml'
        }
    }
}