exports.mergeResolvers = function _mergeResolvers(target, source) {

    if(!source) {
        return target;
    }

    Object.keys(source).forEach(key => {
        const dest = target[key] || {};
        Object.assign(dest, source[key]);
        target[key] = dest;
    });

    return target;
};



// FIXME: this should be more generalised into a generic lookup table or something of that sort of nature (this current impl smells a little)
const BaseElementTypes = ['String', 'Integer', 'ID', 'DateTime'];


exports.filterModelElementsForRelations = function _filterModelElementsForRelations(elements, enums) {

    return elements.filter(element => {

        if(BaseElementTypes.indexOf(element.type) !== -1) {
            return false;
        }
        return !enums.hasOwnProperty(element.type);
    });
};


exports.filterModelElementsForBasicTypes = function _filterModelElementsForRelations(elements, enums) {

    return elements.filter(element => {
        return (BaseElementTypes.indexOf(element.type) !== -1 || enums.hasOwnProperty(element.type));
    });
};