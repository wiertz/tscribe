//
// INITIALIZE
//

var speaker;

initTranscript = function (override = false) {
    if (transcript.value.length < 5 || override) {
        speaker = interviewer;
        speakerString = `${speaker.value}: `;
        transcript.value = speakerString + '\n'.repeat(30);
        transcript.focus();
        transcript.setSelectionRange(speakerString.length, speakerString.length);
    }
}

// enable restore/delete snapshot buttons if local storage exists
document.addEventListener('DOMContentLoaded', function (event) {
    if (hasStorage && localStorage.tscribe) {
        restoreSnapshot.disabled = false;
        deleteSnapshot.disabled = false;
    } else if (!hasStorage) {
        restoreSnapshot.classList.add('hidden');
        deleteSnapshot.classList.add('hidden');
        restoreSnapshot.parentNode.innerText = '(no support by browser)'
    };
});


//
// ERROR MESSAGES
//
const errorDiv = document.querySelector('div.error');
const errorMsg = document.querySelector('div.error-message');
const transcriptFunctions = document.querySelector('div.transcript-functions');

showError = function (msg) {
    errorMsg.textContent = msg;
    errorDiv.classList.toggle('hidden');
    setTimeout(function () {
        errorDiv.classList.toggle('hidden');
        transcriptFunctions.classList.toggle('hidden');
        errorMsg.textContent = '';
    }, 4000)
}


//
// AUDIO CONTROL
//

// stepsize for audio control (backward/forward) in seconds
const stepSize = 5

const audioFile = document.getElementById('input-audio-file');
const audio = document.getElementById('audio');
const playbackSpeed = document.getElementById('range-playback-speed');
const autoRewind = document.getElementById('input-rewind');
const mousePlay = document.getElementById('cb-mouse-play');
const audioFilename = document.getElementById('audio-filename');

document.addEventListener('contextmenu', function (event) {
    if (mousePlay.checked) {
        event.preventDefault();
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
            audio.currentTime -= autoRewind.value;
        }
    }
})

// add source to audio if file is selected
audioFile.addEventListener('change', function (event) {
    const audioFile = event.target.files[0];
    const audioSrc = URL.createObjectURL(audioFile);
    audio.setAttribute('src', audioSrc);
    fileNameToShow = audioFile.name.length <= 50 ? audioFile.name : audioFile.name.substr(0, 47) + "...";
    audioFilename.textContent = fileNameToShow;
});

audio.addEventListener('error', (err) => {
    showError("error: could not load audio file");
    labelFile.innerText = '';
});

// change playback speed
playbackSpeed.addEventListener('change', function (event) {
    newSpeed = 1 + (event.target.value * 0.25);
    audio.playbackRate = newSpeed
});

// monitor keyboard events for audio playback
document.addEventListener('keydown', function (event) {
    // keyCodes: 114 (F3), 115 (F4), 116 (F5), 118 (F7), 119 (F8), 120 (F9), 32 (space)
    const cmdPlay = event.keyCode === 120;
    const cmdPlayPause = (event.ctrlKey && event.keyCode === 32) || event.keyCode === 115;
    const cmdForward = event.keyCode === 118 || event.keyCode === 116;
    const cmdBackward = event.keyCode === 119 || event.keyCode === 114;

    if (cmdPlay) {
        event.preventDefault();
        event.stopPropagation();
        audio.play();
    } else if (cmdPlayPause) {
        event.preventDefault();
        event.stopPropagation();
        if (audio.paused) {
            audio.currentTime -= autoRewind.value;
            audio.play()
        } else {
            audio.pause();
        }
    } else if (cmdForward) {
        event.preventDefault();
        event.stopPropagation();
        audio.currentTime += stepSize
    } else if (cmdBackward) {
        event.preventDefault();
        event.stopPropagation();
        audio.currentTime -= stepSize
    }
});


//
// TRANSCRIPTION
//

const transcript = document.querySelector('textarea.text-transcript');
const interviewer = document.getElementById('input-interviewer');
const respondent = document.getElementById('input-respondent');
const autoSwitch = document.getElementById('cb-auto-switch');
const autoTimeStamp = document.getElementById('cb-auto-timestamp');

// create timestamp
const timeStamp = function (time) {
    hms = new Date(time * 1000).toISOString().substr(11, 10);
    hms = hms.replace('\.', '\-');
    const stamp = ` #${hms}#`
    return stamp;
}

