//Imports«

let log = Core.log;
let cwarn = Core.cwarn;
let cerr = Core.cerr;
let _;
let globals = Core.globals;
let util = globals.util;
_ = util;
let strnum = _.strnum;
let isnotneg = _.isnotneg;
let isnum = _.isnum;
let isstr = _.isstr;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
let isid = _.isid;
let isarr = _.isarr;
let isobj = _.isobj;
let isnotnegint = function(arg){return _.isint(arg, true);}
let make = _.make;

let Desk = Core.Desk;

let fs = globals.fs;//«
let objpath = fs.objpath;
let mv_desk_icon = fs.mv_desk_icon;
let get_fullpath = function(path, cwd, if_no_deref, if_getlink){return fs.get_fullpath(path,if_no_deref, cwd, if_getlink);}
let get_distinct_file_key = function(arg) {return fs.get_distinct_file_key(arg);}
//»

//»

//JsSpeechRecognizer«
let speechRec;
function JsSpeechRecognizer() {//«

    // Constants
    this.RecordingEnum = { "NOT_RECORDING": 0, "TRAINING": 1, "RECOGNITION": 2, "KEYWORD_SPOTTING": 3, "KEYWORD_SPOTTING_NOISY": 4 };
    Object.freeze(this.RecordingEnum);
    this.RecognitionModel = { "TRAINED": 0, "AVERAGE": 1, "COMPOSITE": 2 };
    Object.freeze(this.RecognitionModel);

    // Variables for recording data
    this.recordingBufferArray = [];
    this.currentRecordingBuffer = [];
    this.wordBuffer = [];
    this.modelBuffer = [];
    this.groupedValues = [];
    this.keywordSpottingGroupBuffer = [];
    this.keywordSpottingRecordingBuffer = [];

    // The speech recognition model
    this.model = {};

    this.recordingState = this.RecordingEnum.NOT_RECORDING;
    this.useRecognitionModel = this.RecognitionModel.COMPOSITE;

    // Get an audio context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();


    // Generate functions for keyword spotting
    this.findDistanceForKeywordSpotting = this.generateFindDistanceForKeywordSpotting(-1);
    this.findDistanceForKeywordSpotting0 = this.generateFindDistanceForKeywordSpotting(0);
    this.findDistanceForKeywordSpotting5 = this.generateFindDistanceForKeywordSpotting(5);
    this.findDistanceForKeywordSpotting15 = this.generateFindDistanceForKeywordSpotting(15);


    // Adjustable parameters

    // Create an analyser
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.minDecibels = -80;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0;
    this.analyser.fftSize = 1024;

    // Create the scriptNode
    this.scriptNode = this.audioCtx.createScriptProcessor(this.analyser.fftSize, 1, 1);
    this.scriptNode.onaudioprocess = this.generateOnAudioProcess();

    // Parameters for the model calculation
    this.numGroups = 25;
    this.groupSize = 10;
    this.minPower = 0.01;

    // Keyword spotting parameters
    this.keywordSpottingMinConfidence = 0.50;
    this.keywordSpottingBufferCount = 80;
    this.keywordSpottingLastVoiceActivity = 0;
    this.keywordSpottingMaxVoiceActivityGap = 300;
    this.keywordSpottedCallback = null;

}//»

