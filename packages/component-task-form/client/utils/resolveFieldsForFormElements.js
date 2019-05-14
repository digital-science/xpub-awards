import FieldRegistry from './../components/registry';


export default function resolveFieldsForFormElements(elements, registry=FieldRegistry) {

    const fetchFields = {};
    const topLevelFields = {};

    if(!elements || !elements.length) {
        return [];
    }

    function _addToFieldSet(set, v) {
        if(!v) {
            return;
        }
        if(v instanceof Array) {
            v.forEach(vv => set[vv] = true);
        } else {
            set[v] = true;
        }
    }

    function addToFetchFields(v) {
        _addToFieldSet(fetchFields, v);
    }

    function addToTopLevelFields(v) {
        _addToFieldSet(topLevelFields, v);
    }

    // NOTE: this current solution doesn't resolve multiple levels of fields on the same top level field being requested etc.
    // we would need to merge these down to get a fully merged data set

    const _resolveForElements = function(elements) {

        elements.forEach(e => {

            const component = registry[e.type];

            if(component && component.bindingResolver) {
                const field = component.bindingResolver(e);

                if(typeof field === "string") {
                    addToFetchFields(field);
                    addToTopLevelFields(field);
                } else if(field) {
                    addToFetchFields(field.fetch);
                    addToTopLevelFields(field.topLevel);
                }
            }

            // Recurse on child elements.
            if(e.children && e.children.length) {
                _resolveForElements(e.children);
            }
        });
    };

    _resolveForElements(elements);

    return {fetchFields:Object.keys(fetchFields), topLevelFields:Object.keys(topLevelFields)};
}