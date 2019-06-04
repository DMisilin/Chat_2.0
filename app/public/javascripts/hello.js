(() => {
    const $haveAccount = document.querySelector('.haveAccount');
    const $createAccount = document.querySelector('.createAccount');
    
    $createAccount.onclick = () => {
        window.location = 'http://localhost:3000/pages/registration.html?login=systemuser&chat=systemchat';
    }
    
    $haveAccount.onclick = () => {
        window.location = 'http://localhost:3000/pages/authorization.html?login=systemuser&chat=systemchat';
    }
})();
