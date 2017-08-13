// Code for accessing the DOM and setting up structure
window.onload = function loadContents() {

  var containerDiv = document.createElement('div');
  var mainHeader = document.createElement('h1');
  var mainHeaderText = document.createTextNode('Frequently Asked Questions');
  containerDiv.setAttribute('class', 'container');
  document.body.appendChild(containerDiv);
  containerDiv.appendChild(mainHeader);
  mainHeader.appendChild(mainHeaderText);

  var p1 = document.createElement('p');
  var p1Text = document.createTextNode('You can either type your question and press enter, or click on \'Speak\' to talk to the chatbot.')
  var p2 = document.createElement('p');
  var p2Text = document.createTextNode('Speech recognition only works on Chrome, and you will need your microphone turned on.');
  containerDiv.appendChild(p1);
  containerDiv.appendChild(p2);
  p1.appendChild(p1Text);
  p2.appendChild(p2Text);

  var inputBox = document.createElement('input');
  inputBox.setAttribute('id', 'speech');
  inputBox.setAttribute('type', 'text');
  containerDiv.appendChild(inputBox);

  var speakButton = document.createElement('button');
  speakButton.setAttribute('id', 'rec');
  speakButton.setAttribute('class', 'btn');
  var speakButtonText = document.createTextNode('Speak');
  speakButton.appendChild(speakButtonText);
  console.log(speakButton);
  containerDiv.appendChild(speakButton);

  var responseDiv = document.createElement('div');
  responseDiv.setAttribute('id', 'spokenResponse');
  responseDiv.setAttribute('class', 'spoken-response');
  var responseDivText = document.createElement('div');
  responseDivText.setAttribute('class', 'spoken-response_text');
  responseDiv.appendChild(responseDivText);

  var googleLink = document.createElement('link');
  googleLink.setAttribute('href', 'https://fonts.googleapis.com/css?family=Titillium+Web:200');
  googleLink.setAttribute('rel', 'stylesheet');
  googleLink.setAttribute('type', 'text/css');
  document.body.appendChild(googleLink);

}


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
      $('#spokenResponse').addClass('is-active').find('.spoken-response__text').html(val);
    }
