import 'dart:async';
import 'dart:js' as js;
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: AudioRecorderScreen(),
    );
  }
}

class AudioRecorderScreen extends StatefulWidget {
  @override
  _AudioRecorderScreenState createState() => _AudioRecorderScreenState();
}

class _AudioRecorderScreenState extends State<AudioRecorderScreen> {
  String _predictionResult = '';

  // Method to call JavaScript's startRecording function
  void startRecording() {
    js.context.callMethod('startRecording');
  }

  // Method to call JavaScript's stopRecording function
  void stopRecording() {
    js.context.callMethod('stopRecording');
  }

  // Method to upload audio and handle prediction result
  void uploadAudio() async {
    try {
      // Call JS method to upload audio and handle prediction
      var result = await _waitForPrediction();

      // Log the prediction result (now that the promise has resolved)
      print("Prediction result from JS: $result");

      // Update the UI with the prediction result
      setState(() {
        _predictionResult = result.toString();
      });
    } catch (e) {
      print("Error: $e");
      setState(() {
        _predictionResult = 'Error: $e';  // Display error message in UI
      });
    }
  }

  // Method to wait for prediction result with retries and validation
  Future<String> _waitForPrediction() async {
    const int maxRetries = 5;  // Max retries before giving up
    const Duration retryDelay = Duration(seconds: 2);  // Delay between retries
    int retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Call the JavaScript function and await the result
        var result = await js.context.callMethod('uploadAudio');  

        // Check if the result is valid
        if (result == "Happy" || result == "Tired") {
          return result;  // Return the prediction if it's valid
        } else {
          print("Waiting for valid prediction...");
          retryCount++;
          await Future.delayed(retryDelay);  // Wait before retrying
        }
      } catch (e) {
        print("Error during prediction attempt: $e");
        retryCount++;
        await Future.delayed(retryDelay);  // Wait before retrying
      }
    }

    throw TimeoutException("Prediction did not return a valid result within the retry limit.");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Audio Recorder")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text("Prediction: $_predictionResult", style: TextStyle(fontSize: 20)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: startRecording,
              child: Text("Start Recording"),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: stopRecording,
              child: Text("Stop Recording"),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: uploadAudio,
              child: Text("Upload and Get Prediction"),
            ),
          ],
        ),
      ),
    );
  }
}
