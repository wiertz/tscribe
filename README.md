# tscribe
Tool to facilitate transcription of qualitative interviews

## Description
_tscribe_ is a simple web application that facilitates the transcription of audio-recorded interviews. Current features include:
* Compatibility with foot pedals for audio playback control
* Adjust playback speed
* Auto rewind on stop
* Auto insert timestamp and interviewer/respondent names
* Save as txt file for import in MaxQDA

## Motivation
Transcribing interviews from audio recordings is a central task of qualitative research. This tool is an alternative to proprietary transcription software such as F4transkript and outdated free transcription software such as EasyTranscript. It is developed and maintained by researchers and meant to facilitate transcription in university research and student projects.

## Installation
_tscribe_ consists of pure vanilla html/css/js without further dependencies. It can be hosted on any webserver serving static content (e.g. apache or nginx). Since _tscribe_ does not include processing on the server side, it can be installed and used locally and offline. For local use simply download repository as zip, extract, and open index.html.

## Data protection
_tscribe_ does *not* send audio or text data over the web. No information is stored on the server running _tscribe_. Audio files are played from your local harddisk and transcripts are processed locally in the browser. Unencrypted snapshots of the transcript are stored in the local browser cache. You can delete this data by clearing your browser cache or deleting the snapshot via the interface. 

## Issues and contribution
Please report issues or suggest improvements via https://github.com/wiertz/tscribe/. Contributions/pull requests are very welcome!

## Author
Thilo Wiertz is assistant professor at the University of Freiburg, Germany.
