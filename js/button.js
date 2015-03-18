$(document).on('ready', function() {

    var mark = window.location.href.split('#');
    $('[id=' + mark[1] + ']').parent().addClass('active');

    var title = '';
    switch (mark[1]) {
        case 'lend':
            title = '借书';
            break;
        case 'return':
            title = '还书';
            break;
        case 'setting':
            title = '串口设置';
            break;
        default:
            title = '智慧图书馆';
    }
    $('#title').text(title);

    // $("#record").on('click', function() {
    //     chrome.app.window.create('record.html#record', {
    //         'id': 'record',
    //         'innerBounds': {
    //             'width': 800,
    //             'height': 600,
    //             'maxWidth': 800,
    //             'maxHeight': 600,
    //             'minWidth': 800,
    //             'minHeight': 600
    //         },
    //         resizable: false,
    //         frame: 'none'
    //     });
    //     chrome.app.window.current().close();
    // });
    //
    // $("#manage").on('click', function() {
    //     chrome.app.window.create('manage.html#manage', {
    //         'id': 'mamage',
    //         'innerBounds': {
    //             'width': 800,
    //             'height': 600,
    //             'maxWidth': 800,
    //             'maxHeight': 600,
    //             'minWidth': 800,
    //             'minHeight': 600
    //         },
    //         resizable: false,
    //         frame: 'none'
    //     });
    //     chrome.app.window.current().close();
    // });
    //
    // $("#setting").on('click', function() {
    //     chrome.app.window.create('setting.html#setting', {
    //         'id': 'setting',
    //         'innerBounds': {
    //             'width': 800,
    //             'height': 600,
    //             'maxWidth': 800,
    //             'maxHeight': 600,
    //             'minWidth': 800,
    //             'minHeight': 600
    //         },
    //         resizable: false,
    //         frame: 'none'
    //     });
    //     chrome.app.window.current().close();
    // });
    //
    // $("#bind").on('click', function() {
    //     chrome.app.window.create('bind.html#bind', {
    //         'id': 'bind',
    //         'innerBounds': {
    //             'width': 800,
    //             'height': 600,
    //             'maxWidth': 800,
    //             'maxHeight': 600,
    //             'minWidth': 800,
    //             'minHeight': 600
    //         },
    //         resizable: false,
    //         frame: 'none'
    //     });
    //     chrome.app.window.current().close();
    // });

    $('#lend,#return,#setting,#lookup').on('click', function() {
        var id = $(this).attr('id');
        if (!chrome.app.window.get(id)) {
            chrome.app.window.create(id + '.html#' + id, {
                'id': id,
                'innerBounds': {
                    'width': 800,
                    'height': 600,
                    'maxWidth': 800,
                    'maxHeight': 600,
                    'minWidth': 800,
                    'minHeight': 600
                },
                resizable: false,
                frame: 'none'
            });
            chrome.app.window.current().close();
        }
    });

    $("#exit").on('click', function() {
        chrome.app.window.current().close();
    });
});
