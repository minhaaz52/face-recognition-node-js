<script setup>
import { doc, collection, onSnapshot, updateDoc, getDoc, arrayUnion, writeBatch, setDoc, increment, FieldValue } from "firebase/firestore"
import { db } from "../../firebase"
import { reactive, ref, onMounted, onBeforeUnmount, watch, onUnmounted, computed } from "vue";
import { questions } from "../assets/Questions";
import { useRouter } from "vue-router"

// const MAX_ORANGE_FLAGS = 5
// const MAX_RED_FLAGS = 3

const myRouter = useRouter()

// user details
const userName = "user1"
const testName = "test1"

// ref to handle tabSwitch. Because, for a single tabSwitch, it detect 2 switches, one for going and one for coming back.
const tabSwitch = ref(true)

// ref to check for full screen
const isFullScreen = ref(false)

// boolean to show custom warning message
const isConfirmationOpen = ref(false);

// boolean to show warning for full screen exit
const fullScreenWarning = ref(false);

// selected options details and question
const quesData = reactive({
    optn: [],
    currQues: 0,
})

// test time.
const time = reactive({
    hr: 0,
    min: 1,
    sec: 0,
})

// for interval
const timer = ref(null)

const redwarningtype = ref(false)


// timer for test
const startTimer = () => {
    timer.value = setInterval(async () => {
        time.sec--
        if (time.hr === 0 && time.min === 0 && time.sec <= 0) {
            stopTimer()
            await eliminateTest()
            return;
        }

        if (time.sec <= 0) {
            time.min--
            time.sec = 59
        }

        if (time.min < 0) {
            if (time.hr > 0) {
                time.hr--
                time.min = 59
            }
        }

    }, 1000);
}

// clear timer
const stopTimer = () => {
    clearInterval(timer.value);
}

// updates backend depending on user activity
const activityHandler = async (activity) => {
    try {
        const docRef = doc(db, "proctoredTests", testName, userName, "testDetails")
        const d = await getDoc(docRef)

        // fetch current time
        const date = new Date();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const currentTime = `${hours}:${minutes}:${seconds}`;

        // add activity to activities array
        const newActivity = d.data().activities
        newActivity.push({
            "activity": activity,
            "time": currentTime
        })

        // update activities
        await updateDoc(docRef, {
            activities: newActivity
        })

        // check if given activity is one of the violating activities
        if (!(activity in d.data().blueFlags))
            return;

        // check if blueflags are remaining for activity
        if (d.data().blueFlags[activity] > 0) {
            const newBlue = d.data().blueFlags
            newBlue[activity] -= 1
            await updateDoc(docRef, {
                blueFlags: newBlue
            })
            return;
        }

        // check if orangeflags are remaining for activity
        if (d.data().orangeFlags[activity] > 0) {
            const newOrange = d.data().orangeFlags
            newOrange[activity] -= 1
            await updateDoc(docRef, {
                orangeFlags: newOrange
            })
            return;
        }

        // check if redflags are remaining for activity
        if (d.data().redFlags[activity] > 0) {
            const newRed = d.data().redFlags
            newRed[activity] -= 1
            await updateDoc(docRef, {
                redFlags: newRed
            })
            return;
        }

        // if none of the above conditions are true, it means user has crossed allowed violations. Hence, eliminate test
        eliminateTest();

    } catch (err) {
        console.log(err)
        alert("Something went wrong")
    }
}



// function to eliminate test
const eliminateTest = async () => {
    try {
        const docRef = doc(db, "proctoredTests", testName, userName, "testDetails")
        const d = await getDoc(docRef)

        // fetch current time
        const date = new Date();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const currentTime = `${hours}:${minutes}:${seconds}`;

        // update data of test in backend
        const newActivity = d.data().activities
        newActivity.push({
            "activity": "Completed",
            "time": currentTime
        })

        await updateDoc(docRef, {
            testCompleted: true,
            activities: newActivity
        })
        myRouter.replace({
            name: "exit"
        })
    } catch (err) {
        console.log(err)
    }
}

// onSnapshot(doc(db, "proctoredTests", testName, userName, "testDetails"), async (d) => {
//     try {
//         const currState = d.data()
//         if (currState.orangeFlags.length >= MAX_ORANGE_FLAGS || currState.redFlags.length >= MAX_RED_FLAGS) {
//             await eliminateTest()
//             console.log("eliminated")
//         }
//     } catch (err) {
//         // console.log("Something went wrong")
//         alert("Something went wrong")
//         myRouter.replace({
//             name: "home"
//         })
//     }
// })

// full screen code


// enter full screen mode. multiple if conditions is given to handle different browsers
const enterFullScreen = () => {
    try {
        if (!isFullScreen.value) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            isFullScreen.value = true
        }
    } catch (err) {
        console.log(err)
    }
};

// exit full screen mode
const exitFullScreen = () => {
    try {
        if (isFullScreen.value) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            isFullScreen.value = false
        }
    } catch (err) {
        console.log(err)
    }
};

// open warning message box
const openConfirmation = () => {
    isConfirmationOpen.value = true;
};

// confirm action on warning message
const confirmAction = () => {
    isConfirmationOpen.value = false;
};


