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

                    rm -rf gitops
                    git clone https://github.com/rosine87/gitops.git
                    cd gitops

                    git config user.email "jenkins@local"
                    git config user.name "jenkins"

                    # Update tag
                    sed -i "s|tag: \\".*\\"|tag: \\"${IMAGE_TAG}\\"|g" envs/local/values.yaml

                    git add envs/local/values.yaml
                    git commit -m "chore(gitops): backend -> ${IMAGE_TAG}" || echo "No changes"

                    # --- SAFE PUSH (no token in URL) ---
                    cat > /tmp/git-askpass.sh <<'EOF'
            #!/bin/sh
            case "$1" in
            Username*) echo "$GIT_USER" ;;
            Password*) echo "$GIT_TOKEN" ;;
            esac
            EOF
                    chmod +x /tmp/git-askpass.sh

                    export GIT_ASKPASS=/tmp/git-askpass.sh
                    export GIT_TERMINAL_PROMPT=0

                    git push https://github.com/rosine87/gitops.git HEAD:master
                '''
                }
            }
        }

    }
}
