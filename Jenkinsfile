// Jenkinsfile for Virtual Herbal Garden CI/CD Pipeline
// This defines the stages for building, deploying, and testing your application

pipeline {
    agent any // This means Jenkins can use any available agent (including the master)

    stages {
        stage('Clean Docker Environment') {
            steps {
                echo '--- Stopping Existing Application Containers ---'
                sh 'docker stop virtual-herbal-garden-frontend-container || true'
                sh 'docker stop virtual-herbal-garden-backend-container || true'

                echo '--- Cleaning Up Docker System (Containers, Images, Build Cache) ---'
                // -a removes all unused images, not just dangling ones
                // -f forces the removal without confirmation
                sh 'docker system prune -a -f'
                echo '--- Docker System Cleaned Up ---'
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo '--- Building Frontend Docker Image (React/Vite) ---'
                dir('client') { // Change directory to the client folder within the workspace
                    sh 'docker build -t virtual-herbal-garden-frontend:latest .'
                }
                echo '--- Frontend Docker Image Build Complete ---'
            }
        }

        stage('Build Backend Image') {
            steps {
                echo '--- Building Backend Docker Image (Python/FastAPI) ---'
                dir('server') { // Change directory to the server folder within the workspace
                    sh 'docker build -t virtual-herbal-garden-backend:latest .'
                }
                echo '--- Backend Docker Image Build Complete ---'
            }
        }

        stage('Run New Containers') {
            steps {
                echo '--- Running New Containers ---'
                // Ensure you replace YOUR_EC2_PUBLIC_IP below if your .env file needs it,
                // but for container internal communication, localhost or container names are better.
                // If your backend .env needs the public IP, you might need to manage it carefully.
                // For now, assuming the .env file has correct DB connection and doesn't rely on EC2 IP for host.
                sh """docker run -d --name virtual-herbal-garden-backend-container \\
                    -p 8005:8005 \\
                    --env-file /home/ubuntu/virtual-herbal-garden/server/.env \\
                    virtual-herbal-garden-backend:latest
                """

                sh """docker run -d --name virtual-herbal-garden-frontend-container \\
                    -p 2001:80 \\
                    virtual-herbal-garden-frontend:latest
                """
                echo '--- New Containers Started ---'
            }
        }

        stage('Continuous Testing') {
            steps {
                echo '--- Running Automated Health Check Test ---'
                dir('tests') { // Change directory to the tests folder within the workspace
                    sh './health_check_test.sh'
                }
                echo '--- Automated Health Check Test Complete ---'
            }
        }
    }

    // Post-build actions (e.g., send notifications)
    post {
        success {
            echo 'Pipeline finished successfully!'
        }
        failure {
            echo 'Pipeline failed! Check console output for details.'
        }
    }
}
