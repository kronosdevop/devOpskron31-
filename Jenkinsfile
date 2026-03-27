pipeline {
    agent any
    environment {
        NEXUS_REGISTRY = '44.200.221.65:8082'
        IMAGE_NAME = 'nodejs-app'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${NEXUS_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }
        stage('Push to Nexus') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-docker-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "docker login ${NEXUS_REGISTRY} -u \$USER -p \$PASS"
                    sh "docker push ${NEXUS_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh "sed -i 's|NEXUS_REPO/nodejs-app:BUILD_NUMBER|${NEXUS_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}|g' k8s-deployment.yaml"
                    sh "kubectl apply -f k8s-deployment.yaml"
                    sh "kubectl rollout status deployment/nodejs-app"
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
