(() => {
    const $createRoom = document.querySelector('.createRoom');
    const $inputText = document.querySelector('.inputText');
    const $sendMessage = document.querySelector('.sendMessage');
    const $dialogsList = document.querySelector('.dialogsList');
    const $history = document.querySelector('.history');
    const $errorText = document.querySelector('.errorText');
    //Кнопки
    const $forAll = document.querySelector('.forAll');
    const $test = document.querySelector('.test');
    
    const getValueFromURL = (param) => {
        const params = new URL(document.location.href).searchParams;
        return params.get(param);
    }
    
    const deleteAndAddHistory = (element, history) => {
        while ($history.firstChild) {
            $history.removeChild($history.firstChild);
        }
        history.forEach((item) => {
            const $message = document.createElement('div');
            $message.innerText = item;
            $history.insertBefore($message, $history.children[0]);
            console.log(item);
        });
    } 
    
    const login = getValueFromURL('user');    
    const ws = new WebSocket(`ws://localhost:40509/pages/chat.html?user=${login}`);

    const click = (dialogName) => {
        console.log(`onlick to - ${dialogName}`);
        localStorage.setItem('dialogName', dialogName);
        const message = {
            type: 'getHistory',
            dialog: dialogName
        }
        console.log(JSON.stringify(message));
        ws.send(JSON.stringify(message));
    }

    ws.onopen = () => {
        console.log('Welcome!');

        $createRoom.onclick = () => { //создание диалога (кнопки)
            let nameNewDialog = prompt(`Enter dialog title:`, 'New dialog');
            const $enamy = document.createElement('button');
            $enamy.innerText = nameNewDialog;
            $dialogsList.appendChild($enamy);

            $enamy.onclick = () => click(nameNewDialog);

            console.log(`Created new dialog - "${nameNewDialog}"`);
        }

        $forAll.onclick = () => {
            localStorage.setItem('dialogName', `${$forAll.textContent}`);
            const message = {
                type: 'getHistory',
                dialog: $forAll.textContent
            }
            console.log(JSON.stringify(message));
            ws.send(JSON.stringify(message));
        }

        $sendMessage.onclick = () => { //отправка сообщения
            if ($inputText.value === '') {
                $errorText.innerText = `Please inter text message`;
                $inputText.value = '';
            }
            if ($errorText.innerText != '') {
                $errorText.innerText = '';
            }; //очистка сообщения об ошибке, если оно было
            const userName = getValueFromURL('user');
            const dialog = localStorage.getItem('dialogName');
            const date = new Date;
            const message = {
                type: 'userMessage',
                from: userName,
                dialog: dialog,
                text: $inputText.value,
                date: date
            }
            ws.send(JSON.stringify(message));
            $inputText.value = '';
            console.log(JSON.stringify(message));
        }
    }

    ws.onmessage = (event) => {
        const dialog = localStorage.getItem('dialogName');
        const parsedMessage = JSON.parse(event.data);

        switch (parsedMessage.type) {
            case 'messageOk': {
                if (parsedMessage.dialog === dialog) {
                    let $newMessage = document.createElement('div');
                    $newMessage.innerText = parsedMessage.body;
                    $history.insertBefore($newMessage, $history.children[0]);
                }
                break;
            }
            case 'getHistory': {
                const history = parsedMessage.body.split('<br>');
                console.log(history);
                deleteAndAddHistory($history, history);
                break;
            }
            case 'apdateUsersList': {
                const users = parsedMessage.body.split();
            }
        }
    }
})();
