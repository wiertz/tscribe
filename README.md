# t.scribe
Tool to facilitate transcription of qualitative interviews.

## Description
_t.scribe_ is a simple web application that facilitates the transcription of audio-recorded interviews. It can be used via https://human.geographie.uni-freiburg.de/tscribe/, hosted on any other web server or downloaded for offline use. Current features include:
* Compatibility with foot switches for audio playback control
* Adjust playback speed
* Auto rewind on stop
* Auto insert timestamp and interviewer/respondent names
* Save txt file for import in QDA-Software

## Motivation
Transcribing interviews from audio recordings is a central task in qualitative research projects. This tool is an alternative to proprietary transcription software such as F4transkript and outdated free transcription tools such as EasyTranscript. It is developed and maintained without commercial interests by researchers and meant to facilitate transcription in university research and student projects.

## Installation
_t.scribe_ consists of pure html/css/js code. It can be hosted on any webserver serving static content. Since _t.scribe_ does not include processing on the server side, it can be installed and used offline. To use _t.scribe_ offline, download the latest version from https://github.com/wiertz/tscribe/archive/master.zip. Unpack the zip-file in a folder on your computer and open tscribe/index.html. 

## Data protection
_t.scribe_ does not send audio material or transcription text over the web. No information is stored on the server running _t.scribe_. Audio files are played from the local harddisk and transcripts are processed locally in the browser. Unencrypted snapshots of the transcript session are stored in the local browser session (local storage) to prevent loss of data on accidentally closing the browser window or reloading the page. You can delete these snapshots by clearing your browser cache or by clicking delete in the interface. If you have security concerns using t.scribe online or are working on very sensitive material, download _t.scribe_ for offline use (see above). Disable your internet connection, start _t.scribe_ from your local hard drive and clear your browser cache once you are finished.

## Issues and contribution
Please report issues or suggest improvements via https://github.com/wiertz/tscribe/. Contributions/pull requests are very welcome!

## Author
Thilo Wiertz is assistant professor at the University of Freiburg, Germany.
