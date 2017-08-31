// Code for accessing the DOM and setting up structure
window.onload = function() {

  var mainContentDiv = document.createElement('div');
  mainContentDiv.setAttribute('id', 'mainContent');
  document.body.appendChild(mainContentDiv);

  mainContentDiv.innerHTML = '<div class="container"><h1>Frequently Asked Questions</h1><p>You can either type your question and press enter, or click on "Speak" to talk to the chatbot.</p><p>Speech recognition only works on Chrome, and you will need your microphone turned on.</p><input id="speech" type="text"><button id="rec" class="btn">Speak</button><div id="spokenResponse" class="spoken-response"><div class="spoken-response__text"></div></div></div>';

  console.log(mainContentDiv);


// Code for accessing speech recognition and api.ai chatbot

var accessToken = '297ec2a08f584ea9b1c7c8a870520b29',
      baseUrl = 'https://api.api.ai/v1/',
      $speechInput,
      $recBtn,
      recognition,
      messageRecording = 'Recording...',
      messageCouldntHear = 'I couldn\'t hear you, could you say that again?',
      messageInternalError = 'Oh no, there has been an internal server error',
      messageSorry = 'I\'m sorry, I don\'t have the answer to that yet.';
    $(document).ready(function() {
      $speechInput = $('#speech');
      $recBtn = $('#rec');
      $speechInput.keypress(function(event) {
        if (event.which == 13) {
          event.preventDefault();
          send();
        }
      });
      $recBtn.on('click', function(event) {
        switchRecognition();
      });
      $('.debug__btn').on('click', function() {
        $(this).next().toggleClass('is-active');
        return false;
      });
    });
    function startRecognition() {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = function(event) {
        respond(messageRecording);
        updateRec();
      };
      recognition.onresult = function(event) {
        recognition.onend = null;
        var text = '';
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setInput(text);
        stopRecognition();
      };
      recognition.onend = function() {
        respond(messageCouldntHear);
        stopRecognition();
      };
      recognition.lang = 'en-US';
      recognition.pitch= '2';
      recognition.volume='0';
      recognition.start();
    }

    function stopRecognition() {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
      updateRec();
    }
    function switchRecognition() {
      if (recognition) {
        stopRecognition();
      } else {
        startRecognition();
      }
    }
    function setInput(text) {
      $speechInput.val(text);
      send();
    }
    function updateRec() {
      $recBtn.text(recognition ? 'Stop' : 'Speak');
    }
    function send() {
      var text = $speechInput.val();
      $.ajax({
        type: 'POST',
        url: baseUrl + 'query',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        data: JSON.stringify({query: text, lang: 'en', sessionId: 'yaydevdiner'}),
        success: function(data) {
          prepareResponse(data);
        },
        error: function() {
          respond(messageInternalError);
        }
      });
    }
    function prepareResponse(val) {
      var debugJSON = JSON.stringify(val, undefined, 2),
        spokenResponse = val.result.speech;
      respond(spokenResponse);
      debugRespond(debugJSON);
    }
    function debugRespond(val) {
      $('#response').text(val);
    }
    function respond(val) {
      if (val == '') {
        val = messageSorry;
      }
      if (val !== messageRecording) {
        var msg = new SpeechSynthesisUtterance();
        msg.voiceURI = 'native';
        msg.text = val;
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
      }
      $('#spokenResponse').addClass('is-active').find('.spoken-response__text').html(val);}
}