// called when test screen is shown
onMounted(() => {
    enterFullScreen()
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    for (let i = 0; i < questions.length; i++) {
        quesData.optn.push(null)
    }
    startTimer()
    window.addEventListener("keyup", handleScreenShot);
    document.addEventListener('visibilitychange', handleVisibilityChange);
})


// resources are released when screen is unmounted
onBeforeUnmount(() => {
    exitFullScreen()
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    stopTimer()
    window.removeEventListener("keyup", handleScreenShot)
    document.removeEventListener('visibilitychange', handleVisibilityChange);
})


// handle tab switching
const handleVisibilityChange = async () => {
    if (tabSwitch.value){
        activityHandler("Switch Tab/Browser")
        openConfirmation()
    }
    tabSwitch.value=!tabSwitch.value
}


// handle screen shot
const handleScreenShot = (event) => {
    if (event.key === "PrintScreen") {
        activityHandler("Screenshot")
        openConfirmation()
    }
}

// handle full screen change
const handleFullscreenChange = () => {
    isFullScreen.value = !!document.fullscreenElement;
    if (!isFullScreen.value) {
        activityHandler("Exit Fullscreen")
        fullScreenWarning.value = true;
    }
    else {
        fullScreenWarning.value = false;
    }
}

// go to previous question
const prevQues = () => {
    if (quesData.currQues > 0)
        quesData.currQues--
}

// go to next question
const nextQues = () => {
    if (quesData.currQues < questions.length - 1)
        quesData.currQues++
}

// save clicked option
const optionClicked = (val, ind) => {
    quesData.optn[quesData.currQues] = ind
}

// function to call for finishtest
// const finishTest = async () => {
//     await eliminateTest()
// }

// handle copy
const handleCopy = (e) => {
    e.preventDefault()
    activityHandler("Copy/Paste")
    openConfirmation()
    // orangeFlagActivity(null, "Copy")
}

// handle cut
const handleCut = (e) => {
    e.preventDefault()
    activityHandler("Copy/Paste")
    openConfirmation()
    // orangeFlagActivity(null, "Cut")
}

// handle paste
const handlePaste = (e) => {
    e.preventDefault()
    activityHandler("Copy/Paste")
    openConfirmation()
    // orangeFlagActivity(null, "Paste")
}

// handle right click
const rightClickHandle = (e) => {
    e.preventDefault();
    activityHandler("Right Click")
    openConfirmation()
}

</script>

<template>
    <div class="root" @click.right="rightClickHandle" @copy="handleCopy" @cut="handleCut" @paste="handlePaste">
        <div v-if="isConfirmationOpen" class="confirmation-box">
            <div class="confirmation-message">
                <h2>Warning !!!</h2>
            </div>
            <div class="confirmation-actions">
                <button @click="confirmAction">Ok</button>
            </div>
        </div>

        <div v-if="fullScreenWarning" class="confirmation-box">
            <div class="confirmation-message">
                <h2>Warning !!!</h2>
                <h3>Do you want to eliminate test?</h3>
            </div>
            <div class="confirmation-actions">
                <button @click="eliminateTest">Ok</button>
                <button @click="enterFullScreen">Re-Enter in test</button>

            </div>
        </div>

        <div class="timer">
            <h3>Remaining Time : {{ time.hr }}h : {{ time.min }}min : {{ time.sec }}sec</h3>
        </div>

        <div class="ques">
            <p>{{ quesData.currQues + 1 }}: {{ questions[quesData.currQues].ques }}</p>
        </div>

        <ul>
            <li v-for="(op, ind) in questions[quesData.currQues].options" @click="optionClicked(op, ind)"
                :class="{ selected: quesData.optn[quesData.currQues] === ind }">
                <div class="options">
                    {{ op }}
                </div>
            </li>
        </ul>

        <div class="footer">
            <div>
                <button @click="prevQues" style="marginRight: 10px; marginLeft: 30px">Previous</button>
                <button @click="nextQues">Next</button>
            </div>
            <div class="finishtest">
                <button @click="eliminateTest">Finish Test</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.root {
    padding: 0px;
    margin: 0px;
    width: 100%;
    height: 100%;
}

.timer {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
    padding-right: 50px;
}

.ques {
    width: 100%;
    max-width: 100%;
    /* background-color: gainsboro; */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    padding: 10px 5px;
}

.options {
    /* background-color: gainsboro; */
    margin: 10px;
    padding: 10px;
    /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); */
}

.finishtest {
    padding-right: 30px;
}

li {
    list-style: none;
    list-style-position: inside;
    /* background-color: gainsboro; */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.selected {
    background-color: green;
}

li:hover {
    background-color: grey;
}

.footer {
    display: flex;
    justify-content: space-between;
    background-color: rgb(217, 225, 227);
    margin: 10px 0px;
    padding: 10px 0px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}


.confirmation-box {
    position: absolute;
    background-color: #fff;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 50%;
    margin-left: 25%;
    height: 30%;
    /* margin-top: 35%; */
    text-align: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
    background-color: orange;
}

/* .confirmation-message {
    margin-bottom: 1rem;
} */

.confirmation-actions {
    display: flex;
    justify-content: center;
}

.confirmation-actions button {
    /* margin-left: 0.5rem; */
    /* width: 50px; */
    width: 100px;
    margin: 10px 10px;
    padding: 10px;
}

button{
    cursor: pointer;
}

.redWarning {
    background-color: red;
}
</style>
