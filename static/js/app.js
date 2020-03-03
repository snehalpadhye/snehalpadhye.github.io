// Set constraints for the video stream
var constraints = { video: { facingMode: "back" }, audio: false };

// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      saveTrigger = document.querySelector("#save--trigger")

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error) {
        console.error("Oops. Something is broken.", error);
    });
}

// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL("image/jpeg");
    cameraOutput.classList.add("taken");
    $.ajax({
        type: "POST",
        url: '{{ form_fields["post_url"] }}',
        data: { imgBase64:cameraOutput.src},
        success: function() {
            console.log("POST Successful");
            console.log('{{ form_fields["next_page"] }}');
            console.log('{{ form_fields["post_url"] }}');
            window.location.href = '{{ form_fields["next_page"] }}';
        },
        fail: function(e) {
            console.log("sending failed, error: " + e);
            console.log('form_fields["next_page"]');
            console.log('form_fields["post_url"]');
        }
    });
};

// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);

saveTrigger.onclick = function(){
    $.ajax({
        type: "POST",
        url: '{{ form_fields["post_url"] }}',
        data: cameraOutput.src,
        success: function() {
            console.log("POST Successful");
            console.log('{{ form_fields["next_page"] }}');
            console.log('{{ form_fields["post_url"] }}');
            window.location.href = '{{ form_fields["next_page"] }}';
        },
        fail: function(e) {
            console.log("sending failed, error: " + e);
            console.log('form_fields["next_page"]');
            console.log('form_fields["post_url"]');
        }
    });
    //return false;
};
