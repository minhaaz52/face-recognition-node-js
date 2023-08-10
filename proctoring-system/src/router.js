import { createRouter, createWebHistory } from "vue-router"

import TestScreen from "./components/TestScreen.vue"
import HomeScreen from "./components/HomeScreen.vue"
import ExitScreen from "./components/ExitScreen.vue"

const router=createRouter({
    history: createWebHistory(),
    routes:[
        {
            name:"test",
            path: "/test",
            component: TestScreen
        },

        {
            name:"exit",
            path:"/exit",
            component:ExitScreen
        },

        { 
            name:"home", 
            path: '/', 
            component: HomeScreen
        },
        {
            name:"invalid",
            path: '/:notFound(.*)', 
            redirect: '/' 
        }
    ]
})

export default router

