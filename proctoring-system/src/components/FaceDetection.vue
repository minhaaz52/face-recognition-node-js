<script setup>
// import {
//     FaceDetector,
//     FilesetResolver,
// } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

import {
    FaceDetector,
    FilesetResolver,
    FaceLandmarker, DrawingUtils
} from "@mediapipe/tasks-vision";


import { ref, onMounted, reactive } from 'vue';

const video = ref(null);
const liveView = ref(null);
const enableWebcamButton = ref(null);
const canvas = ref(null);

// const faceDetector = await FaceDetector.createFromOptions(vision, {
//     baseOptions: {
//       modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
//       delegate: "GPU"
//     },
//     runningMode: runningMode
//   });

let faceDetector;
let faceLandmarker;

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// console.log("hasGetUserMedia...", hasGetUserMedia())

let children = [];
let runningMode = "VIDEO"

const data = reactive({
    noFaceDetected: false,
    multipleFacesDetected: false,
    cameraStopped: false,
    arr:[],
})

// function requestPermission() {
//         console.log('Requesting permission...');
//         Notification.requestPermission().then((permission) => {
//             if (permission === 'granted') {
//                 return true;
//                 // console.log('Notification permission granted.');
//             }
//             else{
//                 alert("Please give camera access");
//                 return false;
//             }
//         })
//     }

onMounted(async () => {

    const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU"
        },
        runningMode: runningMode
    });

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
    });


    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    try {
        // await navigator.mediaDevices.getUserMedia({video:true})
        // const perm=await navigator.mediaDevices.getUserMedia
        if (hasGetUserMedia()) {
            enableWebcamButton.value = document.getElementById('webcamButton');
            // enableWebcamButton.value.addEventListener('click', enableCam);
        } else {
            alert("Can't access camera")
        }
    } catch (err) {
        alert("Can't access camera ");
    }
});

async function enableCam(event) {
    // console.log(hasGetUserMedia())
    // try{
    //     navigator.mediaDevices?.getUserMedia
    //     // if (! hasGetUserMedia()){
    //     //     alert("Can't access camera")
    //     //     return;
    //     // }
    // }catch(err){
    //     // console.log(err)
    //     alert("Can't access camera 2");
    //     return;
    // }

    // const permission=requestPermission();
    // console.log(permission)
    // if (!permission){
    //     return;
    // }

    if (!faceDetector) {
        alert('Face Detector is still loading. Please try again..');
        return;
    }

    data.cameraStopped = false;

    // enableWebcamButton.value.classList.add('removed');

    // getUsermedia parameters
    const constraints = {
        video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function async(stream) {
            video.value.srcObject = stream;
            // predictWebcam()
            video.value.addEventListener('loadeddata', predictWebcam);
        })
        .catch((err) => {
            alert("Can't access camera \n" + err)
            // console.error(err);
        });
}

const stopCamera = async () => {
    data.cameraStopped = true;
    // await navigator.mediaDevices.getUserMedia({video:false})
    if (!video.value || !video.value.srcObject) {
        return;
    }
    const canvasCtx = canvas.value.getContext("2d")

    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    // video.value.removeEventListener('loadeddata', predictWebcam);

    let tracks = video.value.srcObject?.getTracks();

    tracks.forEach(track => {
        track.stop();
    });
}

let lastVideoTime = -1;

