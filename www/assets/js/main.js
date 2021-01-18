
$(() => {
   Connect.start();
});

$('.window .js-send-action').on('click', (e) => {
    e.preventDefault();

    Connect.sendMessage({
        'message': e.target.value
    });
});