// monitor keyboard events in transcript window
transcript.addEventListener('keydown', function (event) {
    if (event.keyCode === 13 && !event.shiftKey && transcript.selectionStart === transcript.selectionEnd) {
        event.preventDefault();

        // get cursor position
        let cursorPosition = transcript.selectionEnd;
        let insertText = '';

        // generate text to insert (timestamp and speaker)
        insertText = autoTimeStamp.checked ? timeStamp(audio.currentTime) + '\n' : '\n';
        if (autoSwitch.checked) {
            if (!event.altKey) {
                //switch speaker
                speaker = (speaker === interviewer) ? respondent : interviewer;
            }
            insertText += speaker.value + ': '
        }

        // insert text
        currentText = transcript.value;
        newText = currentText.substring(0, cursorPosition) + insertText + currentText.substring(cursorPosition);
        transcript.value = newText;

        // position cursor
        let newCursorPosition = cursorPosition + insertText.length;
        transcript.selectionStart = newCursorPosition;
        transcript.selectionEnd = newCursorPosition;

        // create snapshot
        if (hasStorage && autoSave.checked) createSnapshot();
    }
})



//
// DATA STORAGE, EXPORT AND CLEARANCE
//

const autoSave = document.getElementById('cb-auto-save');
const restoreSnapshot = document.getElementById('btn-restore-snapshot');
const deleteSnapshot = document.getElementById('btn-delete-snapshot');
const exportTranscript = document.getElementById('svg-export');
const clearTranscript = document.getElementById('svg-clear');

// create snapshot in local browser storage (triggered on line break)
const createSnapshot = function () {
    localStorage.tscribe = transcript.value;
    restoreSnapshot.disabled = false;
    deleteSnapshot.disabled = false;
}

// restore snapshot from local browser storage
restoreSnapshot.addEventListener('click', function (event) {
    let snapshot = localStorage.tscribe;
    snapshot = snapshot.replace(/\n+/g, "<br>")
    const message = `Found a previous session with the following content: <div class="overlay-code" style="overflow-y:scroll; height:10rem">... ${snapshot}</div> Restoring the session will delete current transcript. Continue?`;
    showMessage('Restore previous session', message, ['yes', 'no'], (response) => {
        if (response == 'yes') transcript.value = localStorage.tscribe
    });
});

// delete snapshot from local browser storage
deleteSnapshot.addEventListener('click', function (event) {
    message = 'Are you sure you want to delete all local session data?';
    showMessage('Delete local session data', message, ['yes', 'no'], response => {
        if (response == 'yes') {
            localStorage.removeItem('tscribe');
            restoreSnapshot.disabled = true;
            deleteSnapshot.disabled = true;
        }
    });
});

// export transcript to txt file
exportTranscript.addEventListener('click', function (event) {
    const transcriptText = transcript.value.replace(/\n\n\n+/, '\n\n');
    const textBlob = new Blob([transcriptText], { type: 'text/plain' });
    var fileName = 'transcript.txt';
    if (audioFile.files[0]) {
        fileName = audioFile.files[0].name + '.txt'
    };
    //create dummy link to download blob
    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerHTML = "download file";
    downloadLink.href = window.URL.createObjectURL(textBlob);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

// clear transcript
clearTranscript.addEventListener('click', function (event) {
    showMessage('Clear transcript', 'Are you sure you want to clear the current transcript?', ['yes', 'no'], (response) => {
        if (response === 'yes') initTranscript(true);
    });
    // confirmClear = confirm('Clear transcript?');
    // if (confirmClear) {
    //     initTranscript(true);
    // }
})



//
// MESSAGES
//

// overlay = document.getElementById('overlay');
// overlayTitle = document.getElementById('overlay-title');
// overlayText = document.getElementById('overlay-text');
// overlayOptions = document.getElementById('overlay-options');

const showMessage = function (title, text, options, callback) {
    dim = document.createElement('div');
    overlay = document.createElement('div');
    overlayTitle = document.createElement('div');
    overlayText = document.createElement('div');
    overlayOptions = document.createElement('div');
    overlay.appendChild(overlayTitle);
    overlay.appendChild(overlayText);
    overlay.appendChild(overlayOptions);
    
    dim.id = 'dim';
    overlay.id = 'overlay';
    overlayTitle.id = 'overlay-title';
    overlayText.id = 'overlay-text';
    overlayOptions.id = 'overlay-options';

    overlayTitle.textContent = title;
    overlayText.innerHTML = text;
    options.forEach(option => {
        var btn = document.createElement('button');
        btn.className = 'button';
        btn.textContent = option;
        overlayOptions.appendChild(btn);
        btn.addEventListener('click', (event) => {
            callback(option);
            overlay.remove();
            dim.remove();
        });
    });
    document.body.appendChild(dim);
    document.body.appendChild(overlay);
};





//
// HELPER FUNCTIONS
//

// check if localStorage is available
var hasStorage = () => {
    try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        console.log('storage test successful')
        return true;
    } catch (exception) {
        return false;
    }
};

