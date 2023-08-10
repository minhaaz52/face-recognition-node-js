<script setup>
// import * as faceapi from 'face-api.js';
import { onMounted, ref, reactive } from "vue"
// import Questions from "../models"
// import * from "../../models"
// import * as vision from '@google-cloud/vision';

// const client = new vision.ImageAnnotatorClient();
import * as faceapi from "face-api.js"
// import * as MediaRecorder from "media-recorder-js"


const video = ref(null);
// const liveView = ref(null);
// const enableWebcamButton = ref(null);
const canvas = ref(null);

const data = reactive({
    labeledFaceDescriptors: null,
    faceMatcher: null,
    canvas: null,
    noFaceDetected: false,
    multipleFacesDetected: false,
    cameraStopped: false,
})

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

onMounted(async () => {

    // return Promise.all([
    // faceapi.loadFaceRecognitionModel('/models'),
    //     faceapi.loadFaceLandmarkModel('/models'),
    //     faceapi.loadTinyFaceDetectorModel('/models'),
    //     faceapi.loadFaceExpressionModel('/models')
    //   ])

    // faceapi.loadFaceRecognitionModel('/models')
    // faceapi.loadFaceLandmarkModel('/models')
    // faceapi.loadTinyFaceDetectorModel('/models')
    // faceapi.loadFaceExpressionModel('/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')

    data.labeledFaceDescriptors = await loadLabeledImages();
    data.faceMatcher = new faceapi.FaceMatcher(data.labeledFaceDescriptors, 0.6)
})

const loadLabeledImages = async () => {
    // const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    const label = "Minhaaz"
    const descriptions = []
    const img = await faceapi.fetchImage("/Minhaaz_pic.jpg")
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
    descriptions.push(detections.descriptor)
    return new faceapi.LabeledFaceDescriptors(label, descriptions)
}


const enableCamera = () => {
    data.cameraStopped = false;

    // fetch('http://localhost:3500/check', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         "name":"Minhaaz",
    //         "role":"Software developer"
    //         // Your request data
    //     })
    // })
    //     .then(response => response.json())
    //     .then(data => {
    //         // Handle response data
    //         console.log(data);
    //     });

    // console.log("entered")
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function async(stream) {
            video.value.srcObject = stream;
            // predictWebcam()
            video.value.addEventListener('loadeddata', predictWebcam);
        })
        .catch((err) => {
            alert("Can't access camera \n" + err)
            // console.error(err);
        });

    // navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    //     video.value.srcObject = stream;

    //     video.value.addEventListener("loadeddata", (e) => {
    //         // console.log(e)
    //         //     const formData = new FormData();
    //         // formData.append('video', e.data);
    //         // fetch("http://localhost:3500/check", {
    //         //     method: "POST",
    //         //     body: formData
    //         // })
    //     })

    // const mediaRecorder = new MediaRecorder(stream);

    // // Listen for dataavailable event
    // mediaRecorder.addEventListener('dataavailable', e => {
    //     const formData = new FormData();
    //     formData.append('video', e.data);

    //     fetch('http://localhost:3500/check', {
    //         method: 'POST',
    //         body: formData
    //     });
    //     // Send recorded data to server
    //     // console.log(e.data)
    //     // fetch('http://localhost:3500/check', {
    //     //     method: 'POST',
    //     //     body: e.data
    //     // });
    // });

    // Start recording
    // mediaRecorder.start();
    // })

}

const stopCamera = async () => {
    data.cameraStopped = true;
    // await navigator.mediaDevices.getUserMedia({video:false})
    const canvasCtx = canvas.value.getContext("2d")

    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    if (!video.value || !video.value.srcObject) {
        return;
    }

    // video.value.removeEventListener('loadeddata', predictWebcam);

    let tracks = video.value.srcObject?.getTracks();

    tracks.forEach(track => {
        track.stop();
    });
}

