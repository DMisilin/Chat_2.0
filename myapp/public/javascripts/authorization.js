(() => {
    const $check = document.querySelector('.check');
    let $login = document.querySelector('.login');
    let $password = document.querySelector('.password');
    let $error = document.querySelector('.error');

    const ws = new WebSocket('ws://localhost:40509/pages/authorization.html');

    ws.onopen = () => {
        console.log(`Connected.`);

        $check.onclick = () => {
            if($login.value === '' || $password.value === '') {
                return $error.innerHTML = 'Please inter all data';
            }
            const loginValue = $login.value;
            const passwordValue = $password.value;
            const authMessage = {
                type: 'authorization',
                login: loginValue,
                password: passwordValue
            }
            ws.send(JSON.stringify(authMessage));
            console.log(authMessage);
        }
    };

    ws.onmessage = (event) => {
        const responce = JSON.parse(event.data);

        switch (responce.type) {
            case 'errorAuthorization': {
                $error.innerHTML = responce.body;
                $login.value = '';
                $password.value = '';
                console.log(responce.body);
                break;
            }
            case 'successAuthorization': {
                const userName = $login.value;
                document.location = `http://localhost:3000/pages/chat.html#${userName}`;
                break;
            }
        }
    }
})();
