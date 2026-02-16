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
                sh '''
                git clone https://github.com/rosine87/gitops.git
                cd gitops/envs/local

                sed -i "s/tag:.*/tag: \\"$IMAGE_TAG\\"/g" values.yaml

                git config user.email "jenkins@ci.com"
                git config user.name "jenkins"

                git add values.yaml
                git commit -m "Update backend image to $IMAGE_TAG"
                git push https://$DOCKERHUB_CREDS_USR:$DOCKERHUB_CREDS_PSW@github.com/rosine87/gitops.git
                '''
            }
        }
    }
}
