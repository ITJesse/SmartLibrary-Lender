$(document).on('ready', function(){
    var tagList = [];
    var noTagFlag = 1;
    var lendForbidFlag = 0;

    var checkNoTagTimer = setInterval(function(){
        if(noTagFlag){
            $('#reset').click();
        }
    }, 3000);

    var checkAmountTimer = setInterval(function(){
        if(tagList.length > 5){
            $('#info').html('一次性最多借阅5本书');
            lendForbidFlag = 1;
        }
    }, 1000);

    var getTagInfo = function(tagId){
        $.ajax({
            url: 'http://192.168.1.204:3000/API/Client/GetTagInfo',
            type: 'get',
            data: 'tagId='+tagId,
            dataType: 'json',
            success: function(res){
                if(res.error != '-1'){
                    $('tbody').append('<tr><td>'+res.info.title+'</td><td>'+res.info.author+'</td><td>'+res.info.isbn+'</td><td>'+res.info.publisher+'</td></tr>');
                    $('#info').html('请刷一卡通或二维码确认');
                    $('#reset').removeClass('hidden');
                }else{
                    tagList.splice(tagList.indexOf(tagId), 1);
                }
            }
        });
    };

    var submitLend = function(type, value){
        if(!lendForbidFlag && tagList.length > 0){
            var sendData = {};
            sendData.type = 'uid';
            if(type == 'uid'){
                sendData.uid = value;
            }else{
                sendData.studentId = value;
            }
            var tagId = '';
            for(var i in tagList){
                tagId += tagList[i] + ',';
            }
            tagId = tagId.substring(0, tagId.length - 1);
            sendData.tagList = tagId;
            $.ajax({
                url: 'http://192.168.1.204:3000/API/Client/LendBook',
                type: 'post',
                data: sendData,
                dataType: 'json',
                success: function(res){
                    if(res.error == '-3'){
                        layer.alert('借书总数不得超过5本');
                        $('#reset').click();
                    }
                    else if(res.error == '-2'){
                        layer.alert('一卡通无效或用户不存在');
                        $('#reset').click();
                    }
                    else if(res.error == '-1'){
                        layer.alert('借阅失败，请联系管理员', 8, function(){
                            $('#reset').click();
                        });
                    }
                    else{
                        layer.alert('借阅成功', 1);
                        $('#info').html('请取走书籍');
                        lendForbidFlag = 1;
                    }
                }
            });
        }
    };

    $('#reset').on('click', function(){
        tagList = [];
        $('tbody').html('');
        $('#info').html('请放置需借阅的书籍');
        $('#reset').addClass('hidden');
        lendForbidFlag = 0;
    });

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
        var barcodeScannerConn = backgroundPage.barcodeScannerConn;
        var tagScannerConn = backgroundPage.tagScannerConn;
        var nfcConn = backgroundPage.nfcConn;

        var stringReceived = '';
        var dataArray = [];
        var lastReceiveTime;
        var lastTagId = '';

        var type;
        var status = 0;

        var onReceiveCallback = function(info) {
            // console.log(info);
            var str = '';

            if (info.connectionId == barcodeScannerConn.connectionId && info.data) {
                str = String.fromCharCode.apply(null, new Uint8Array(info.data));
                if (str.charAt(str.length - 1) === '\n') {
                    stringReceived += str.substring(0, str.length - 1);
                    submitLend('studentId', stringReceived);
                    stringReceived = '';
                } else {
                    stringReceived += str;
                }
            }

            if (info.connectionId == nfcConn.connectionId && info.data) {
                str = String.fromCharCode.apply(null, new Uint8Array(info.data));
                if (str.charAt(str.length - 1) === '\n') {
                    stringReceived += str.substring(0, str.length - 1);
                    submitLend('uid', stringReceived);
                    console.log(stringReceived);
                    stringReceived = '';
                } else {
                    stringReceived += str;
                }
            }

            if (info.connectionId == tagScannerConn.connectionId && info.data) {
                if ((new Date()).valueOf() - lastReceiveTime > 100) {
                    // console.log(dataArray);
                    if(dataArray[0] == parseInt(0x32, 10) && dataArray[2] > 0){
                        type = 1;
                        noTagFlag = 0;
                        var tagCount = dataArray[2];
                        if(/^[0-9]*[1-9][0-9]*$/.test(dataArray.length / tagCount)){
                            for(var i=0; i<tagCount; i++){
                                var tag = [];
                                for(var j=i*18+7; j<(i+1)*18; j++){
                                    tag.push(dataArray[j]);
                                }
                                var tagId = '';
                                for(var k in tag){
                                    var tmp = tag[k].toString(16);
                                    if(tmp.length < 2)
                                        tmp = '0' + tmp;
                                    tagId += tmp;
                                }
                                if(tagList.indexOf(tagId) == -1){
                                    tagList.push(tagId);
                                    // console.log(tagList);
                                    getTagInfo(tagId);
                                }
                            }
                        }
                    }

                    if(dataArray[0] == parseInt(0x32, 10) && dataArray[1] == parseInt(0x04, 10)){
                        if(type == 3 && status > 3){
                            noTagFlag = 1;
                        }
                        else if(type == 3 && status <= 3){
                            status ++;
                        }
                        else if(type != 3){
                            status = 1;
                            type = 3;
                        }
                    }

                    dataArray = [];

                }
                var bufView = new Uint8Array(info.data);
                for (var a in bufView) {
                    // console.log(bufView[i]);
                    dataArray.push(bufView[a]);
                    lastReceiveTime = (new Date()).valueOf();
                }
            }
        };
        chrome.serial.onReceive.addListener(onReceiveCallback);
    });
});
