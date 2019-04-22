require('dotenv').config();
const path = require('path');
const logger = require('./loggerCustom');
const components = require('./components.json');

const getDbConfig = () => {
    if (process.env.DATABASE) {
        return {
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DATABASE,
            host: process.env.DB_HOST,
            port: 5432,
            ssl: false,
            newJobCheckIntervalSeconds: 3600,
            expireCheckIntervalMinutes: 60
        };
    }
    return {};
};

module.exports = {
    // Public keys are copiued into webpack build (i.e. go client-side)
    publicKeys: ['pubsweet-client', 'authsome', 'validations'],

    authsome: {
        mode: path.resolve(__dirname, 'authsome-mode.js'),
        teams: {
            handlingEditor: {
                name: 'Handling Editors'
            },
            reviewer: {
                name: 'Reviewer'
            }
        }
    },
    validations: path.resolve(__dirname, 'validations.js'),
    pubsweet: {
        components
    },
    dbManager: {
        migrationsPath: path.join(process.cwd(), 'migrations')
    },
    'pubsweet-server': {
        db: getDbConfig(),
        pool: { min: 0, max: 10 },
        ignoreTerminatedConnectionError: true,
        port: 3000,
        logger,
        uploads: 'uploads',
        secret: 'SECRET',
        enableExperimentalGraphql: true,
        graphiql: true
    },
    'pubsweet-client': {
        API_ENDPOINT: '/api',
        baseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
        'login-redirect': '/',
        'redux-log': process.env.NODE_ENV !== 'production',
        theme: process.env.PUBSWEET_THEME
    },
    orcid: {
        clientID: process.env.ORCID_CLIENT_ID,
        clientSecret: process.env.ORCID_CLIENT_SECRET,
        callbackPath: '/api/users/orcid/callback',
        successPath: '/profile'
    },
    'mail-transport': {
        sendmail: true
    },
    'pubsweet-component-aws-s3': {
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        region: process.env.AWS_S3_REGION,
        bucket: process.env.AWS_S3_BUCKET,
        validations: path.resolve(__dirname, 'upload-validations.js')
    },
    mailer: {
        from: 'hindawi@thinslices.com',
        path: `${__dirname}/mailer`
    },
    SES: {
        accessKey: process.env.AWS_SES_ACCESS_KEY,
        secretKey: process.env.AWS_SES_SECRET_KEY,
        region: process.env.AWS_SES_REGION
    },
    workflow: {
        apiUri: 'http://127.0.0.1:8080/engine-rest',
        processDefinitionId:
            'award-submission:4:f94c89b6-5ad4-11e9-b0b9-0242ac110003',
        deploymentName: 'award-submission',
        deploymentFilesSource: './definitions',
        deploymentFiles: ['award-submission.bpmn']
    }
};
