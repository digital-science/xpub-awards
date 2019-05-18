const { models } = require('component-workflow-model/model');
const { AwardSubmission } = models;

const { FigshareApi } = require('figshare-publish-service');
const crypto = require('crypto');


module.exports = function _setupPublishAwardTask(client) {

    client.subscribe('publish-award', async ({ task, taskService }) => {

        console.log("---------------");
        console.log(`[External-Task] Publish Award:`);
        console.log(JSON.stringify(task, null, 4));
        console.log("---------------");

        const instanceId = task.businessKey;
        if(!instanceId) {
            // FIXME: may need to fail task here and report it
            logger.error(`External Task (publish-award): failed to process for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const submission = await AwardSubmission.find(instanceId, ['files', 'awardees.identity']);
        if(!submission) {
            logger.warn(`External Task (publish-award): unable to find award submission instance for id (${instanceId})`);
            return;
        }

        _publishSubmission(submission).then(() => {

            return taskService.complete(task);
        });
    });
};


function _md5ForS3File(s3Object) {

    // FIXME: probably a better way of keeping track of the MD5, perhaps the client can calc. when sending originally via S3 upload process?

    return new Promise((resolve, reject) => {

        const rs = s3Object.createReadStream();

        const hash = crypto.createHash('md5');
        hash.setEncoding('hex');

        rs.on('end', function() {
            hash.end();
            return resolve(hash.read());
        });
        rs.on('error', error => {
            return reject(error);
        });

        rs.pipe(hash);
    });
}

function _s3ParametersForPartRange(part) {

    return {Range:`bytes=${part.startOffset}-${part.endOffset}`};
}



function _publishSubmission(submission) {

    // FIXME: replace hard-coded values for published awards (based on full submission data field set)
    const title = "Demo Award";
    const articleData = {
        title: title,
        categories: [ 2 ],
        tags: [
            "Demo Award"
        ]
    };

    if(submission.citation) {
        articleData.description = submission.citation;
    }

    if(submission.awardees && submission.awardees instanceof Array && submission.awardees.length) {

        const names = submission.awardees.map(function(awardee) {
            return `${awardee.firstName} ${awardee.lastName}`;
        });

        articleData.authors = submission.awardees.map(awardee => {
            const a = {name: `${awardee.firstName} ${awardee.lastName}`};
            if(awardee.identity && awardee.identity.type === 'orcid') {
                a.orcid_id = awardee.identity.identityId;
            }
            return a;
        });

        if(names.length > 1) {
            articleData.title = names.slice(0, names.length - 1).join(", ") + " & " + names[names.length-1] +  ": " + articleData.title;
        } else {
            articleData.title = names[0] + ": " + articleData.title;
        }
    }

    const citation = {
        schema_version:"0.1",
        award: "Demo Award",
        submission_id: submission.id
    };

    const createArticleIdPromise = !submission.figshareArticleId ? FigshareApi.createNewArticle(articleData).then(articleId => {

        submission.figshareArticleId = "" + articleId;

        return submission.save().then(() => {
            return articleId;
        });

    }) : Promise.resolve(submission.figshareArticleId);


    return createArticleIdPromise.then(articleId => {

        return _publishToArticleId(articleId, citation, submission);

    }).then((articleId) => {

        return FigshareApi.publishArticle(articleId).then(() => {

            return articleId;
        });
    })
}



function _publishToArticleId(articleId, citation, submission) {

    // Delete all the pre-existing files associated with this article, the steps after this will re-add any removed file.

    return FigshareApi.getArticleFileListing(articleId).then((currentFiles) => {

        const p = [];

        if(currentFiles && currentFiles.length) {
            currentFiles.forEach(file => {
                p.push(FigshareApi.deleteFile(articleId, file));
            });
        }

        return Promise.all(p);

    }).then(() => {

        // Create and upload the "citation.json" file.
        return _uploadCitationForArticle(articleId, citation);

    }).then(() => {

        // Iterate all of the submission files and upload each to the article within figshare.
        const files = (submission.files || []).slice(0).filter(f => f.confirmed);

        function __processNextFile() {
            if(!files.length) {
                return Promise.resolve({articleId});
            }

            const file = files.shift();

            return _uploadFileForArticle(articleId, submission, file).then(function() {
                return __processNextFile();
            });
        }

        return __processNextFile();

    }).then(() => {

        return articleId;
    });
}


function _uploadCitationForArticle(articleId, citation, citationFileName='citation.json') {

    const jsonData = Buffer.from(JSON.stringify(citation, null, 4), 'utf8');
    const md5Hash = crypto.createHash('md5').update(jsonData).digest('hex');

    return FigshareApi.initiateFileUpload(articleId, citationFileName, jsonData.length, md5Hash).then(({fileInfo, uploadInfo}) => {

        // Iterate all of the parts and upload each of them.
        const parts = uploadInfo.parts;

        function _uploadNextPart() {
            if(!parts.length) {
                return {fileInfo, uploadInfo};
            }

            const part = parts.shift();
            const dataSection = Buffer.from(jsonData, part.startOffset, part.endOffset - part.startOffset);

            return FigshareApi.uploadFilePart(articleId, fileInfo, part, dataSection).then(function() {
                return _uploadNextPart();
            });
        }

        return _uploadNextPart();

    }).then(({fileInfo}) => {

        return FigshareApi.completeFileUpload(articleId, fileInfo);
    });
}



function _uploadFileForArticle(articleId, submission, file) {

    const s3Object = file.s3Object("AwardSubmission", submission.id);

    return _md5ForS3File(s3Object).then(md5 => {

        return FigshareApi.initiateFileUpload(articleId, file.fileName, file.fileByteSize, md5);

    }).then(({fileInfo, uploadInfo}) => {

        const parts = uploadInfo.parts;

        function _uploadNextPart() {

            if(!parts.length) {
                return {fileInfo, uploadInfo};
            }

            const part = parts.shift();
            const partStream = file.s3Object("AwardSubmission", submission.id, _s3ParametersForPartRange(part)).createReadStream();

            return new Promise((resolve, reject) => {

                partStream.on('error', (error) => {
                    return reject(error);
                });

                const req = FigshareApi.uploadFilePart(articleId, fileInfo, part);

                req.on("error", (error) => {
                    console.error("");
                    return reject(error);
                });

                partStream.pipe(req);

                req.on("end", () => {
                    return resolve(_uploadNextPart());
                });
            });
        }

        return _uploadNextPart();

    }).then(({fileInfo}) => {

        return FigshareApi.completeFileUpload(articleId, fileInfo);
    });
}