//
// INITIALIZE
//

// enable restore/delete snapshot buttons if local storage exists
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
const audio = document.getElementById('audio');
const playbackSpeed = document.getElementById('range-playback-speed');
const autoRewind = document.getElementById('auto-rewind');

// add source to audio if file is selected
audioFile.addEventListener('change', function (event) {
    const audioFile = event.target.files[0];
    const audioSrc = URL.createObjectURL(audioFile);
    audio.setAttribute('src', audioSrc);
});

// change playback speed
playbackSpeed.addEventListener('change', function (event) {
    newSpeed = 1 + (event.target.value * 0.25);
    audio.playbackRate = newSpeed
});

// monitor keyboard events for audio playback
document.addEventListener('keydown', function (event) {
    // add 37 (backword) and 39 (forward)
    switch (event.keyCode) {
        case 32:
            if (event.ctrlKey) {
                if (audio.paused) {
                    startPlayback();
                } else {
                    stopPlayback(autoRewind.value);
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            };
        case 115:
            stopPlayback(autoRewind.value);
            event.preventDefault();
            event.stopPropagation();
            break;
        case 119:
            backward(step);
            event.preventDefault();
            event.stopPropagation();
            break;
        case 120:
            startPlayback();
            event.preventDefault();
            event.stopPropagation();
            break;
        case 118:
            forward(step);
            event.preventDefault();
            event.stopPropagation();
            break;
    }
});



//
// TRANSCRIPTION
//

const transcript = document.getElementById('text-transcript');
const interviewer = document.getElementById('input-interviewer');
const respondent = document.getElementById('input-respondent');
const autoSwitch = document.getElementById('cb-auto-switch');

// init current speaker value
let speaker = respondent;

// create timestamp
// TODO: add milliseconds (format: hh:mm:ss-x)
const timeStamp = function (time) {
    hms = new Date(time * 1000).toISOString().substr(11, 8);
    const stamp = ` #${hms}#`
    return stamp;
}

// monitor keyboard events in transcript window
transcript.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        text = transcript.value + timeStamp(audio.currentTime) + '\n';
        if (autoSwitch.checked) {
            if (!event.shiftKey) {
                speaker = (speaker === interviewer) ? respondent : interviewer;
            };
            text += speaker.value + ': ';
        };
        transcript.value = text;
        if (autoSave.checked) createSnapshot();
    }
})



//
// DATA STORAGE AND EXPORT
//

const autoSave = document.getElementById('cb-auto-save');
const restoreSnapshot = document.getElementById('btn-restore-snapshot');
const deleteSnapshot = document.getElementById('btn-delete-snapshot');
const exportTranscript = document.getElementById('btn-export');

// create snapshot in local browser storage (triggered on line break)
const createSnapshot = function () {
    localStorage.tscribe = transcript.value;
    restoreSnapshot.disabled = false;
    deleteSnapshot.disabled = false;
}

// restore snapshot from local browser storage
restoreSnapshot.addEventListener('click', function (event) {
    snapshot = localStorage.tscribe;
    snapshotEnd = snapshot.substr(snapshot.length - 40, snapshot.length);
    const message = `Found a snapshot ending with the following content: \n... ${snapshotEnd} Restoring the snapshot will delete current transcript. Continue?`;
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
    var transcriptText = transcript.value;
    var textBlob = new Blob([transcriptText], { type: 'text/plain' });

    //create dummy link to download blob
    var downloadLink = document.createElement("a");
    downloadLink.download = "transcript.txt";
    downloadLink.innerHTML = "download file";
    downloadLink.href = window.URL.createObjectURL(textBlob);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});
