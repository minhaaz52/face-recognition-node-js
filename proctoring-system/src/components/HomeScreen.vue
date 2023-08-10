<script setup>

import { onBeforeMount, onBeforeUnmount, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { db, messaging } from "../../firebase"
import { arrayUnion, doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { getToken } from "firebase/messaging"

// import { FaceDetector } from '@mediapipe/tasks-vision';
import FaceDetection from './FaceDetection.vue';
import FaceRecognition from './FaceRecognition.vue';

// import {PhotoCapture, VideoCapture} from 'vue-media-recorder'
// import {PhotoCapture} from "vue-media-recorder"
import PhotoCapture from "../components/PhotoCapture.vue"
import Camera from 'simple-vue-camera';


const myRouter = useRouter()

// instructions for test
const data = reactive({
    rules: ["No screen shot", "No screen recording", "No right click", "No tab switching", "No browser minimizing", "No google search"],
    imageBase64: "",
    imgs: [],
    styling: {
        'max-width': '60%'
    }
})

// demo user
const userName = "user1"
const testName = "test1"

// checking user info before entering test and redirecting user to test screen
const testScreen = async () => {

    const testRef = doc(db, "proctoredTests", testName)
    const testData = await getDoc(testRef)

    // check if test is active or not
    if (!testData.data().isActive) {
        alert("Test has already been finished")
        return
    }

    const docRef = doc(testRef, userName, "testDetails")
    const data = await getDoc(docRef)


    // check if user has already completed test
    if (data.data().testCompleted) {
        alert("Test has already been submitted")
        return
    }

    // check if user has already started test. 
    // this is to avoid single user log in from different devices in same test
    if (data.data().testStarted) {
        alert("Test has already been started")
        return
    }

    // if all above values are not true, redirect user to start test page.
    try {

        // fetch current time
        const date = new Date()
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const currentTime = `${hours}:${minutes}:${seconds}`;

        await updateDoc(docRef, {
            testStarted: true,
            activities: [{
                "activity": "Started",
                "time": currentTime
            }]
        })
        myRouter.replace({
            name: "test"
        })
    } catch (err) {
        console.log(err)
    }
}

const face_fun = async () => {

    const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const facedetector = await FaceDetector.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath: "path/to/model"
            },
            runningMode: runningMode
        });
}


// const createTest = async (testName) => {
//     try {
//         const docRef = doc(db, "proctoredTests", testName)
//         const d = await getDoc(docRef)
//         if (!d.exists()) {
//             await setDoc(docRef, {
//                 isActive: false,
//                 date_created: currDate,
//                 users: []
//             })
//         }
//         console.log("test created")
//     } catch (err) {
//         console.log(err)
//     }
// }



// create a user for test
const createUser = async (testName, userName) => {
    try {

        // fetch current date
        const dateObj = new Date()
        const date = String(dateObj.getDate()).padStart(2, "0")
        const month = String(dateObj.getMonth()).padStart(2, "0")
        const yr = String(dateObj.getFullYear()).padStart(2, "0")

        const currDate = `${date}/${month}/${yr}`


        const batch = writeBatch(db);
        const testRef = doc(db, "proctoredTests", testName);

        // if test doesn't exist, create a test
        if (!(await getDoc(testRef)).exists()) {
            batch.set(testRef, {
                isActive: true,
                date_created: currDate,
                users: []
            });
        }

        batch.update(testRef, {
            users: arrayUnion(userName)
        })

        // create user with default values
        const userRef = doc(testRef, userName, "testDetails")
        batch.set(userRef, {
            name: userName,
            email: userName + "@test.com",
            blueFlags: { "Screenshot": 1, "Switch Tab/Browser": 1, "Copy/Paste": 1, "Exit Fullscreen": 1 },
            orangeFlags: { "Screenshot": 2, "Switch Tab/Browser": 1, "Copy/Paste": 2, "Exit Fullscreen": 1 },
            redFlags: { "Screenshot": 2, "Switch Tab/Browser": 1, "Copy/Paste": 2, "Exit Fullscreen": 1 },
            activities: [],
            testCompleted: false,
            testStarted: false,
        })
        // commit all changes
        await batch.commit()




        console.log("batch written")
    } catch (err) {
        console.log(err)
    }
}

onMounted(() => {
    data.imgs = JSON.parse(localStorage.getItem("thumbnails"));
    if (!data.imgs) data.imgs = [];
    window.addEventListener("beforeunload", refresh)
})

// onBeforeUnmount(()=>{
//     window.addEventListener("beforeunload", refresh);
// })

const refresh=(e)=>{
    console.log("refreshed")
    // e.preventDefault();
    // e.returnValue="";
}

const handleDone = (imgBase64) => {
    data.imgs.push(imgBase64);
    localStorage.setItem("thumbnails", JSON.stringify(data.imgs));
}

const clear = () => {
    localStorage.clear();
    data.imgs = [];
}

</script>

<template>
    <div >
        <!-- <div class="header">
            <h1>Proctoring App</h1>
        </div>
        <div>
            <button @click="createUser(testName, userName)">Create User</button>
            <h2>Instructions:</h2>
            <ul>
                <li v-for="rule in data.rules">{{ rule }}</li>
            </ul>
        </div>
 -->
        <!-- <PhotoCapture/> -->
        <!-- <h2>Minhaaz</h2> -->
        <!-- <FaceDetection/> -->
        <FaceRecognition/>

        <!-- <section class="single-video">
            <PhotoCapture :styling="data.styling" @input="handleDone" />
            <div class="galleries-container">
                <div class="img-list" v-if="data.imgs.length">
                    <span>
                        <h1>Look At Yourself!</h1>
                        <button @click="clear" class="btn">CLEAR</button>
                    </span>
                    <ImgList :imgs="data.imgs" />
                </div>
            </div>
        </section> -->

        <!-- <camera :resolution="{ width: 375, height: 812 }" autoplay></camera> -->

        <!-- <div class="footer">
            <button @click="testScreen">Start</button>
        </div> -->
    </div>
</template>


<!-- <style scoped>
.footer {
    background-color: aqua;
    position: absolute;
    bottom: 10px;
    height: 30px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

button {
    margin-right: 10px;
    width: auto;
    cursor: pointer;
}

.header {
    margin: 0px;
    padding: 0px;
    text-align: center;
    background-color: antiquewhite;
    height: 50px;
}
</style> -->

<style lang="scss" scoped>
.photo-capture {
    max-width: 60% !important;
}

.single-video {
    display: flex;
    flex-direction: column;
    align-items: center;
    // flex-wrap: wrap;
    height: 100vh;

    .galleries-container {
        display: flex;
        // flex-direction:column;
        justify-content: center;

        &>* {
            margin: 0 10px;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(65, 65, 65, 0.3);
            height: 480px;
        }

        .img-list {
            padding: 10px;

            span {
                display: flex;
                align-items: center;
                justify-content: space-around;
                width: 100%;
                font-size: 1.5rem;
            }
        }
    }
}
</style>


