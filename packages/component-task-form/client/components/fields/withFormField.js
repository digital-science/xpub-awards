import React from "react";
import './form-field.css';


export default function withFormField(f, bindingResolver) {

    const r = function(props) {
        return <div className="form-field">{f(props)}</div>
    };

    if(!bindingResolver) {
        r.bindingResolver = function(e) {
            return e.binding;
        };
    } else {
        r.bindingResolver = bindingResolver;
    }

    return r;
};