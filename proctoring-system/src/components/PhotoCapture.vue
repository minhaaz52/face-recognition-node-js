<script setup>
import { reactive, ref, onMounted } from "vue"
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision"
// import vuePictureSwipe from "vue-picture-swipe"

const data = reactive({
    isCameraOpen: false,
    canvasHeight: 500,
    canvasWidth: 500,
    items: [],
})

const camera = ref(null)
const canvas = ref(null)
const downloadLink = ref(null)


onMounted(async()=>{
    const vision = await FilesetResolver.forVisionTasks(
    // path/to/wasm/root
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const facedetector = await FaceDetector.createFromOptions(
    vision,
    {
        baseOptions: {
            modelAssetPath: "../assets/blaze_face_short_range.tflite"
        },
        // runningMode: runningMode
    });

})


const toggleCamera = () => {
    if (data.isCameraOpen) {
        data.isCameraOpen = false;
        stopCameraStream();
    } else {
        data.isCameraOpen = true;
        startCameraStream();
    }
}

const startCameraStream = () => {
    console.log("startCameraStream")
    const constraints = (window.constraints = {
        audio: false,
        video: true
    });
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
            camera.value.srcObject = stream
            // console.log(stream)
            // this.$refs.camera.srcObject = stream;
        }).catch(error => {
            alert("Browser doesn't support or there is some errors." + error);
        });
}

const stopCameraStream = () => {
    console.log("stopCameraStream")
    // navigator.mediaDevices.getUserMedia({video:false})
    // let tracks = this.$refs.camera.srcObject?.getTracks();
    let tracks = camera.value.srcObject?.getTracks();

    tracks.forEach(track => {
        track.stop();
    });
}

const capture = () => {
    console.log("Capture")
    const FLASH_TIMEOUT = 50;
    setTimeout(() => {
        const context = canvas.value.getContext('2d');
        console.log("camera value", camera.value.srcObject)
        context.drawImage(camera.value, 0, 0, data.canvasWidth, data.canvasHeight);
        const dataUrl = canvas.value.toDataURL("image/jpeg")
            .replace("image/jpeg", "image/octet-stream");
        addToPhotoGallery(dataUrl);
        uploadPhoto(dataUrl);
        data.isCameraOpen = false;
        stopCameraStream();


        downloadLink.value.href = canvas.value.toDataURL('image/png');
        downloadLink.value.click()

    }, FLASH_TIMEOUT);
}


const addToPhotoGallery = (dataURI) => {
    console.log("addtoPhotoGallery")
    console.log(dataURI)
    data.items.push(
        {
            src: dataURI,
            thumbnail: dataURI,
            w: data.canvasWidth,
            h: data.canvasHeight,
            alt: 'some numbers on a grey background' // optional alt attribute for thumbnail image
        }
    )

    console.log("data.items :", data.items)
}

const uploadPhoto = (dataURL) => {
    console.log("uploadPhoto")
    let uniquePictureName = generateCapturePhotoName();
    let capturedPhotoFile = dataURLtoFile(dataURL, uniquePictureName + '.jpg')
    let formData = new FormData()
    formData.append('file', capturedPhotoFile)
    console.log("capturePhotoFile", capturedPhotoFile)
    // console.log("formData...", formData.values())
    // for (const v in formData.values()){
    //     console.log(v)
    // }
    // Upload image api
    // axios.post('http://your-url-upload', formData).then(response => {
    //   console.log(response)
    // })
}

const generateCapturePhotoName = () => {
    console.log("generateCapturePhotoName")
    return Math.random().toString(36).substring(2, 15)
}

const dataURLtoFile = (dataURL, filename) => {
    console.log("dataURLtoFile")
    let arr = dataURL.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


</script>

<template>
    <a ref="downloadLink" download="picture.png" style="cursor: pointer;">Download Image</a>

    <div class="camera-box">
        <div style="display: flex; justify-content: center;">
            <img style="height: 25px;" v-if="data.isCameraOpen"
                src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png" class="button-img camera-shoot"
                @click="capture" />
            <div class="camera-button">
                <button type="button" class="button is-rounded cam-button"
                    style="margin-left: 40%; background-color: white; border: 0px;" @click="toggleCamera">
                    <span v-if="!data.isCameraOpen"><img style="height: 25px;" class="button-img"
                            src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png"></span>
                    <span v-else><img style="height: 25px;" class="button-img"
                            src="https://img.icons8.com/material-outlined/50/000000/cancel.png"></span>
                </button>
            </div>
        </div>
        <div style="height: 200px">
            <div v-if="data.isCameraOpen" class="camera-canvas">
                <video ref="camera" :width="data.canvasWidth" :height="data.canvasHeight" autoplay></video>
                <canvas v-show="false" id="photoTaken" ref="canvas" :width="data.canvasWidth"
                    :height="data.canvasHeight"></canvas>
            </div>
        </div>

    </div>
</template>

<style scoped>
.camera-box {
    border: 1px dashed #d6d6d6;
    border-radius: 4px;
    padding: 2px;
    width: 80%;
    min-height: 300px;
}
</style>



