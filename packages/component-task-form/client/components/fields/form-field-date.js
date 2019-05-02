import React, { useState, useMemo } from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField';
import moment from 'moment';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './form-field-date.css';

import { SingleDatePicker, CalendarDay } from 'react-dates';


let DATE_PICKER_ID = 1;

function FormFieldDate({formData, binding, options = {}}) {

    const {value, setModelValue} = useFormValueBinding(formData, binding, null);
    const [focused, setFocused] = useState(false);
    const pickerID = useMemo(() => {
        return DATE_PICKER_ID++;
    });

    function onDateChanged(date) {
        setModelValue(date ? date.toDate() : null);
    }

    function valueToDate(value) {
        return value ? moment(new Date(value)) : null;
    }

    const safeModifiers = modifiers => {
        return (modifiers instanceof Set) ? modifiers : new Set()
    };

    const datePicker = <SingleDatePicker
        placeholder={options.placeholder || "DD/MM/YYYY"}
        date={valueToDate(value)}
        onDateChange={onDateChanged}
        focused={focused}
        onFocusChange={({focused}) => setFocused(focused)}
        id={"basic_form_date_" + pickerID}
        hideKeyboardShortcutsPanel={true}
        numberOfMonths={1}
        showDefaultInputIcon={true}
        small={true}
        showClearDate={true}
        enableOutsideDays={false}
        isOutsideRange={() => { return false; }}
        displayFormat={"DD/MM/YYYY"}
        renderCalendarDay={({ modifiers, ...props }) => {
            return <CalendarDay modifiers={safeModifiers(modifiers)} {...props} />
        }}
    />;

    return (
        <React.Fragment>
            {options.label ? <div><label>{options.label}</label></div> : null}
            {datePicker}
        </React.Fragment>
    );
}

export default withFormField(FormFieldDate);