_=JsSpeechRecognizer.prototype;
_.openMic = function(cb) {//«
//  Requests access to the microphone.

    var constraints = {
        "audio": true
    };

    navigator.getUserMedia(constraints, successCallback, errorCallback);

    var _this = this;
    // Acess to the microphone was granted
    function successCallback(stream) {
        _this.stream = stream;
        _this.source = _this.audioCtx.createMediaStreamSource(stream);

        _this.source.connect(_this.analyser);
        _this.analyser.connect(_this.scriptNode);

        // This is needed for chrome
        _this.scriptNode.connect(_this.audioCtx.destination);
		if (cb) cb(true);
    }

    function errorCallback(error) {
        console.error('navigator.getUserMedia error: ', error);
		if (cb) cb();
    }
};//»
_.isRecording = function() {//«
//  Returns false if the recognizer is not recording. True otherwise.
    return (this.recordingState !== this.RecordingEnum.NOT_RECORDING);
};//»
_.startTrainingRecording = function(curWord) {//«
//  Starts recording in TRAINING mode.
    this.resetBuffers();
    this.recordingState = this.RecordingEnum.TRAINING;
    this.wordBuffer.push(curWord);
};//»
_.startRecognitionRecording = function() {//«
    this.resetBuffers();
    this.recordingState = this.RecordingEnum.RECOGNITION;
};//»
_.startKeywordSpottingRecording = function() {//«
//  Starts recording in KEYWORD_SPOTTING mode.
    this.resetBuffers();
    this.recordingState = this.RecordingEnum.KEYWORD_SPOTTING;
};//»
_.startKeywordSpottingNoisyRecording = function() {//«
//  Starts a recording in KEYWORD_SPOTTING_NOISY mode.
    this.resetBuffers();
    this.recordingState = this.RecordingEnum.KEYWORD_SPOTTING_NOISY;
};//»
_.stopRecording = function() {//«
//  Stops recording. @return {Number} the length of the training buffer.

    this.groupedValues = [].concat.apply([], this.groupedValues);
    this.normalizeInput(this.groupedValues);

    // If we are training we want to save to the recongition model buffer
    if (this.recordingState === this.RecordingEnum.TRAINING) {
        this.recordingBufferArray.push(this.currentRecordingBuffer.slice(0));
        this.modelBuffer.push(this.groupedValues.slice(0));
    }

    this.recordingState = this.RecordingEnum.NOT_RECORDING;

    return this.recordingBufferArray.length;
};//»
_.playTrainingBuffer = function(index) {//«
// Plays training audio for the specified index. @param {Number} index
    this.playMonoAudio(this.recordingBufferArray[index]);
};//»
_.deleteTrainingBuffer = function(index) {//«
// Delete training data for the specified index. @param {Number} index
    this.modelBuffer[index] = null;
};//»
_.playMonoAudio = function(playBuffer) {//«
//Play mono audio.  @param {Array} playBuffer

    var channels = 1;
    var frameCount = playBuffer.length;
    var myArrayBuffer = this.audioCtx.createBuffer(channels, frameCount, this.audioCtx.sampleRate);

    for (var channel = 0; channel < channels; channel++) {
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++) {
            nowBuffering[i] = playBuffer[i];
        }
    }

    var playSource = this.audioCtx.createBufferSource();
    playSource.buffer = myArrayBuffer;
    playSource.connect(this.audioCtx.destination);
    playSource.start();
};//»
_.getTopRecognitionHypotheses = function(numResults) {//«
// Returns an array of the top recognition hypotheses. @param {Number} numResults @return {Array}
    return this.findClosestMatch(this.groupedValues, numResults, this.model, this.findDistance);
};//»
_.generateModel = function() {//«
// Method to generate the new speech recognition model from the training data.

    var i = 0;
    var j = 0;
    var k = 0;
    var key = "";
    var averageModel = {};

    // Reset the model
    this.model = {};

    for (i = 0; i < this.wordBuffer.length; i++) {
        key = this.wordBuffer[i];
        this.model[key] = [];
    }

    for (i = 0; i < this.modelBuffer.length; i++) {
        if (this.modelBuffer[i] !== null) {
            key = this.wordBuffer[i];
            this.model[key].push(this.modelBuffer[i]);
        }
    }

    // If we are only using the trained entries, no need to anything else
    if (this.useRecognitionModel === this.RecognitionModel.TRAINED) {
        return;
    }

    // Average Model
    // Holds one entry for each key. That entry is the average of all the entries in the model
    for (key in this.model) {
        var average = [];
        for (i = 0; i < this.model[key].length; i++) {
            for (j = 0; j < this.model[key][i].length; j++) {
                average[j] = (average[j] || 0) + (this.model[key][i][j] / this.model[key].length);
            }
        }

        averageModel[key] = [];
        averageModel[key].push(average);
    }

    // Interpolation - Take the average of each pair of entries for a key and 
    // add it to the average model
    for (key in this.model) {

        var averageInterpolation = [];
        for (k = 0; k < this.model[key].length; k++) {
            for (i = k + 1; i < this.model[key].length; i++) {

                averageInterpolation = [];
                for (j = 0; j < Math.max(this.model[key][k].length, this.model[key][i].length); j++) {
                    var entryOne = this.model[key][k][j] || 0;
                    var entryTwo = this.model[key][i][j] || 0;
                    averageInterpolation[j] = (entryOne + entryTwo) / 2;
                }

                averageModel[key].push(averageInterpolation);
            }
        }
    }

    if (this.useRecognitionModel === this.RecognitionModel.AVERAGE) {
        this.model = averageModel;
    } else if (this.useRecognitionModel === this.RecognitionModel.COMPOSITE) {
        // Merge the average model into the model
        for (key in this.model) {
            this.model[key] = this.model[key].concat(averageModel[key]);
        }
    }

};//»
_.resetBuffers = function() {//«
//  Resets the recording buffers.
    this.currentRecordingBuffer = [];
    this.groupedValues = [];

    this.keywordSpottingGroupBuffer = [];
    this.keywordSpottingRecordingBuffer = [];
};//»
_.generateOnAudioProcess = function() {//«
// Generates an audioProcess function. @return {Function}
    var _this = this;
    return function(audioProcessingEvent) {

        var i = 0;

        // If we aren't recording, don't do anything
        if (_this.recordingState === _this.RecordingEnum.NOT_RECORDING) {
            return;
        }

        // get the fft data
        var dataArray = new Uint8Array(_this.analyser.fftSize);
        _this.analyser.getByteFrequencyData(dataArray);

        // Find the max in the fft array
        var max = Math.max.apply(Math, dataArray);

        // If the max is zero ignore it.
        if (max === 0) {
            return;
        }

        // Get the audio data. For simplicity just take one channel
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var leftChannel = inputBuffer.getChannelData(0);

        // Calculate the power
        var curFrame = new Float32Array(leftChannel);
        var power = 0;
        for (i = 0; i < curFrame.length; i++) {
            power += curFrame[i] * curFrame[i];
        }

        // Check for the proper power level
        if (power < _this.minPower) {
            return;
        }

        // Save the data for playback.
        Array.prototype.push.apply(_this.currentRecordingBuffer, curFrame);

        // Normalize and Group the frequencies
        var groups = [];

        for (i = 0; i < _this.numGroups; i++) {
            var peakGroupValue = 0;
            for (var j = 0; j < _this.groupSize; j++) {
                var curPos = (_this.groupSize * i) + j;

                // Keep the peak normalized value for this group
                if (dataArray[curPos] > peakGroupValue) {
                    peakGroupValue = dataArray[curPos];
                }

            }
            groups.push(peakGroupValue);
        }

        // Depending on the state, handle the data differently
        if (_this.recordingState === _this.RecordingEnum.KEYWORD_SPOTTING || _this.recordingState === _this.RecordingEnum.KEYWORD_SPOTTING_NOISY) {

            // Check if we should reset the buffers
            var now = new Date().getTime();
            if (now - _this.keywordSpottingLastVoiceActivity > _this.keywordSpottingMaxVoiceActivityGap) {
                _this.resetBuffers();
            }
            _this.keywordSpottingLastVoiceActivity = now;

            _this.keywordSpottingProcessFrame(groups, curFrame);
        } else {
            _this.groupedValues.push(groups);
        }

    };
};//»
_.keywordSpottingProcessFrame = function(groups, curFrame) {//«
//Process a new frame of data while in recording state KEYWORD_SPOTTING.
// @param{Array} groups - the group data for the frame
// @param{Array} curFrame - the raw audio data for the frame

    var computedLength;
    var key;
    var allResults = [];
    var recordingLength;
    var workingGroupBuffer = [];

    // Append to the keywordspotting buffer
    this.keywordSpottingGroupBuffer.push(groups);
    this.keywordSpottingGroupBuffer = [].concat.apply([], this.keywordSpottingGroupBuffer);

    // Trim the buffer if necessary
    computedLength = (this.keywordSpottingBufferCount * this.numGroups);
    if (this.keywordSpottingGroupBuffer.length > computedLength) {
        this.keywordSpottingGroupBuffer = this.keywordSpottingGroupBuffer.slice(this.keywordSpottingGroupBuffer.length - computedLength, this.keywordSpottingGroupBuffer.length);
    }

    // Save the audio data
    Array.prototype.push.apply(this.keywordSpottingRecordingBuffer, curFrame);

    // Trim the buffer if necessary
    computedLength = (this.keywordSpottingBufferCount * this.analyser.fftSize);
    if (this.keywordSpottingRecordingBuffer.length > computedLength) {
        this.keywordSpottingRecordingBuffer = this.keywordSpottingRecordingBuffer.slice(this.keywordSpottingRecordingBuffer.length - computedLength, this.keywordSpottingRecordingBuffer.length);
    }

    // Copy buffer, and normalize it, and use it to find the closest match
    workingGroupBuffer = this.keywordSpottingGroupBuffer.slice(0);
    this.normalizeInput(workingGroupBuffer);

    // Use the correct keyword spotting function
    if (this.recordingState === this.RecordingEnum.KEYWORD_SPOTTING_NOISY) {
        allResults = this.keywordDetectedNoisy(workingGroupBuffer);
    } else {
        allResults = this.keywordDetectedNormal(workingGroupBuffer);
    }


    // See if a keyword was spotted
    if (allResults !== null && allResults[0] !== undefined) {

        // Save the audio
        recordingLength = (allResults[0].frameCount / this.numGroups) * this.analyser.fftSize;

        if (recordingLength > this.keywordSpottingRecordingBuffer.length) {
            recordingLength = this.keywordSpottingRecordingBuffer.length;
        }

        allResults[0].audioBuffer = this.keywordSpottingRecordingBuffer.slice(this.keywordSpottingRecordingBuffer.length - recordingLength, this.keywordSpottingRecordingBuffer.length);

        this.resetBuffers();
        if (this.keywordSpottedCallback !== undefined && this.keywordSpottedCallback !== null) {
            this.keywordSpottedCallback(allResults[0]);
        }

    }

};//»
_.keywordDetectedNormal = function(workingGroupBuffer) {//«
//Analyzes a buffer to determine if a keyword has been found.
//Will return an array if a keyword was found, null otherwise.
//@param {Array} workingGroupBuffer
//@return {Array|null}
    var allResults = {};

    allResults = this.findClosestMatch(workingGroupBuffer, 1, this.model, this.findDistanceForKeywordSpotting);

    if (allResults[0] !== undefined && allResults[0].confidence > this.keywordSpottingMinConfidence) {
        return allResults;
    }

    return null;
};//»
_.keywordDetectedNoisy = function(workingGroupBuffer) {//«
// Analyzes a buffer to determine if a keyword has been found. Will return an array if a keyword 
// was found, null otherwise. Designed to adjust for different levels of noise.
// @param {Array} workingGroupBuffer
// @return {Array|null}

    // TODO: Make it possible for a user to specify the number of keyword spotting functions
    // And change this duplicated code to a loop!

    var allResults15 = {};
    var allResults15MinConfidence = this.keywordSpottingMinConfidence;

    allResults15 = this.findClosestMatch(workingGroupBuffer, 1, this.model, this.findDistanceForKeywordSpotting15);

    if (allResults15[0].confidence <= allResults15MinConfidence) {
        return null;
    }


    var allResults5 = {};
    var allResults5MinConfidence = this.keywordSpottingMinConfidence - 0.1;

    allResults5 = this.findClosestMatch(workingGroupBuffer, 1, this.model, this.findDistanceForKeywordSpotting5);

    if (allResults5[0].confidence <= allResults5MinConfidence) {
        return null;
    }


    var allResults0 = {};
    var allResults0MinConfidence = this.keywordSpottingMinConfidence - 0.15;

    allResults0 = this.findClosestMatch(workingGroupBuffer, 1, this.model, this.findDistanceForKeywordSpotting0);

    if (allResults0[0].confidence <= allResults0MinConfidence) {
        return null;
    }


    // finally, run the normal check
    var allResults = {};

    allResults = this.findClosestMatch(workingGroupBuffer, 1, this.model, this.findDistanceForKeywordSpotting);

    // Calculate the minimum confidence
    var allResultsMinConfidence = this.keywordSpottingMinConfidence - 0.1 - (Math.max((allResults[0].noise * 1.25) - 1, 0) * 0.75);

    // Final check for returning the results
    if (allResults[0] !== undefined && allResults[0].confidence > allResultsMinConfidence) {
        return allResults;
    }

    return null;
};//»
_.normalizeInput = function(input) {//«
// Normalizes an input array to a scale from 0 to 100.
// @param {Array} input
    // Find the max in the fft array
    var max = Math.max.apply(Math, input);

    for (var i = 0; i < input.length; i++) {
        input[i] = Math.floor((input[i] / max) * 100);
    }
};//»
_.findClosestMatch = function(input, numResults, speechModel, findDistanceFunction) {//«
//  Finds the closest matches for an input, for a specified model.
//  Uses specified findDistance function, or a default one.
//  @param {Array} input
//  @param {Number} numResults
//  @param {Object} speechModel
//  @param {Function} findDistance
//  @return {Array}

    var i = 0;
    var key = "";
    var allResults = [];

    // If no findDistance function is defined, use the default
    if (findDistanceFunction === undefined) {
        findDistanceFunction = this.findDistanceFunction;
    }

    // Loop through all the keys in the model
    for (key in speechModel) {
        // Loop through all entries for that key
        for (i = 0; i < speechModel[key].length; i++) {

            var curDistance = findDistanceFunction(input, speechModel[key][i]);
            var curConfidence = this.calcConfidence(curDistance, speechModel[key][i]);
            var curNoise = this.calculateNoise(input, speechModel[key][i]);

            var newResult = {};
            newResult.match = key;
            newResult.confidence = curConfidence;
            newResult.noise = curNoise;
            newResult.frameCount = speechModel[key][i].length;
            allResults.push(newResult);
        }

    }

    allResults.sort(function(a, b) { return b.confidence - a.confidence; });

    if (numResults === -1) {
        return allResults;
    }

    return allResults.slice(0, numResults);
};//»
_.findDistance = function(input, modelEntry) {//«
// Computes the sum of differances between an input and a modelEntry.
// @param {Array} input
// @param {Array} modelEntry
    var i = 0;
    var distance = 0;

    for (i = 0; i < Math.max(input.length, modelEntry.length); i++) {
        var modelVal = modelEntry[i] || 0;
        var inputVal = input[i] || 0;
        distance += Math.abs(modelVal - inputVal);
    }

    return distance;
};//»
_.generateFindDistanceForKeywordSpotting = function(modelEntryGreaterThanVal) {//«
// Will generate a distanceForKeywordSpotting function.
// The function will calculate differences for entries in the model that
// are greater than the parameter modelEntryGreaterThanVal.
// @param {Number} modelEntryGreaterThanVal
// @return {Function}

//  Calculates the keyword spotting distance an input is from a model entry.
//  @param {Array} input
//  @param {Array} modelEntry
//  @return {Number}

    return function(input, modelEntry) {
        var i = 0;
        var distance = 0;

        // Compare from the end of the input, for modelEntry.length entries
        for (i = 1; i <= modelEntry.length; i++) {
            var modelVal = modelEntry[modelEntry.length - i] || 0;
            var inputVal = input[input.length - i] || 0;
            if (modelVal > modelEntryGreaterThanVal) {
                distance += Math.abs(modelVal - inputVal);
            }
        }

        return distance;
    };
};//»
_.calcConfidence = function(distance, modelEntry) {//«
// Calculates a confidence value based on the distance form a model entry.
// Max confidence is 1, min is negative infinity.
// @param {Number} distance
// @param {Array} modelEntry
// @return {Number}
    var sum = 0;
    var i = 0;

    for (i = 0; i < modelEntry.length; i++) {
        sum += modelEntry[i];
    }

    return (1 - (distance / sum));
};//»
_.calculateNoise = function(input, modelEntry) {//«
// Calculates how noisy an input is compared to a model entry.
// @param {Array} input
// @param {Array} modelEntry
// @return {Number}
    var i = 0;
    var sumIn = 0;
    var sumEntry = 0;

    // Compare from the end of the input, for modelEntry.length entries
    for (i = 1; i <= modelEntry.length; i++) {
        var modelVal = modelEntry[modelEntry.length - i] || 0;
        var inputVal = input[input.length - i] || 0;
        sumIn += inputVal * inputVal;

        // TODO: Optimize by caching the calculation for the model
        sumEntry += modelVal * modelVal;
    }

    return (sumIn / sumEntry);
};//»

