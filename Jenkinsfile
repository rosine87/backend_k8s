pipeline {
    agent any

    environment {
        IMAGE_NAME = "tsamodocker2020/backend"
        IMAGE_TAG = "1.${BUILD_NUMBER}"
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master',
                url: 'https://github.com/rosine87/backend_k8s.git'
            }
        }

        stage('Build Docker image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME:$IMAGE_TAG .
                '''
            }
        }

        stage('Login DockerHub') {
            steps {
                sh '''
                echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin
                '''
            }
        }

        stage('Push image') {
            steps {
                sh '''
                docker push $IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }

      stage('Update GitOps values.yaml') {
            steps {
                withCredentials([usernamePassword(
                credentialsId: 'credentials_github',
                usernameVariable: 'GIT_USER',
                passwordVariable: 'GIT_TOKEN'
                )]) {
                sh '''
                    set -e
                    
                    echo "Cloning GitOps repo..."
                    rm -rf gitops
                    git clone https://github.com/rosine87/gitops.git
                    cd gitops

                    echo "Configure git identity"
                    git config user.email "jenkins@local"
                    git config user.name "jenkins"

                    echo "Update backend image tag in values.yaml"
                    sed -i "s/tag:.*/tag: \\"${IMAGE_TAG}\\"/g" envs/local/values.yaml

                    echo "Show diff"
                    git diff

                    echo "Commit change"
                    git add envs/local/values.yaml
                    git commit -m "chore(gitops): backend -> ${IMAGE_TAG}" || echo "No changes"

                    echo "Push using GitHub PAT"
                    git remote set-url origin https://${GIT_USER}:${GIT_TOKEN}@github.com/rosine87/gitops.git
                    git push origin HEAD:master
                '''
                }
            }
        }

    }
}
