Pipeline{
 Agent any //any user can make use of this groovy script in jenkins
Stages{

stage(‘clean Docker environment’){
    steps{
        echo ' stopping existing application'
        sh 'docker stop virtual-herbal-garden-frontend-container || true' // which means true is used to prevent the sript from failing 
        sh 'docker stop virtual-herbal-garden-backend-container || true' // which means true is used to prevent the sript from failing   
        sh ' docker system prune -a -f'   
    }
}
stage(‘create frontend image’){
    steps{
        dir('/home/ubuntu/virtual-herbal-garden/client/'){
        sh 'docker build -t virtual-herbal-garden-frontend:latest'
        }
    }
}
stage(‘create backend image’){
    steps{
        dir('/home/ubuntu/virtual-herbal-garden/server/'){
            sh 'docker build -t virtual-herbal-garden-backend:latest'
        }
    }
}
stage(‘create containers’){
    sh 'docker run -d --name virtual-herbal-garden-backend-container \
  -p 8005:8005 \
  --env-file /home/ubuntu/virtual-herbal-garden/server/.env \
  virtual-herbal-garden-backend:latest'
  sh 'docker run -d --name virtual-herbal-garden-frontend-container \
  -p 2001:80 \
  virtual-herbal-garden-frontend:latest'
}
}
post {
    success{ echo 'pipeline success'}
    failure{ echo 'pipeline failure'}
}
}