let mkspeechrec=()=>{speechRec = new JsSpeechRecognizer();}


//»

const {
failopts,cbok,cberr,wout,werr,termobj,normpath
}=shell_exports;

const coms = {//«

'vrec': function(){//«

//«
/*HTML«


var speechRec = new JsSpeechRecognizer();
speechRec.openMic();

$(document).ready(function() {
	// Add the handler for the button
	$("#startStopRecordingButton").click(function() {
		if (!speechRec.isRecording()) {
			var word = $("#currentWordText").val();
			speechRec.startTrainingRecording(word);

			// Update the UI
			$("#startStopRecordingButton").val("stop training");
			document.getElementById("testingStartStopRecordingButton").disabled = true;

		} else {
			var recordingId = speechRec.stopRecording();

			// Update the UI
			$("#startStopRecordingButton").val("start training");
			document.getElementById("testingStartStopRecordingButton").disabled = false;

			// Append to the results area
			var playbackDivId = "playbackResultId" + recordingId;
			var playButtonId = "playRecordingButton" + recordingId;
			var deleteButtonId = "deleteRecordingButton" + recordingId;

			var appendHtml = '<div id=' + playbackDivId + '>recording #' + recordingId;
			appendHtml += ' for word <b>' + $("#currentWordText").val() + '</b>';
			appendHtml += '<input type="button" class="playDeleteButton" value="play" id="' + playButtonId + '"" />';
			appendHtml += '<input type="button" class="playDeleteButton" value="delete" id="' + deleteButtonId + '" />';
			appendHtml += '</div>';

			$("#resultsDiv").append(appendHtml);

			// Add the play click functionality
			var finalPlaybackId = recordingId - 1;
			$("#" + playButtonId).click(function() {
				speechRec.playTrainingBuffer((finalPlaybackId));
			});

			// Add the delete click functionality
			$("#" + deleteButtonId).click(function() {
				$("#" + playbackDivId).hide();
				speechRec.deleteTrainingBuffer(finalPlaybackId);
				speechRec.generateModel();
			});

			// regenerate the model
			speechRec.generateModel();

		}
	});

	$("#testingStartStopRecordingButton").click(function() {
		if (!speechRec.isRecording()) {
			$("#testingStartStopRecordingButton").val("stop testing");
			document.getElementById("startStopRecordingButton").disabled = true;

			speechRec.startRecognitionRecording();
		} else {
			$("#testingStartStopRecordingButton").val("start testing");
			document.getElementById("startStopRecordingButton").disabled = false;

			speechRec.stopRecording();
			var result = speechRec.getTopRecognitionHypotheses(1);

			// Format and display results
			for (var i = 0; i < result.length; i++) {
				result[i].confidence = result[i].confidence.toFixed(3);
			}

			$("#testingResultsDiv").html("<h3>\"" + result[0].match + "\" - confidence: " + result[0].confidence + " </h3>");
		}
	});

});

»*/
/*«

// *************             Training           ******************

//Start recording

var word = "shirt";
speechRec.startTrainingRecording(word);

//Stop recording
var recordingId = speechRec.stopRecording();
var finalPlaybackId = recordingId - 1;
speechRec.generateModel();

//Play
speechRec.playTrainingBuffer((finalPlaybackId));

//Delete
speechRec.deleteTrainingBuffer(finalPlaybackId);
speechRec.generateModel();

// *************             Testing           ******************

//Start recording
speechRec.startRecognitionRecording();


//Stop
speechRec.stopRecording();
var result = speechRec.getTopRecognitionHypotheses(1);

// Format and display results
//for (var i = 0; i < result.length; i++) result[i].confidence = result[i].confidence.toFixed(3);
//Word: result[0].match
//Confidence: result[0].confidence


»*/
//»

let model=null;
var sws = failopts(args,{//«
	SHORT:{f: 3, c:1, g:1},
	LONG:{file: 3, create:1, gamepad:1}
});//»
if (!sws) return;

let fname = sws.file||sws.f;
let fullpath;
let do_create = sws.create||sws.c;
let do_gamepad = sws.gamepad||sws.g;
mkspeechrec();

function start_rec() {//«

if (model) speechRec.model = model;
let end = ()=>{termobj.response_end();}
let out = str=>{termobj.app_line_out(str);}
let err = str=>{termobj.app_line_out(str);end();}

//Gamepad«
let micon = false;
let gamepad_kill_cb;
let did_read = false;
let gp_interval;
let killed = false;
let turn_mic_off = ()=>{
	if (!speechRec) return;
	let stream = speechRec.stream;
	if (!stream) return;
	let tracks = stream.getTracks();
	if (!tracks) return;
	for (let tr of tracks) tr.stop();
	micon = false;

}
let kill_gp = ()=>{
	killed = true;
	if (gp_interval) clearInterval(gp_interval);
    if (gamepad_kill_cb) gamepad_kill_cb();
}

let keymap={//«
"A":"green",
"B":"red",
"X":"blue",
"Y":"yellow"
}//»
let try_gp_read=()=>{//«
	if (killed) return;
    if (gamepad_kill_cb) {
        gamepad_kill_cb();
        gamepad_kill_cb = null;
    }
	let gp_file = "/dev/gamepad/1";
err("Trying to read: "+gp_file);
    fs.read_device(gp_file, (e,kill_cb)=>{
        if (kill_cb) {
            gamepad_kill_cb=kill_cb;
            return
        }
        if (!e) return;
		parse(e);
    },{INTERVAL: true});
}//»


/*
let poll_gp =()=>{//«
    fs.get_all_gp_events(true);
    try{ 
        if (did_read) {
            if (!navigator.getGamepads()[0]) did_read = false;
            return;
        }
        if (navigator.getGamepads()[0]) try_gp_read();
    }   
    catch(e){}
}//»
*/
//gp_interval = setInterval(poll_gp, 50);
//»

let curword = null;
let is_training = false;
let is_testing = false;
let parse=e=>{//«
	let but = e.button;
	if (!but) return;
	let col = keymap[but];
	if (!col) return;
	let which = e.value;
	if (col=="red"){//«
		if (is_testing) return;
		if (which=="down"){
			if (!micon) return err("Mic not on!");
			if (!curword) return err("No curword");
			is_training = true;
			speechRec.startTrainingRecording(curword);
		}
		else {
			if (!curword) return;
			let rec_id = speechRec.stopRecording();
			let pb_id = rec_id - 1;
			speechRec.generateModel();
			is_training = false;
		}
	}//»
	else if (col=="blue"){//«
		if (is_training) return;
		if (which=="down"){
			if (!micon) return err("Mic not on!");
			is_testing = true;
			speechRec.startRecognitionRecording();
		}
		else {
			if (!micon) return;
			speechRec.stopRecording();
			let results = speechRec.getTopRecognitionHypotheses(1);
			let res = results[0]
			if (!res) return err("Nothing!");
			let word = res.match;
			let conf_val = res.confidence;
			let conf_str = conf_val.toFixed(3);
			err(word+": " + conf_str);
			is_testing = false;
		}
	}//»
}//»
let dosave=(cb)=>{//«
	if (!fullpath) return cb();
	fs.savefile(fullpath, JSON.stringify({modelBuffer:speechRec.modelBuffer, wordBuffer: speechRec.wordBuffer}), ret=>{
		if (!ret) out(fullpath+": could not save the file!");
		else out("Saved OK!");
		cb();
	});
}//»

termobj.init_app_mode("rec",//«
	str=>{//«
		if (str==="\n") return end();
		let arr = str.replace(/^ +/,"").replace(/ +$/,"").split(/ +/);
		let com = arr.shift();
		if (!com) return end();
		let arg1 = arr.shift();
		let arg2 = arr.shift();
		let arg3 = arr.shift();
		if (com.match(/^\./)){
			if (com==".on"){
				speechRec.openMic(ret=>{
					if (ret) {micon = true; end()}
					else err("Could not open the mic!");					
				});
			}
			else if (com==".save"){
				if (!fullpath) return err("No path specified!");
				dosave(end);
			}
			else if (com==".dump"){
log(speechRec.modelBuffer);
log(speechRec.wordBuffer);
log(speechRec.model);
				end();
			}
			else {
				err("Unknown command!");
			}
			return;
		}
		if (!arg1){
			curword = com;
			out("Setting current word to: " + curword);
			end();
			return;
		}
	},//»
	_=>{//«
log("KILL");
		kill_gp();
		turn_mic_off();
		cbok();
	}//»
);//»

if (do_gamepad) try_gp_read();

}//»

if (fname) {//«
	fullpath = normpath(fname);
//	gettextfile(fullpath, ret=>{
	arg2con(fullpath, ret=>{
		if (!ret){
			if (!do_create) return cberr("No file found and no create flag!");
		}
		else {
			try{
				let obj = JSON.parse(ret);
				speechRec.modelBuffer = obj.modelBuffer;
				speechRec.wordBuffer = obj.wordBuffer;
				speechRec.generateModel();
			}
			catch(e){
log(e);
				return cberr("Could not parse the contents");
			}
		}
		start_rec();
	})
}
else {
	wout("No file name given, so you can't save the model...");
	start_rec();
}//»

}//»

}//»
const coms_help={
}

if (!com) return Object.keys(coms);
if (!args) return coms_help[com];
if (!coms[com]) return cberr("No com: " + com + " in vox!");
if (args===true) return coms[com];
coms[com](args);

