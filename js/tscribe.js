const createSnapshot = function () {
    localStorage.tscribe = transcript.value;
    btnRestore.disabled = false;
    btnDelete.disabled = false;
}

const stopPlayback = function (autoRewind) {
    audio.pause();
    audio.currentTime = audio.currentTime - autoRewind;
}
const startPlayback = function () {
    audio.play();
}
const forward = function (step) {
    audio.currentTime = audio.currentTime + step;
}
const backward = function (step) {
    audio.currentTime = audio.currentTime - step;
}
const timeStamp = function (time) {
    hms = new Date(time * 1000).toISOString().substr(11, 8);
    const stamp = ` #${hms}#`
    return stamp;
}
const uploadFile = function (event) {
    const audioFile = event.target.files[0];
    const audioSrc = URL.createObjectURL(audioFile);
    audio.setAttribute('src', audioSrc);
}

const btnRestore = document.getElementById('restore');
const audio = document.getElementById('audio');
const transcript = document.getElementById('transcript');
const file = document.getElementById('file');
const speed = document.getElementById('speed');
const interviewer = document.getElementById('interviewer');
const respondent = document.getElementById('respondent');
const autoSwitch = document.getElementById('auto-switch');
const autoSave = document.getElementById('auto-save');
const btnDelete = document.getElementById('delete');
const autoRewind = document.getElementById('auto-rewind');
const btnExport = document.getElementById('export');

let ignoreNextEnter = false;
let speaker = respondent;
const step = 5;

btnExport.addEventListener('click', function (event) {
    var textToWrite = transcript.value;
    var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
    var fileNameToSaveAs = "transcript.txt";
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "download file";
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

speed.addEventListener('change', function (event) {
    newSpeed = 1 + (event.target.value * 0.25);
    audio.playbackRate = newSpeed
});

btnRestore.addEventListener('click', function (event) {
    snapshot = localStorage.tscribe;
    snapshotEnd = snapshot.substr(snapshot.length - 40, snapshot.length);
    const message = 'Found a snapshot ending with the following content: \n' + '...' + snapshotEnd + '\n Restore snapshot and delete current transcript?'
    const confirmRestore = confirm(message);
    console.log(confirmRestore);
    if (confirmRestore) {
        transcript.value = localStorage.tscribe
    }
});

btnDelete.addEventListener('click', function (event) {
    message = 'Are you sure you want to delete all local snapshots?';
    confirmDelete = confirm(message);
    if (confirmDelete) {
        localStorage.removeItem('tscribe');
        btnRestore.disabled = true;
        btnDelete.disabled = true;
    }
});

file.addEventListener('change', uploadFile);

transcript.addEventListener('keydown', function (event) {
    if (event.keyCode != 13) {
        ignoreNextEnter = false;
    };
    if (event.keyCode === 13 && !ignoreNextEnter) {
        ignoreNextEnter = true;
        text = transcript.value + timeStamp(audio.currentTime) + '\n';
        if (autoSwitch.checked) {
            if (!event.shiftKey) {
                speaker = (speaker === interviewer) ? respondent : interviewer;
            };
            if (speaker.value.length > 1) {
                text += speaker.value + ': ';
            } else {
                text += speaker === interviewer ? 'I: ' : 'R: ';
            }
        };
        event.preventDefault();
        event.stopPropagation();
        transcript.value = text;
        if (autoSave.checked) createSnapshot();
    }
})

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

document.addEventListener('DOMContentLoaded', function (event) {
    const snapshot = localStorage.tscribe;
    if (snapshot) {
        btnRestore.disabled = false;
        btnDelete.disabled = false;
    }
})