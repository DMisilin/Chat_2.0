const getInfoFromHash = (hash, paramName) => {
    const temp = hash.split('#');
    let result = '';

    switch(paramName) {
        case 'user': {
            result = temp[1].substr(0,4);
        }
        case 'dialog': {
            result = temp[2].substr(0,6);
        }
    }
    return result;
}

module.exports = { getInfoFromHash }