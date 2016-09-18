$(document).on('ready', function(){
  var tagList = [];
  var noTagFlag = 1;
  var returnForbidFlag = 0;

  var checkNoTagTimer = setInterval(function(){
    if(noTagFlag){
      $('#reset').click();
    }
  }, 3000);

  var getTagInfo = function(tagId){
    $.ajax({
      url: 'http://library.itjesse.cn/API/Client/GetTagInfo',
      type: 'get',
      data: 'tagId='+tagId,
      dataType: 'json',
      success: function(res){
        if(res.error != '-1'){
          $('tbody').append('<tr><td>'+res.info.title+'</td><td>'+res.info.author+'</td><td>'+res.info.isbn+'</td><td>'+res.info.publisher+'</td></tr>');
          $('#reset').removeClass('hidden');
          $('#submit').removeClass('hidden');
        }
      }
    });
  };

  var submitReturn = function(type, value){
    if(!returnForbidFlag && tagList.length > 0){
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
        url: 'http://library.itjesse.cn/API/Client/ReturnBook',
        type: 'post',
        data: sendData,
        success: function(res){
          if(res == '-1'){
            layer.alert('归还失败，请联系管理员');
            $('#reset').click();
          }
          else{
            layer.alert('归还成功', 1);
            $('#info').html('请取走书籍');
            returnForbidFlag = 1;
          }
        }
      });
    }
  };

  $('#reset').on('click', function(){
    tagList = [];
    $('tbody').html('');
    $('#info').html('请放置需归还的书籍');
    $('#reset').addClass('hidden');
    $('#submit').addClass('hidden');
    returnForbidFlag = 0;
  });

  $('#submit').on('click', function(){
    submitReturn();
  });

  chrome.runtime.getBackgroundPage(function(backgroundPage) {
    var tagScannerConn = backgroundPage.tagScannerConn;

    var dataArray = [];
    var lastReceiveTime;

    var type;
    var status = 0;

    var onReceiveCallback = function(info) {
      // console.log(info);
      var str = '';

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
