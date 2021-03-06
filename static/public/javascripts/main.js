(() => {
    const $createRoom = document.querySelector('.createRoom');
    const $inputText = document.querySelector('.inputText');
    const $sendMessage = document.querySelector('.sendMessage');
    const $chatList = document.querySelector('.chatList');
    const $history = document.querySelector('.history');
    const $errorText = document.querySelector('.errorText');
    const $usersList = document.querySelector('.userslist');

    const getValueFromURL = (param) => {
        const params = new URL(document.location.href).searchParams;
        return params.get(param);
    };
    const deleteAndAddHistory = (history) => {
        while ($history.firstChild) {
            $history.removeChild($history.firstChild);
        }
        history.forEach((item) => {
            const $message = document.createElement('div');
            $message.innerText = item;
            $history.insertBefore($message, $history.children[0]);
        });
    };
    const inviteUserInChat = (from, to) => {
        const message = {
            type: 'inviteUser',
            from: from,
            to: to,
            chat_id: getValueFromURL('chat_id')
        }
        ws.send(JSON.stringify(message));
        console.log(JSON.stringify(message));
        console.log(`Invate user "${message.to}" in the "${message.chat}"`);
    };
    const apdateActiveUsersList = (list) => {
        console.log(list);
        const from = getValueFromURL('login');
        while ($usersList.firstChild) {
            $usersList.removeChild($usersList.firstChild);
        }
        list.forEach((item) => {
            if (item != from) {//не выводим юзеру самого себя

                const $user = document.createElement('button');
                $user.innerText = item;

                $user.onclick = () => inviteUserInChat(from, item);
                $usersList.insertBefore($user, $usersList.children[0]);
            }
        });
    };

    const login = getValueFromURL('login');
    const chat_id = getValueFromURL('chat_id');
    const ws = new WebSocket(`ws://localhost:40509/pages/chat.html?login=${login}&chat_id=${chat_id}`);

    const click = (chat_id) => {
        console.log(`onlick to - ${chat_id}`);
        history.pushState({}, null, `chat.html?login=${login}&chat_id=${chat_id}`);

        const message = {
            type: 'getHistory',
            login: login,
            chat_id: chat_id
        }
        console.log(JSON.stringify(message));
        ws.send(JSON.stringify(message));
    };
    const apdateActiveChats = (chats) => {
        while ($chatList.firstChild) {
            $chatList.removeChild($chatList.firstChild);
        }
        chats.forEach((chat) =>  {
            const $chat = document.createElement('button');
            $chat.innerText = chat.chat_label;
            $chat.onclick = () => click(chat.chat_id);
            $chatList.appendChild($chat);
        });
    };

    ws.onopen = () => {
        console.log('Welcome!');
        ws.send(JSON.stringify({ type: 'getActiveChats' }))

        $createRoom.onclick = () => { //создание диалога (кнопки)
            const nameNewChat = prompt(`Enter chat title:`, 'New_chat');

            console.log(`Created new dialog - "${nameNewChat}"`);
            const message = {
                type: 'createChat',
                chatLabel: nameNewChat,
                creator: login
            }
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
            const login = getValueFromURL('login');
            const chat_id = getValueFromURL('chat_id');
            const message = {
                type: 'userMessage',
                from: login,
                chat_id: chat_id,
                text: $inputText.value,
                login: login
            }
            console.log('S E N G ===>');
            console.log(message);
            ws.send(JSON.stringify(message));
            $inputText.value = '';
        }
    };

    ws.onmessage = (event) => {
        const chat_id = getValueFromURL('chat_id');
        const parsedMessage = JSON.parse(event.data);
        console.log('I N C O M E == JSON.parse(event.data)');
        console.log(JSON.parse(event.data));

        switch (parsedMessage.type) {
            case 'messageOk': {
                console.log(parsedMessage.chat_id);
                console.log(chat_id);
                if (parsedMessage.chat_id === chat_id) {
                    let $newMessage = document.createElement('div');
                    $newMessage.innerText = parsedMessage.body;
                    $history.insertBefore($newMessage, $history.children[0]);
                }
                break;
            }
            case 'getHistory': {
                const history = parsedMessage.body.split('<br>');
                deleteAndAddHistory(history);
                break;
            }
            case 'updateActiveUsersList': {
                const users = parsedMessage.body.split(', ');
                apdateActiveUsersList(users);
                console.log(parsedMessage.body);
                break;
            }
            case 'getActiveChats': {
                apdateActiveChats(parsedMessage.chats);
                console.log(`IN - 'getActiveChats'`);
                console.log(parsedMessage.chats);
                break;
            }
            case 'Invite': {
                const invite = confirm(`${parsedMessage.from} invite you in - "${parsedMessage.chat}"`);
                let result = 0;
                if (invite) {
                    result = 1; //Принято
                    const $enamy = document.createElement('button');
                    $enamy.innerText = parsedMessage.chat;
                    $enamy.onclick = () => click(parsedMessage.chat);
                    $chatList.appendChild($enamy);
                } else {
                    result = 2; //Отклонено
                }
                const message = {
                    type: 'responceToInvite',
                    chat: parsedMessage.chat,
                    result: result,
                    from: parsedMessage.from,
                    to: parsedMessage.to
                }
                ws.send(JSON.stringify(message));
                break;
            }
            case 'RejectInvate': {
                alert(`User "${parsedMessage.to}" rejact your invite in "${parsedMessage.chat}"`);
            }
        }
    };
})();
