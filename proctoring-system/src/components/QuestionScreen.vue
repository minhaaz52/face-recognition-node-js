<script setup>

defineProps({
  ques: {
    type: String,
  },

  opt:{
    type:Array,
  }
})

</script>

<template>
    <h3>{{ ques }}</h3>
    <ul>
        <li v-for="op in opt">{{ op }}</li>
    </ul>    
</template>


