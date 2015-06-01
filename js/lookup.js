$(document).on('ready', function(){
    var submitLookup = function(type, value){
        var sendData = {};
        sendData.type = 'uid';
        if(type == 'uid'){
            sendData.uid = value;
        }else{
            sendData.studentId = value;
        }
        $.ajax({
            url: 'http://library.itjesse.cn/API/Client/Lookup',
            type: 'get',
            data: sendData,
            dataType: 'json',
            success: function(res){
                if(res.error == '-1'){
                    $('#info').html('查询失败，请联系管理员');
                    setTimeout(function(){
                        $('#reset').click();
                    }, 3000);
                }
                else if(res.error == '-2'){
                    $('#info').html('用户不存在');
                    setTimeout(function(){
                        $('#reset').click();
                    }, 3000);
                }
                else{
                    $('#reset').click();
                    for(var i in res){
                        $('tbody').append('<tr><td>'+res[i].title+'</td><td>'+moment(res[i].lendTime).format('YYYY-MM-DD')+'</td><td>'+moment(res[i].lendTime).add(20, 'day').format('YYYY-MM-DD')+'</td></tr>');
                    }
                    $('#reset').removeClass('hidden');
                }
            }
        });
    };

    $('#reset').on('click', function(){
        $('tbody').html('');
        $('#info').html('请刷一卡通或二维码');
        $('#reset').addClass('hidden');
    });

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
        var barcodeScannerConn = backgroundPage.barcodeScannerConn;
        var nfcConn = backgroundPage.nfcConn;

        var stringReceived = '';

        var onReceiveCallback = function(info) {
            // console.log(info);
            var str = '';

            if (info.connectionId == barcodeScannerConn.connectionId && info.data) {
                str = String.fromCharCode.apply(null, new Uint8Array(info.data));
                if (str.charAt(str.length - 1) === '\n') {
                    stringReceived += str.substring(0, str.length - 1);
                    submitLookup('studentId', stringReceived);
                    stringReceived = '';
                } else {
                    stringReceived += str;
                }
            }

            if (info.connectionId == nfcConn.connectionId && info.data) {
                str = String.fromCharCode.apply(null, new Uint8Array(info.data));
                if (str.charAt(str.length - 1) === '\n') {
                    stringReceived += str.substring(0, str.length - 1);
                    submitLookup('uid', stringReceived);
                    // console.log(stringReceived);
                    stringReceived = '';
                } else {
                    stringReceived += str;
                }
            }
        };
        chrome.serial.onReceive.addListener(onReceiveCallback);
    });
});