async function predictWebcam() {
    // console.log("predictWebCam")
    if (data.cameraStopped)
        return;

    if (runningMode !== 'VIDEO') {
        runningMode = 'VIDEO';
        await faceDetector.setOptions({ runningMode: 'VIDEO' });
    }
    let startTimeMs = performance.now();
    // console.log(startTimeMs)

    // Detect faces using detectForVideo
    if (video.value.currentTime !== lastVideoTime) {
        lastVideoTime = video.value.currentTime;
        const detections = faceDetector
            .detectForVideo(video.value, startTimeMs).detections;
        // console.log("faces...", detections.length)

        const results = faceLandmarker.detectForVideo(video.value, startTimeMs);
        // console.log("results...>>>", results.faceLandmarks)
        data.arr.push(FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS)

        if (results.faceLandmarks) {
            const ctx = canvas.value.getContext("2d");
            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
            for (const landmarks of results.faceLandmarks) {
                const drawingUtils = new DrawingUtils(ctx);
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                    { color: "#C0C0C070", lineWidth: 1 }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: "#FF3030" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                    { color: "#FF3030" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: "#30FF30" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                    { color: "#30FF30" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                    { color: "#E0E0E0" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LIPS,
                    { color: "#E0E0E0" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                    { color: "#FF3030" }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                    { color: "#30FF30" }
                );
                console.log("left eye :",FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS)
            }
        }

        // console.log(detections)

        // if (detections.length > 0) {
        //     const canvasCtx = canvas.value.getContext("2d")

        //     // canvasCtx.save();
        //     canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
        //     //     canvasCtx.drawImage(
        //     //         video.value.srcObject.image,
        //     //         0,
        //     //         0,
        //     //         canvas.value.width,
        //     //         canvas.value.height
        //     //     );

        //     for (const detection of detections) {
        //         const bbox = detection.boundingBox;
        //         canvasCtx.beginPath();
        //         canvasCtx.rect(bbox.originX, bbox.originY, bbox.width, bbox.height);
        //         canvasCtx.strokeStyle = 'red';
        //         canvasCtx.lineWidth = 4;
        //         canvasCtx.stroke();
        //     }
        // }


        // if (detections.length === 0 && data.noFaceDetected === false) {
        //     const canvasCtx = canvas.value.getContext("2d")
        //     canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
        //     data.noFaceDetected = true;
        //     console.log("entered")
        //     setTimeout(() => {
        //         console.log("no person detection ended")
        //         data.noFaceDetected = false;
        //     }, 5000)
        // }
        // else if (detections.length === 2 && data.multipleFacesDetected === false) {
        //     data.multipleFacesDetected = true;
        //     setTimeout(() => {
        //         console.log("multiple persons detected ended")
        //         data.multipleFacesDetected = false;
        //     })
        // }
        // displayVideoDetections(detections);
    }

    // Call this function again to keep predicting when the browser is ready
    window.requestAnimationFrame(predictWebcam);
}


// function displayVideoDetections(detections) {
//     // console.log("detected faces....", detections.length)
//     // Remove any highlighting from previous frame.

//     for (let child of children) {
//         liveView.value.removeChild(child);
//     }
//     children.splice(0);

//     // Iterate through predictions and draw them to the live view
//     for (let detection of detections) {
//         const p = document.createElement('p');
//         p.innerText =
//             'Confidence: ' +
//             Math.round(parseFloat(detection.categories[0].score) * 100) +
//             '% .';
//         p.style =
//             'left: ' +
//             (video.value.offsetWidth -
//                 detection.boundingBox.width -
//                 detection.boundingBox.originX) +
//             'px;' +
//             'top: ' +
//             (detection.boundingBox.originY - 30) +
//             'px; ' +
//             'width: ' +
//             (detection.boundingBox.width - 10) +
//             'px;';

//         const highlighter = document.createElement('div');
//         highlighter.setAttribute('class', 'highlighter');
//         highlighter.style =
//             'left: ' +
//             (video.value.offsetWidth -
//                 detection.boundingBox.width -
//                 detection.boundingBox.originX) +
//             'px;' +
//             'top: ' +
//             detection.boundingBox.originY +
//             'px;' +
//             'width: ' +
//             (detection.boundingBox.width - 10) +
//             'px;' +
//             'height: ' +
//             detection.boundingBox.height +
//             'px;';

//         liveView.value.appendChild(highlighter);
//         liveView.value.appendChild(p);

//         // Store drawn objects in memory so they are queued to delete at next call
//         children.push(highlighter);
//         children.push(p);
//         for (let keypoint of detection.keypoints) {
//             const keypointEl = document.createElement('spam');
//             keypointEl.className = 'key-point';
//             keypointEl.style.top = `${keypoint.y * video.value.offsetHeight - 3}px`;
//             keypointEl.style.left = `${video.value.offsetWidth - keypoint.x * video.value.offsetWidth - 3
//                 }px`;
//             liveView.value.appendChild(keypointEl);
//             children.push(keypointEl);
//         }
//     }
// }


</script>

<template>
    <div ref="liveView">
        <button id="webcamButton" @click="enableCam">Enable Webcam</button>
        <button @click="stopCamera">Stop Camera</button>
        <video ref="video" style="position: absolute;" width="640" height="480" autoplay></video>
        <canvas ref="canvas" style="position: absolute;" width="640" height="480"></canvas>
    </div>
    <div style="position: relative;" v-for="pt in data.arr">{{ pt }}</div>
</template>

<style scoped></style>
