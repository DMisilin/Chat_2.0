(() => {
    const $haveAccount = document.querySelector('.haveAccount');
    const $createAccount = document.querySelector('.createAccount');
    
    $createAccount.onclick = () => {
        window.location = 'http://localhost:3000/pages/registration.html';
    }
    
    $haveAccount.onclick = () => {
        window.location = 'http://localhost:3000/pages/authorization.html';
    }
})();
