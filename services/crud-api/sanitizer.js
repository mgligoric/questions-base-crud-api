
function sanitizeString(str){
    if(str != null && str != '' && str.length > 1 && str.trim().length > 1){
        return str.trim()
    }
    else{
        return null
    }
}

module.exports.sanitizeString = sanitizeString