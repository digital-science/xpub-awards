start = content:topLevel { return content; }

// ----- Base Types -----

begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws "," ws

ws "whitespace" = [ \t\n\r]*

value
  = false
  / null
  / true
  / number
  / string

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

// ----- Numbers -----

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point
  = "."

digit1_9
  = [1-9]

e
  = [eE]

exp
  = e (minus / plus)? DIGIT+

frac
  = decimal_point DIGIT+

int
  = zero / (digit1_9 DIGIT*)

minus
  = "-"

plus
  = "+"

zero
  = "0"

// ----- Strings -----

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

quotation_mark
  = '"'

unescaped
  = [^\0-\x1F\x22\x5C]

DIGIT  = [0-9]
HEXDIG = [0-9a-f]i


// ----- Property Object -----

properyObject = begin_object
					first:(name:propName name_separator value:value { return {n:name, v:value}; })
                    rest:(v:(name:propName name_separator value:value) { return {n:name, v:value}; } )*
				end_object
                {
                	var r = {};
                    if(first) {
                    	r[first.n] = first.v;
                    }
                    if(rest) {
                    	rest.forEach(function(a) {
                            r[a.n] = a.v;
                        });
                    }
                	return r;
                }

propertyList = values:(
		value_separator name:propName name_separator value:value
    	{return {n:name, v:value};}
    )*
	{
    	if(!values || !values.length) {
        	return null;
        }
    	const prop = {};
        values.forEach(f => {
        	prop[f.n] = f.v;
        });
        return prop;
    }



// ----- Special Types -----

propName "prop name"
  = first:[a-z_$]i rest:[a-z0–9_$]i* { return first + rest.join("") }

typeName "type name"
  = first:[a-z_$]i rest:[a-z0–9_$]i* { return first + rest.join("") }

targetModelName "target model property name"
  = first:[a-z_$]i rest:[a-z0–9_$]i* { return first + rest.join("") }


// ----- Top Level -----
topLevel = content:(task / model / enum)*
  {
  	    const m = {};

  		const tasks = content.filter(c => c.type === "task");
        if(tasks.length) {
        	const taskMap = {};

            tasks.forEach(task => {
            	delete task.type;
                if(task.name) {
                    taskMap[task.name] = task;
                }
            });

        	m.tasks = taskMap;
        }

  	    const models = content.filter(c => c.type === "model");
        if(models.length) {
        	const modelMap = {};

            models.forEach(model => {
            	delete model.type;
            	if(model.default) {
                	modelMap.default = model;
                } else if(model.name) {
                    modelMap[model.name] = model;
                }
            });

        	m.models = modelMap;
        }

        const enums = content.filter(c => c.type === "enum");
        if(enums.length) {
        	const enumMap = {};

            enums.forEach(e => {
            	delete e.type;
            	if(e.name) {
                    enumMap[e.name] = e;
                }
            });

        	m.enums = enumMap;
        }

		return m;
  }


// ----- Task -----

task
	= "task" ws taskName:propName ws? begin_object ws? content:taskContent ws? end_object
	{
      var m = {type:"task", name:taskName};

      if(content && content.length) {
        const options = content.filter(c => c.type === "options");
        if(options.length) {
			const opts = {};
            options.forEach(op => {
            	Object.assign(opts, op);
            });
            delete opts.type;
            m.options = opts;
		}


        const models = content.filter(c => c.type === "model");
        if(models.length) {
        	m.model = models[0];
        }

        const enums = content.filter(c => c.type === "enum");
        if(enums.length) {
        	const enumMap = {};

            enums.forEach(e => {
            	delete e.type;
            	if(e.name) {
                    enumMap[e.name] = e;
                }
            });

        	m.enums = enumMap;
        }

        const forms = content.filter(c => c.type === "form");
        if(forms.length) {
        	m.forms = forms.map(form => {
            	delete form.type;
            	return form;
            });
        }
      }
      return m;
    }

taskContent = (taskSpecificModel / enum / form / taskOptions)*

// Task options
taskOptions = ws "processKey" name_separator processKey:string? {return {type:"options", processKey}}


