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

    const getInfoFromHash = (hash, paramName) => {
        const temp = hash.split('#');
        switch (paramName) {
            case 'user': {
                result = decodeURI(temp[1]);
                break;
            }
            case 'dialog': {
                result = decodeURI(temp[2]);
                break;
            }
        }
        return result;
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

    const params = new URL(document.location.href).searchParams;
    const login = params.get('user');
    const ws = new WebSocket(`ws://localhost:40509/pages/chat.html?user=${login}`);

    ws.onopen = () => {
        console.log('Welcome!');

        $createRoom.onclick = () => { //создание диалога (кнопки)
            let nameNewDialog = prompt(`Enter dialog title:`, 'New dialog');
            const $enamy = document.createElement('button');
            $enamy.innerText = nameNewDialog;
            $dialogsList.appendChild($enamy);

            console.log(`Created new dialog - ${nameNewDialog}`);
        }

        $forAll.onclick = () => {
            const hash = document.location.hash;
            document.location.hash = getInfoFromHash(hash, 'user') + '#' + $forAll.textContent;
            const message = {
                type: 'getHistory',
                dialog: $forAll.textContent
            }
            console.log(JSON.stringify(message));
            ws.send(JSON.stringify(message));
        }

        $test.onclick = () => {
            const hash = document.location.hash;
            document.location.hash = getInfoFromHash(hash, 'user') + '#' + $test.textContent;
            const message = {
                type: 'getHistory',
                dialog: $test.textContent
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
            const hash = document.location.hash;
            const userName = getInfoFromHash(hash, 'user');
            const dialog = getInfoFromHash(hash, 'dialog');
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
        const hash = document.location.hash;
        const dialog = getInfoFromHash(hash, 'dialog');
        const parsedMessage = JSON.parse(event.data);

        switch (parsedMessage.type) {
            case 'messageOk': {
                if (parsedMessage.dialog === dialog) {
                    let $newMessage = document.createElement('div');
                    $newMessage.innerText = parsedMessage.body;
                    $history.insertBefore($newMessage, $history.children[0]);
                }
            }
            case 'getHistory': {
                const history = parsedMessage.body.split('<br>');
                console.log(history);
                deleteAndAddHistory($history, history);
            }
        }
    }
})();
