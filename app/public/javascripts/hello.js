(() => {
    const $haveAccount = document.querySelector('.haveAccount');
    const $createAccount = document.querySelector('.createAccount');
    
    $createAccount.onclick = () => {
        window.location = 'http://localhost:3000/pages/registration.html?login=null&chat=null';
    }
    
    $haveAccount.onclick = () => {
        window.location = 'http://localhost:3000/pages/authorization.html?login=null&chat=null';
    }
})();
