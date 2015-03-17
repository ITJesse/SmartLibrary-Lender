$(document).on('ready', function() {
    var getComList = function() {
        chrome.serial.getDevices(function(ports) {
            $('select').html('<option value="">选择串口</option>');
            for (var i in ports) {
                if (ports[i].path.indexOf('Bluetooth') == -1 && ports[i].path.indexOf('tty') == -1)
                    $('select').append('<option value="' + ports[i].path + '">' + ports[i].path + '</option>');
            }
            chrome.storage.local.get(['barcodeScannerCom', 'tagScannerCom', 'nfcCom'], function(data) {
                $('#barcodeScanner').val(data.barcodeScannerCom);
                $('#tagScanner').val(data.tagScannerCom);
                $('#nfc').val(data.nfcCom);
            });
        });
    };

    getComList();

    $('#refresh').on('click', function() {
        getComList();
    });

    $('#save').on('click', function() {
        var barcodeScannerCom = $('#barcodeScanner').val();
        var tagScannerCom = $('#tagScanner').val();
        var nfcCom = $('#nfc').val();

        chrome.storage.local.set({
            'barcodeScannerCom': barcodeScannerCom,
            'tagScannerCom': tagScannerCom,
            'nfcCom': nfcCom
        }, function() {
            layer.alert('设置已保存', 1);
            chrome.runtime.sendMessage(null, 'reinit serialport');
        });
    });
});