// ---- Enum ------
enum
	= ws "enum" ws enumName:propName
    begin_object
    first:enumValue?
    rest:("," ws v:enumValue {return v;})*
    end_object
    {
    	if(!first) {
            return {type:"enum", name:enumName};
        }
        const r = [first];
        if(rest && rest.length) {
        	r.push.apply(r, rest);
        }
    	return {type:"enum", name:enumName, values:r};
    }

enumValue = ws value:propName ws { return value;  }

// ----- Model -----

model
	= ws "model" ws isInput:("+" ws "input")? ws modelName:string? def:modelDefault? ws
    begin_object
    first:modelElement?
    rest:(ws "," ws e:modelElement {return e;})*
    end_object
    {
    	var m = {type:"model", };
        if(modelName) {
        	m.name = modelName;
        }
        if(isInput) {
        	m.input = true;
        }
        if(first) {
        	m.elements = [first];
            if(rest) {
                m.elements.push.apply(m.elements, rest);
            }
        }
        if(def === true) {
        	m.default = true;
        }
        return m;
    }

taskSpecificModel
	= ws "model" ws isInput:("+" ws "input")? ws modelName:string?
    begin_object
    first:modelElement?
    rest:(ws "," ws e:modelElement {return e;})*
    end_object
    {
    	var m = {type:"model", };
        if(modelName) {
        	m.name = modelName;
        }
        if(isInput) {
        	m.input = true;
        }
        if(first) {
        	m.elements = [first];
            if(rest) {
                m.elements.push.apply(m.elements, rest);
            }
        }
        return m;
    }

modelDefault
    = ws "default" ws
    {
    	return true;
    }

modelElement
	= fieldName:propName ws ":" ws type:modelTypeName ws details:modelElementDetails?
    {
    	var m = {field:fieldName, type:type.type};
        if(type.array) {
        	m.array = true;
        }

        if(details) {

          if(details.access && details.access.length) {
              m.access = details.access;
          }

          if(details.options) {
          	Object.assign(m, details.options);
          }
        }

        return m;
    }

modelTypeName = (modelArrayTypeName / modelBasicTypeName)

modelBasicTypeName
	= type:typeName { return {type:type}; }

modelArrayTypeName
	= "[" type:typeName "]"
    {
    	return {array:true, type:type};
    }

modelElementDetails
    = "<" first:modelElementDetailsType ws other:("," ws element:modelElementDetailsType {return element;})* ws ">" ws
    {
    	const parts = (other && other.length) ? [first, ...other] : [first];
        const access = parts.filter(t => t.type === "access");
        const options = parts.filter(t => t.type === "options");
    	const r = {};

        if(access) {
        	r.access = access.map(a => {
            	delete a.type;
            	return a;
            });
        }

        if(options) {
        	const o = {};
            const accessors = [];

            options.forEach(a => {
            	if(a.accessors) {
                	a.accessors.forEach(v => {
                    	if(accessors.indexOf(v) === -1) {
                        	accessors.push(v);
                        }
                    })
                }
            	Object.assign(o, a)
            });
            delete o.type;

            if(accessors.length) {
            	o.accessors = accessors;
            }

            r.options = o;
        }

        return r;
    }

modelElementDetailsType = (modelElementAccessDescription / modelElementOptions)

modelElementAccessDescription
	= ws role:propName ws ":" ws? access:modelElementAccessType ws
    {
    	return {type:"access", role:role, access:access};
    }

modelElementAccessType
	= type:("read-write" / "read" / "rw" / "r")
    {
    	return (type === "rw" || type === "read-write") ? "read-write" : "read";
    }

modelElementOptions = (modelElementExclusions / modelElementAccessors)

modelElementExclusions
	= "input:" inputExclusion:("exclude" / "include")
    {
    	// Is this model entity excluded from the "Input" type that
        // is auto generated. By default all items are included in the input
        // unless they are an array and then they needed to included via
        // input.

    	return {type:"options", input:(inputExclusion === "include")};
    }

modelElementAccessors
	= accessors:("add" / "remove")
    {
    	const r = {type:"options"};
    	if(accessors === "add") {
        	r.accessors = ["add"];
        } else if(accessors === "remove") {
        	r.accessors = ["remove"];
        }

    	return r;
    }

