<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped>
  div{
    width: 100vw;
    height: 100vh;
  }
</style>


<!-- <script setup>
import { db } from "../firebase"
import { onMounted, reactive } from 'vue';
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const data=reactive({
  schoolMarks:{}
})

const fun = () => {
  const campaignRef = collection(db, "campaigns")
  // const schoolMarks = {}

  onSnapshot(campaignRef, (snapshot) => {
    snapshot.docs.forEach(async (doc) => {
      // if teacher run this
      // console.log("doc id >>", doc.id)
      if (doc.data().audienceType.toLowerCase() === "teacher") {
        console.log("teacher >>", doc.id)
      }
      // if jobseeker run this
      else {
        for (const sName of doc.data().schools) {
          if (!(sName in data.schoolMarks)) {
            console.log("entered")
            data.schoolMarks[sName] = 0
          }
        }

        const jobSeekerRef = collection(campaignRef, doc.id, "audience")
        const jobSeekDocs = await getDocs(jobSeekerRef)
        jobSeekDocs.forEach((d) => {
          console.log("screening total >>", d.data().screeningTotal)
          if (d.data().schoolName==="school2"){
            //
          }
          // data.schoolMarks[d.data().schoolName] += d.data().screeningTotal
        })
        // console.log("job seeker id >>", doc.id)
        // go to audience collection.
        // const docRef=doc(campaignRef, doc.id, )
        // fetch screeningTotal and mainsTotal for each audience.
        // get rank
      }
    })
  })
}

onMounted(() => {
  fun()
})

</script>


<template>
  <h2>{{ data.schoolMarks }}</h2>
</template> -->



