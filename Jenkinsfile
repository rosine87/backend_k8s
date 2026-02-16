pipeline {
  agent any

  environment {
    DOCKERHUB_REPO = "tsamodocker2020/backend"
    GITOPS_BRANCH  = "master"
    VALUES_FILE    = "envs/local/values.yaml"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build & Push Image') {
      steps {
        script {
          def tag = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          env.IMAGE_TAG = tag

          withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
            sh """
              echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
              docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} .
              docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
            """
          }
        }
      }
    }

    stage('Update GitOps values.yaml') {
      steps {
        dir('gitops-repo') {
          withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
            sh """
              git clone -b ${GITOPS_BRANCH} https://${GH_USER}:${GH_TOKEN}@github.com/rosine87/gitops.git .
              git config user.email "jenkins@local"
              git config user.name "jenkins"

              python - <<'PY'
import yaml
path = "${VALUES_FILE}"
with open(path) as f:
    data = yaml.safe_load(f)
data["backend"]["image"]["tag"] = "${IMAGE_TAG}"
with open(path, "w") as f:
    yaml.safe_dump(data, f, sort_keys=False)
print("Updated", path, "backend.tag =", "${IMAGE_TAG}")
PY

              git add ${VALUES_FILE}
              git commit -m "chore(gitops): backend -> ${IMAGE_TAG} [skip ci]" || true
              git push origin ${GITOPS_BRANCH}
            """
          }
        }
      }
    }
  }
}
