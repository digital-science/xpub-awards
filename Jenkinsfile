properties([
    parameters([
        string(defaultValue: 'xpub-awards-prototype', description: 'Host to deploy the built Docker image onto.', name: 'DockerImageName'),

        string(defaultValue: '', description: 'Host to deploy the built Docker image onto.', name: 'DeploymentServer'),
        string(defaultValue: '', description: 'Port mapping on the deployment server to deploy from.', name: 'DeploymentPort'),

        string(defaultValue: '', description: 'Host to deploy the built Docker image onto.', name: 'EnvFileLocation'),

        string(defaultValue: '', description: 'ECR Host to publish Docker image onto', name: 'ECRHost'),
        string(defaultValue: 'ec2-user', description: 'ECR Host to publish Docker image onto', name: 'DockerRunUser'),

        string(defaultValue: 'xpub-awards-camunda', description: 'Camunda Workflow Engine docker container name for linking', name: 'LinkedWorkflowEngine'),
        string(defaultValue: 'xpub-awards-postgres', description: 'Postgres docker container name for linking', name: 'LinkedPostgres'),

        string(defaultValue: 'jenkins-ssh-key', description: 'Deployment server Jenkins SSH credentials name', name: 'DeploymentSSHCredentials'),
    ])
])

node {
    def app
    def GIT_COMMIT

    def DOCKER_FILE_NAME = "."
    def DOCKER_IMAGE_NAME = "${params.DockerImageName}"
    def DOCKER_CONTAINER_NAME_PREFIX = DOCKER_IMAGE_NAME
    def DOCKER_CONTAINER_NAME
    def DOCKER_RUN_USER = "${params.DockerRunUser}"

    def DEPLOYMENT_SERVER = "${params.DeploymentServer}"
    def DEPLOYMENT_PORT = "${params.DeploymentPort}"
    def CONFIG_LOCATION_SOURCE

    def DOCKER_RUN_EXTRA_CURRENT = "--link ${params.LinkedPostgres}:postgres --link ${params.LinkedWorkflowEngine}:workflow"


    stage ('Clean') {
        deleteDir()
    }

    stage('Clone repository') {

        checkout scm
        GIT_COMMIT = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()

        if (BRANCH_NAME == 'development') {
            DOCKER_CONTAINER_ENV = "dev"
            DOCKER_FILE_NAME = "./Dockerfile-development"
        }

        DOCKER_CONTAINER_NAME = "${DOCKER_CONTAINER_NAME_PREFIX}.${DOCKER_CONTAINER_ENV}.current"
    }

    stage('Build image') {

        app = docker.build("${DOCKER_IMAGE_NAME}", "${DOCKER_FILE_NAME}")
    }

    stage('Push image') {
        docker.withRegistry("https://${params.ECRHost}") {
            app.push("${BRANCH_NAME}-${env.BUILD_NUMBER}")
            app.push("${GIT_COMMIT}")
            app.push("${DOCKER_CONTAINER_ENV}-latest")
        }
    }

    stage('Deploy') {
        if(DEPLOYMENT_SERVER && DEPLOYMENT_SERVER != "" && DEPLOYMENT_PORT && DEPLOYMENT_PORT != "" && DOCKER_CONTAINER_NAME) {
            withCredentials([sshUserPrivateKey(credentialsId: "${params.DeploymentSSHCredentials}", usernameVariable: 'sshUsername', keyFileVariable: 'sshKeyFile')]) {

                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker pull ${params.ECRHost}/${DOCKER_IMAGE_NAME}:${BRANCH_NAME}-${env.BUILD_NUMBER}'"
                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker ps -q --filter name=\'${DOCKER_CONTAINER_NAME}\' | xargs -r docker stop && docker ps -a -q --filter name=\'${DOCKER_CONTAINER_NAME}\' | xargs -r docker rm'"
                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker run -d -p 0.0.0.0:${DEPLOYMENT_PORT}:3000/tcp -u `id -u ${DOCKER_RUN_USER}` --restart=always -e ENVIRONMENT=\'${DOCKER_CONTAINER_ENV}\' ${DOCKER_RUN_EXTRA_CURRENT} --env-file=\'${params.EnvFileLocation}\' --name \'${DOCKER_CONTAINER_NAME}\' ${params.ECRHost}/${DOCKER_IMAGE_NAME}:${BRANCH_NAME}-${env.BUILD_NUMBER}'"
            }
        }
    }

}
