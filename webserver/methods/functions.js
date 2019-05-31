const getValueFromURL = (param, url) => {
    const params = url.split('&');
    switch (param) {
        case 'login': return params[0].replace('login=', '');
        case 'chat': return params[1].replace('chat=', '');
    }
}

module.exports.getValueFromURL = getValueFromURL;
