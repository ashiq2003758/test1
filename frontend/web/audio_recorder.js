window.audioChunks = [];
window.mediaRecorder = null;

window.startRecording = async function () {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    window.mediaRecorder = new MediaRecorder(stream);
    
    window.audioChunks = [];

    window.mediaRecorder.ondataavailable = event => {
        window.audioChunks.push(event.data);
    };
    
    window.mediaRecorder.start();
    console.log("Recording started...");
};

window.stopRecording = function () {
    if (window.mediaRecorder) {
        window.mediaRecorder.stop();
        window.mediaRecorder.onstop = () => {
            let blob = new Blob(window.audioChunks, { type: "audio/webm" });
            window.recordedFile = new File([blob], "recording.webm", { type: "audio/webm" });
            console.log("Recording stopped...");
        };
    } else {
        console.error("No recording in progress.");
    }
};

window.uploadAudio = async function () {
    return new Promise(async (resolve, reject) => {
        if (!window.recordedFile) {
            console.error("No audio recorded!");
            reject("No audio recorded!");  // Reject if no file is recorded
            return;
        }

        // Step 1: Upload the audio file to the first endpoint (http://localhost:3000/uploads)
        let formData = new FormData();
        formData.append("audio", window.recordedFile);

        try {
            // Uploading the file to the first server
            let uploadResponse = await fetch("http://localhost:4000/uploads", {
                method: "POST",
                body: formData,
            });

            // Check if upload was successful
            if (!uploadResponse.ok) {
                throw new Error(`Upload failed with status: ${uploadResponse.status}`);
            }

            // Get the upload response JSON (for logging purposes)
            let uploadResult = await uploadResponse.json();
            console.log("Upload successful:", uploadResult);

            // Step 2: Send the file to the second server for prediction using Axios
            let predictionFormData = new FormData();
            predictionFormData.append("file", window.recordedFile); // Send file as "file"
            
            // Check if the file is actually in FormData
            console.log("Prediction FormData:", predictionFormData);

            // Send the file to the prediction endpoint using Axios
            axios.post("http://localhost:5000/upload", predictionFormData)
                .then(response => {
                    let prediction = response.data.prediction;

                    // Keep checking until the prediction is one of the valid outputs
                    const validPredictions = ["Happy", "Tired"];  // List of acceptable outputs

                    if (validPredictions.includes(prediction)) {
                        console.log("Prediction:", prediction);
                        resolve(prediction);  // Resolve with the actual prediction result
                    } else {
                        // Keep retrying or wait for a valid prediction (could also set a timeout here)
                        console.log("Waiting for a valid prediction...");
                        setTimeout(() => {
                            // You can retry the request or handle it accordingly
                            console.error("Prediction is not valid. Retrying...");
                            reject("Invalid prediction received."); // Reject if invalid prediction persists
                        }, 2000);  // Set a retry interval (optional)
                    }
                })
                .catch(error => {
                    console.error("Error during prediction:", error);
                    reject(error.message || "Prediction request failed.");  // Reject with error message
                });

        } catch (error) {
            console.error("Error during the upload or prediction process:", error);
            reject(error.message || "Error during the process!");  // Reject with the error message
        }
    });
};