// ----- Form -----

form
	= ws? "form" ws formName:string extend:formExtends? ws begin_object content:formContent end_object ws?
    {
    	var m = {type:"form", form:formName};
        if(extend) {
        	m.extend = extend;
        }
        if(content.outcomes) {
        	m.outcomes = content.outcomes;
        }
        if(content.options && Object.keys(content.options).length) {
        	m.options = content.options;
        }
        if(content.elements) {
        	m.elements = content.elements;
        }
        return m;
    }

formExtends
    = ws "extend" ws ext:string
    {
    	return ext;
    }

formContent
	= content:(formOptions / formElements / formOutcomes)*
    {
    	const opts = content ? content.filter(t => t.type === "options") : null;
    	const outcomes = content ? content.filter(t => t.type === "outcomes") : null;
    	const elements = content ? content.filter(t => t.type === "elements" && t.elements.length) : null;
        const r = {};

        if(outcomes && outcomes.length) {
        	const consolidatedOutcomes = [];
        	outcomes.forEach(e => consolidatedOutcomes.push.apply(consolidatedOutcomes, e.outcomes));
            if(consolidatedOutcomes.length) {
            	r.outcomes = consolidatedOutcomes;
            }
        }

        if(opts && opts.length) {
        	const options = {};
        	opts.forEach(opt => Object.assign(options, opt.options));
            r.options = options;
        }

        if(elements && elements.length) {
        	const consolidatedElements = [];
        	elements.forEach(e => consolidatedElements.push.apply(consolidatedElements, e.elements));
            if(consolidatedElements.length) {
            	r.elements = consolidatedElements;
            }
        }
       	return r;
    }

formOptions
	= ws "options" name_separator options:properyObject
    {
    	return {type:"options", options};
    }

formOutcomes
	= ws "outcomes" name_separator
    begin_array
    first:formOutcome?
    rest:("," e:formOutcome {return e;})*
    end_array
    {
    	const r = {type:"outcomes"};
        if(first) {
        	const outcomes = [first];
            if(rest) {
            	outcomes.push.apply(outcomes, rest);
            }
            r.outcomes = outcomes;
        }
    	return r;
    }

formOutcome
	= begin_object
    type:string
    result:(ws "=>" ws result:propName {return result;})?
    propList:propertyList?
    end_object
    {
    	const r = {type:type};
        r.result = result || "Complete";
        if(propList) {
            Object.keys(propList).forEach(k => {
          	if(propList[k]) {
            	r[k] = propList[k];
            }
          });
        }
        return r;
    }

formElements
	= ws "elements" name_separator begin_object elements:(formElement)* end_object
    {
    	return {type:"elements", elements:elements};
    }

formElement
	= begin_object
    type:propName
    binding:formElementBinding?
    options:formElementExtendedOptions?
    end_object
    {
    	const r = {element:type};
       	if(binding) {
        	r.binding = binding;
        }
        if(options) {
        	if(options.children) {
            	r.children = options.children;
                delete options.children;
            }

            if(Object.keys(options).length) {
            	r.options = options;
            }
        }
        return r;
    }

formElementBinding
	= binding:formElementSimpleBinding

formElementSimpleBinding
	= (ws "=>" ws modelTarget:targetModelName {return modelTarget;})

formElementExtendedOptions
	= extendedOptions:(formElementChildren / formElementOption)*
    {
    	const children = [];
        const r = {};

        if(extendedOptions.length) {
        	extendedOptions.forEach(opt => {
            	if(opt.children) {
                	children.push.apply(children, opt.children);
                } else {
                	Object.assign(r, opt);
                }
            });
        }

        if(children.length) {
        	r.children = children;
        }

        return Object.keys(r).length ? r : null;
    }

formElementChildren
	= value_separator "children" name_separator begin_object elements:(formElement)* end_object
    {
    	return {children: elements}
    }

formElementOption
    = value_separator key:propName name_separator value:value
    {
    	const r = {};
        r[key] = value;
    	return r;
    }