const predictWebcam = async () => {

    if (data.cameraStopped)
        return;

    // console.log("predict")
    // alert("Minhaaz!!!")

    // const ctx = canvas.value.getContext("2d");
    // ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    // const stream = video.value.srcObject;

    // // Create a new MediaRecorder instance
    // const mediaRecorder = new MediaRecorder(stream);

    // // Add event listener for dataavailable event
    // mediaRecorder.addEventListener('dataavailable', event => {
    //     // Handle recorded data
    //     console.log(event.data);

    //     const formData = new FormData();
    //     formData.append('video', event.data);

    //     fetch('http://localhost:3500/check', {
    //         method: 'POST',
    //         body: formData
    //     });

    // });

    // Start recording
    // mediaRecorder.start();

    setInterval(async () => {

        const ctx = canvas.value.getContext("2d");

        ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)

        // Get a data URL representing the image data in the canvas
        const dataURL = canvas.value.toDataURL();

        fetch('http://localhost:3500/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: dataURL })
        });

        // console.log("setInterval")
        // mediaRecorder.requestData()
        // // const t=document.querySelector("video")
        // // const stream=t.srcObject

        // const stream = video.value.srcObject

        // const mediaRecorder = new MediaRecorder(stream);

        // // Add event listeners and start recording
        // mediaRecorder.addEventListener('dataavailable', event => {
        //     // Handle recorded data
        //     console.log("entered")
        //     console.log(event.data);
        // });
        // mediaRecorder.start();

    }, 1000)
    // const displaySize = { width: video.value.width, height: video.value.height }

    // const detections = await faceapi.detectAllFaces(video.value).withFaceLandmarks().withFaceDescriptors()
    // const resizedDetections = faceapi.resizeResults(detections, displaySize)
    // // console.log("resizedDetections...>>>", resizedDetections)
    // const results = resizedDetections.map(d => data.faceMatcher.findBestMatch(d.descriptor))
    // // console.log("results...>>>", results)

    // const canvasCtx = canvas.value.getContext("2d")

    // // canvasCtx.save();
    // canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    // results.forEach((result, i) => {
    //     const bbox = resizedDetections[i].detection.box;
    //     canvasCtx.beginPath();
    //     canvasCtx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
    //     // canvasCtx.label=result.label
    //     canvasCtx.strokeStyle = 'red';
    //     canvasCtx.lineWidth = 4;
    //     canvasCtx.stroke();


    //     const label = result.label;
    //     const fontSize = 18;
    //     canvasCtx.font = `${fontSize}px sans-serif`;
    //     canvasCtx.fillStyle = 'red';
    //     canvasCtx.fillText(label, bbox.x, bbox.y - 5);

    //     // console.log(result.label)
    // })

    // if (results.length > 0) {
    //     console.log(results)
    //         const canvasCtx = canvas.value.getContext("2d")

    //         // canvasCtx.save();
    //         canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    //         //     canvasCtx.drawImage(
    //         //         video.value.srcObject.image,
    //         //         0,
    //         //         0,
    //         //         canvas.value.width,
    //         //         canvas.value.height
    //         //     );

    //         // for (const detection of results) {
    //         //     console.log(detection)
    //             // const bbox = detection.boundingBox;
    //             // canvasCtx.beginPath();
    //             // canvasCtx.rect(bbox.originX, bbox.originY, bbox.width, bbox.height);
    //             // canvasCtx.strokeStyle = 'red';
    //             // canvasCtx.lineWidth = 4;
    //             // canvasCtx.stroke();
    //         // }
    //     }



    // window.requestAnimationFrame(predictWebcam);
}



</script>

<template>
    <!-- <div>
        <h2>Minhaaz</h2>
    </div> -->
    <div>
        <!-- <img id="reference-photo" src="../assets/Minhaaz_pic.jpg" style="height: 10px; width: 10px;" /> -->
        <!-- <video ref="videoTemp" width="640" height="480" autoplay></video> -->
        <button @click="enableCamera">Open Cameras</button>
        <button @click="stopCamera">Stop Camera</button>
        <video ref="video" style="position: absolute;" width="640" height="480" autoplay></video>
        <canvas ref="canvas" style="position: absolute;" width="640" height="480"></canvas>
    </div>
</template>