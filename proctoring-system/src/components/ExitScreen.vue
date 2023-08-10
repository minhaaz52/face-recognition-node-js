<script setup>
import { useRouter } from 'vue-router';
const myRouter = useRouter()
const gotoHome = () => {
    myRouter.replace({
        name: "home"
    })
}
</script>

<template>
    <div class="exitpage">
        <h2>Test Eliminated</h2>
        <button @click="gotoHome">Go to Home</button>
    </div>
</template>

<style scoped>
.exitpage {
    width: 100%;
    height: 100%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
}

button{
    cursor: pointer;
}

</style>

