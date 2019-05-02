import React, { useState, useEffect } from 'react';

import useCreateFileUploadSignedUrlMutation from './../../mutations/createFileUploadSignedUrl';
import useConfirmUploadedFileMutation from './../../mutations/confirmUploadedFile';
import useSetInstanceAssociatedFilesMutation from './../../mutations/setInstanceAssociatedFiles';
import withFormField from './withFormField';

import humanFormatByteCount from './../../utils/humanFormatByteCount';

import DropzoneS3Uploader from 'react-dropzone-s3-uploader';
import { FaFilePdf, FaTimes, FaUpload } from 'react-icons/fa';

import './form-field-file-uploader.css';



function FileDownloadLink({ file, instanceId, instanceType, children }) {

    // return <a href={generateDownloadLinkForSubmissionFile(submission, file)} target="_blank" rel="noopener noreferrer">{children}</a>;
    return <a href={""} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function FileUploadFileListing({ files, instanceId, instanceType, removeFile }) {

    const listing = (files || []).map((file, index) =>
        <li key={file.id}>
            <div className="file-index">{index + 1}</div>
            <div className="file-icon"><FaFilePdf /></div>
            <div className="file-name">
                <FileDownloadLink file={file} >{file.fileDisplayName}</FileDownloadLink> <span className="file-size">{humanFormatByteCount(file.fileByteSize)}</span>
            </div>
            <div className="file-remove"><FaTimes onClick={() => { return removeFile(file); }} /></div>
        </li>
    );

    return (
        <div className="uploaded-files-listing">
            <ol style={{listStyle:"none", padding:0}}>{listing}</ol>
        </div>
    );
}

function FileUploadGreeting(props) {
    return <div className="greeting"><FaUpload /> {props.message}</div>;
}

function FileUploadProgress({progress}) {

    if(progress === null || progress === undefined) {
        return <div />;
    }
    return (
        <div className="progress-holder">
            <div style={{flexBasis: `${progress}%`}} />
        </div>
    );
}

function FileUploadError({error}) {

    return (error) ? <div className="error">{error}</div> : <div />;
}




function FormFieldFileUploader({ formData, binding, instanceId, instanceType, options = {} }) {

    const setInstanceAssociatedFiles = useSetInstanceAssociatedFilesMutation(instanceType, binding);
    const createFileUploadSignedUrl = useCreateFileUploadSignedUrlMutation();
    const confirmFileUpload = useConfirmUploadedFileMutation();
    const [fileListing, setFileListing] = useState([]);

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setFileListing(form.getFieldValue(field) || []);
    };

    useEffect(() => {

        if(!formData || !binding) {
            return;
        }

        formData.on(`field.${binding}`, formDataWasChanged);
        setFileListing(formData.getFieldValue(binding) || []);

        return function cleanup() {
            formData.off(`field.${binding}`, formDataWasChanged);
        };

    }, [formData, binding]);


    function getSignedUrl(file, callback) {

        console.dir(file);

        const signature = {
            ownerType: instanceType.name,
            ownerId: instanceId,
            fileName: file.name,
            mimeType: file.type
        };

        const createFileUploadInput = {signature};
        const fileSize = file.size;

        return createFileUploadSignedUrl(createFileUploadInput).then(result => {

            return callback({signedUrl:result.signedUrl, fileId:result.fileId, signature, fileSize});
        });
    }

    function finishedFileUpload(result) {

        console.log("Finish file upload !!!");
        console.dir(result);

        const confirmFileUploadInput = {
            fileId: result.fileId,
            signedUrl: result.signedUrl,
            signature: result.signature,
            fileByteSize: result.fileSize
        };

        return confirmFileUpload(confirmFileUploadInput).then(result => {

            console.dir(result);

            if(!result) {
                return;
            }

            const newFiles = fileListing ? fileListing.slice(0) : [];
            newFiles.push(result);

            setFileListing(newFiles);

            return setInstanceAssociatedFiles(instanceId, newFiles.map(file => file.id)).then(result => {

                console.log("did set associated files");
                console.dir(result);
            })

            // Now need to save this as the set of files associated with the instance owner.
            // !!!!

        });

        /*const { file, fileID } = result;
        const finalFile = {};

        finalFile.id = fileID;
        finalFile.name = file.name;
        finalFile.type = file.type;
        finalFile.size = file.size;

        const files = value || [];
        files.push(finalFile);

        setModelValue(files);*/
    }

    function removeFile(file) {

        console.log("Remove file !!!");
        console.dir(file);

        /*if(file.id) {
            const newFiles = (value || []).filter(f => f.id !== file.id);
            setModelValue(newFiles);
            // NOTE: also delete file from server, or allow for a cleanup process to remove unlinked files??
        }*/
    }

    const upload = {
        getSignedUrl: getSignedUrl,
        uploadRequestHeaders:{}
    };

    return (
        <div className={"form-field-files"}>
            {options.label ? <label>{options.label}</label> : null}

            <DropzoneS3Uploader
                s3Url={'https://ds-innovation-workflow-dev.s3.eu-west-2.amazonaws.com/'}
                isImage={filename => { return false; }}
                upload={upload}
                onFinish={finishedFileUpload}
            >
                <FileUploadGreeting message={options.message || <span><b>Choose a file</b> or drag it here.</span>} />
                <FileUploadProgress />
                <FileUploadError />
            </DropzoneS3Uploader>

            <FileUploadFileListing files={fileListing} instanceId={instanceId} instanceType={instanceType} removeFile={removeFile} />
        </div>
    );
}


export default withFormField(FormFieldFileUploader, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = `${element.binding} {
        id
        fileName
        fileDisplayName
        fileMimeType
        fileByteSize
    }`;

    return {topLevel, fetch};
});