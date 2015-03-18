var sendTimer;
var barcodeScannerConn, tagScannerConn, nfcConn;

var initSerialport = function(){
    var err = function(){
        chrome.app.window.create('setting.html#setting', {
            'id': 'setting',
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
        var list = chrome.app.window.getAll();
        for(var i in list){
            if(list[i].id != 'setting')
                list[i].close();
        }
    };

    chrome.storage.local.get(['nfcCom', 'barcodeScannerCom', 'tagScannerCom'], function(data) {
        if (chrome.runtime.lastError) return err();

        chrome.serial.connect(data.nfcCom, {
            bitrate: 9600
        }, function(connectionInfo) {
            // console.log(connectionInfo);
            if (chrome.runtime.lastError) return err();
            nfcConn = connectionInfo;
        });

        chrome.serial.connect(data.barcodeScannerCom, {
            bitrate: 9600
        }, function(connectionInfo) {
            // console.log(connectionInfo);
            if (chrome.runtime.lastError) return err();
            barcodeScannerConn = connectionInfo;
        });

        chrome.serial.connect(data.tagScannerCom, {
            bitrate: 115200
        }, function(connectionInfo) {
            // console.log(connectionInfo);
            if (chrome.runtime.lastError) return err();
            tagScannerConn = connectionInfo;
            var sendData = new ArrayBuffer(3);
            var bufView = new Uint8Array(sendData);
            bufView[0] = parseInt(0x31, 10);
            bufView[1] = parseInt(0x03, 10);
            bufView[2] = parseInt(0x01, 10);
            sendTimer = setInterval(function() {
                chrome.serial.send(tagScannerConn.connectionId, sendData, function(sendInfo) {
                    // console.log(sendData);
                });
            }, 200);
        });
    });
};

chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
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

    initSerialport();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    if(request == 'reinit serialport'){
        clearInterval(sendTimer);
        chrome.serial.disconnect(barcodeScannerConn.connectionId, function(result){
            console.log(result);
            chrome.serial.disconnect(tagScannerConn.connectionId, function(result){
                console.log(result);
                chrome.serial.disconnect(nfcConn.connectionId, function(result){
                    console.log(result);
                    initSerialport();
                });
            });
        });
    }
});
