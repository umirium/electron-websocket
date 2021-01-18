/**
 * Connection / Communications with server
 */
let connection = null;
let connection_status = false;
let ip_address = 'localhost'; // edit by yours
let port = '3030'; // port

const Connect = {
    start: () => {
        connection = new WebSocket('ws://' + ip_address + ':' + port);

        connection.onopen = (e) => {
            connection_status = true;
            console.log("Connection established!");

            $('.window .title').html('Connected.');
        };

        // callback messages
        connection.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log(data);
        };

        // Closed window
        connection.onclose = (e) => {
            console.log("Connection closed!");
            connection_status = false;
        };

        // Error window
        connection.onerror = (e) => {
            console.log("Connection error!");
            connection_status = false;
        };
    },
    sendMessage: (data) => {
        if (connection_status === false) return;

        const data = JSON.stringify(data);
        connection.send(data);
    },
};
