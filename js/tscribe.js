//
// INITIALIZE
//

// enable restore/delete snapshot buttons if local storage exists
var speaker;

initTranscript = function(override = false) {
    if(transcript.value.length < 5 || override) {
        speaker = interviewer;
        speakerString = `${speaker.value}: `;
        transcript.value = speakerString + '\n\n\n\n\n\n\n\n\n\n\n\n';
        transcript.focus();
        transcript.setSelectionRange(speakerString.length, speakerString.length);
    }
}

document.addEventListener('DOMContentLoaded', function (event) {
    if (localStorage.tscribe) {
        restoreSnapshot.disabled = false;
        deleteSnapshot.disabled = false;
    }
})



//
// AUDIO CONTROL
//

// stepsize for audio control (backward/forward) in seconds
const stepSize = 5

const audioFile = document.getElementById('input-file');
const labelFile = document.getElementById('label-file');
const audio = document.getElementById('audio');
const playbackSpeed = document.getElementById('range-playback-speed');
const autoRewind = document.getElementById('input-rewind');
const mousePlay = document.getElementById('cb-mouse-play');

document.addEventListener('contextmenu', function(event) {
    if(mousePlay.checked) {
        event.preventDefault();
        if(audio.paused){
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
    labelFile.innerHTML = `now transcribing: ${audioFile.name}`;
    audio.setAttribute('src', audioSrc);
    initTranscript();
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
            audio.play()
        } else {
            audio.pause();
            audio.currentTime -= autoRewind.value;
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

const transcript = document.getElementById('text-transcript');
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
            if(!event.altKey) {
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
        if (autoSave.checked) createSnapshot();
    }
})



//
// DATA STORAGE, EXPORT AND CLEARANCE
//

const autoSave = document.getElementById('cb-auto-save');
const restoreSnapshot = document.getElementById('btn-restore-snapshot');
const deleteSnapshot = document.getElementById('btn-delete-snapshot');
const exportTranscript = document.getElementById('btn-export');
const clearTranscript = document.getElementById('btn-clear');

// create snapshot in local browser storage (triggered on line break)
const createSnapshot = function () {
    localStorage.tscribe = transcript.value;
    restoreSnapshot.disabled = false;
    deleteSnapshot.disabled = false;
}

// restore snapshot from local browser storage
restoreSnapshot.addEventListener('click', function (event) {
    snapshot = localStorage.tscribe;
    snapshot = snapshot.replace(/\n\n\n+/, '\n\n');
    snapshotEnd = snapshot.substr(snapshot.length - 100, snapshot.length);
    const message = `Found a snapshot ending with the following content: \n... ${snapshotEnd}\n Restoring the snapshot will delete current transcript. Continue?`;
    const confirmRestore = confirm(message);
    if (confirmRestore) {
        transcript.value = localStorage.tscribe
    }
});

// delete snapshot from local browser storage
deleteSnapshot.addEventListener('click', function (event) {
    message = 'Are you sure you want to delete all local snapshots?';
    confirmDelete = confirm(message);
    if (confirmDelete) {
        localStorage.removeItem('tscribe');
        restoreSnapshot.disabled = true;
        deleteSnapshot.disabled = true;
    }
});

// export transcript to txt file
exportTranscript.addEventListener('click', function (event) {
    const transcriptText = transcript.value.replace(/\n\n\n+/, '\n\n');
    const textBlob = new Blob([transcriptText], { type: 'text/plain' });
    var fileName = 'transcript.txt';
    if(audioFile.files[0]) {
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
    confirmClear = confirm('Clear transcript?');
    if(confirmClear) {
        initTranscript(true);
    }
})
