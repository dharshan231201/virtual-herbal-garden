// Handles comprehensive email notifications based on build status.
def call(String status) {
    // Access pipeline parameters and environment variables
    def branch = pipeline.params.BRANCH_TO_SELECT
    def recipient = 'dharshan122001@gmail.com'
    def credId = 'Email-cred'
    
    def subject
    def body

    switch (status) {
        case 'SUCCESS':
            subject = "✅ SUCCESS: Pipeline Completed (${branch})"
            body = """
                <p>Pipeline completed successfully!</p>
                <ul>
                  <li><strong>Branch:</strong> ${branch}</li>
                  <li><strong>Job:</strong> ${env.JOB_NAME}</li>
                  <li><strong>Build:</strong> <a href="${env.BUILD_URL}">${env.BUILD_NUMBER}</a></li>
                </ul>
            """
            break
        case 'FAILURE':
            subject = "❌ FAILURE: Pipeline Failed (${branch})"
            body = "Pipeline failed! Check console output: <a href=\"${env.BUILD_URL}\">Build #${env.BUILD_NUMBER}</a>"
            break
        case 'UNSTABLE':
            subject = "⚠️ UNSTABLE: Build completed with warnings"
            body = "The pipeline finished, but encountered issues. Review console output: <a href=\"${env.BUILD_URL}\">Build #${env.BUILD_NUMBER}</a>"
            break
        case 'ABORTED':
            subject = "🚫 ABORTED: Pipeline manually stopped or timed out"
            body = "The pipeline was aborted. Review details: <a href=\"${env.BUILD_URL}\">Build #${env.BUILD_NUMBER}</a>"
            break
        default:
            return 
    }

    script {
        withCredentials([usernamePassword(credentialsId: credId, usernameVariable: 'SMTP_USER', passwordVariable: 'SMTP_PASS')]) {
            emailext(
                subject: subject,
                body: body,
                mimeType: 'text/html',
                to: recipient,
                from: SMTP_USER
            )
        }
    }
}