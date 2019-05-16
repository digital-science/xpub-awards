import React from 'react';
import styled from 'styled-components';

import withFormField, { fetchFields } from './withFormField';
import withFormFieldData from './withFormFieldData';

import Label from 'ds-awards-theme/components/label';
import humanFormatByteCount from "ds-awards-theme/helpers/humanFormatByteCount";

import { FaFilePdf } from 'react-icons/fa';


const FileListingHolder = styled.div`    
    > div.inner-holder {
        border: 1px solid #d0d0d0;
        border-radius: 5px;
        padding: 5px;
    }
`;


const SimpleFileListing = styled(({className, files}) => {

    if(!files || !files.length) {
        return null;
    }

    return (
        <ol className={className}>
            {files.map(file => {
                return (
                    <li key={file.id}>
                        <div>
                            <FaFilePdf />
                            <span className="file-name">{file.fileDisplayName}</span>
                            <span className="file-size">{humanFormatByteCount(file.fileByteSize)}</span>
                        </div>
                    </li>
                )
            })}
        </ol>
    );

})`
  
    font-family: ProximaNovaLight, sans-serif;
    font-size: 15px;
    
    list-style: none;
    margin: 0;
    padding: 0;
    
    margin-top: 5px;
    
    > li > div {
      display: inline-block;
      padding: 5px 5px;
      background: aliceblue;
      border-radius: 5px;
      border: 1px dashed #9dcef8;
    }
    
    > li svg {
      vertical-align: top;
    }
    
    > li span.file-name {
      margin-left: 4px;
    }
    
    > li span.file-size {
      color: #b3b3b3;
    }
    
    > li span.file-size:before {
      content: " (";
      color: #b3b3b3;
    }
    > li span.file-size:after {
      content: ")";
      color: #b3b3b3;
    }
`;



function FormFieldFilesListing({ formData, binding, instanceId, instanceType, options = {} }) {

    const [fileListing] = withFormFieldData(formData, binding);

    return (
        <FileListingHolder className={"form-field-files"}>
            {options.label ? <Label>{options.label}</Label> : null}
            {fileListing && fileListing.length ? <SimpleFileListing files={fileListing} /> : null}
        </FileListingHolder>
    );
}


export default withFormField(FormFieldFilesListing, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, fileName, fileDisplayName, fileMimeType, fileByteSize`);

    return {topLevel, fetch};
});