properties([
    parameters([
        string(defaultValue: 'xpub-awards', description: 'Host to deploy the built Docker image onto.', name: 'DockerImageName'),

        string(defaultValue: '', description: 'Host to deploy the built Docker image onto.', name: 'DeploymentServer'),
        string(defaultValue: '', description: 'Port mapping on the deployment server to deploy from.', name: 'DeploymentPort'),
        string(defaultValue: 'development', description: 'Environment being deployed onto.', name: 'DeploymentEnvironment'),

        string(defaultValue: '', description: 'Host to deploy the built Docker image onto.', name: 'EnvFileLocation'),

        string(defaultValue: '', description: 'ECR Host to publish Docker image onto', name: 'ECRUri'),
        string(defaultValue: 'ec2-user', description: 'ECR Host to publish Docker image onto', name: 'DockerRunUser'),

        string(defaultValue: 'xpub-awards-camunda', description: 'Camunda Workflow Engine docker container name for linking', name: 'LinkedWorkflowEngine'),
        string(defaultValue: 'xpub-awards-postgres', description: 'Postgres docker container name for linking', name: 'LinkedPostgres'),

        string(defaultValue: 'jenkins-ssh-key', description: 'Deployment server Jenkins SSH credentials name', name: 'DeploymentSSHCredentials'),
    ])
])

node {
    def app
    def GIT_COMMIT
    def BUILD_NAME

    def DOCKER_FILE_NAME = "Dockerfile"
    def DOCKER_IMAGE_NAME = "${DockerImageName}"
    def DOCKER_CONTAINER_NAME_PREFIX = DOCKER_IMAGE_NAME
    def DOCKER_CONTAINER_NAME
    def DOCKER_RUN_USER = "${DockerRunUser}"

    def DEPLOYMENT_SERVER = "${DeploymentServer}"
    def DEPLOYMENT_PORT = "${DeploymentPort}"
    def DEPLOYMENT_ENV = "${DeploymentEnvironment}"

    def DOCKER_CONTAINER_ENV
    def DOCKER_RUN_EXTRA_CURRENT = "--link ${LinkedPostgres}:postgres --link ${LinkedWorkflowEngine}:workflow"


    stage ('Clean') {
        deleteDir()
    }

    stage('Clone repository') {

        def scmVars = checkout scm
        GIT_COMMIT = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()

        DOCKER_CONTAINER_ENV=DEPLOYMENT_ENV
        BUILD_NAME=DEPLOYMENT_ENV

        if (BUILD_NAME == 'development') {
            DOCKER_FILE_NAME = "./Dockerfile-development"
        }

        DOCKER_CONTAINER_NAME = "${DOCKER_CONTAINER_NAME_PREFIX}.${DOCKER_CONTAINER_ENV}.current"
    }

    stage('Build image') {

        app = docker.build("${DOCKER_IMAGE_NAME}", "-f ${DOCKER_FILE_NAME} .")
    }

    stage('Push image') {
        docker.withRegistry("https://${ECRUri}") {
            app.push("${BUILD_NAME}-${env.BUILD_NUMBER}")
            app.push("${GIT_COMMIT}")
            app.push("${DOCKER_CONTAINER_ENV}-latest")
        }
    }

    stage('Deploy') {
        if(DEPLOYMENT_SERVER && DEPLOYMENT_SERVER != "" && DEPLOYMENT_PORT && DEPLOYMENT_PORT != "" && DOCKER_CONTAINER_NAME) {
            withCredentials([sshUserPrivateKey(credentialsId: "${DeploymentSSHCredentials}", usernameVariable: 'sshUsername', keyFileVariable: 'sshKeyFile')]) {

                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker pull ${ECRUri}/${DOCKER_IMAGE_NAME}:${BUILD_NAME}-${env.BUILD_NUMBER}'"
                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker ps -q --filter name=\'${DOCKER_CONTAINER_NAME}\' | xargs -r docker stop && docker ps -a -q --filter name=\'${DOCKER_CONTAINER_NAME}\' | xargs -r docker rm'"
                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker run -d -p 0.0.0.0:${DEPLOYMENT_PORT}:3000/tcp -u `id -u ${DOCKER_RUN_USER}` --restart=always -e ENVIRONMENT=\'${DOCKER_CONTAINER_ENV}\' ${DOCKER_RUN_EXTRA_CURRENT} --env-file=\'${EnvFileLocation}\' --name \'${DOCKER_CONTAINER_NAME}\' ${ECRUri}/${DOCKER_IMAGE_NAME}:${BUILD_NAME}-${env.BUILD_NUMBER}'"
            }
        }
    }

}
