<template>
    <div class="box">
        <div class="display_box" ref="display_box">
            <p v-for="number in storedMessage.length" :key="number" class="message">{{ storedMessage[number-1] }}</p>
        </div>
        <p v-if="pleaseWait" class="wait">Please Wait...</p>
        <input type="text" @keydown.enter="send" class="search" v-model="userInput">
        <button @click="send" class="enter">Enter</button>
    </div>

    <button @click="load" v-if="!uploaded" class="upload">upload</button>
</template>

<script>
import axios from 'axios'
    export default {
        name: 'Pdf_Loader',
        data() {
            return {
                userInput: '',
                storedMessage: [],
                enterClicked:false,
                clicked: false,
                pleaseWait: false,
                uploaded: false
            }
        },

        methods: {
            async load() {
                if(!this.clicked){
                    this.uploaded = true;
                    this.pleaseWait = true;
                    this.clicked = true;
                    let response = await axios.get('/upload');
                    console.log(response.data);
                    this.pleaseWait = false;
                }
            },
            async send() {
                if(!this.enterClicked) {
                    this.enterClicked = true;
                    this.storedMessage.push(this.userInput);
                    this.userInput = '';
                    this.$nextTick(() => {
                        this.$refs['display_box'].scrollTop = this.$refs['display_box'].scrollHeight;
                    })
                    this.pleaseWait = true;
                    let response = await axios.post('/post', {
                        msg: this.storedMessage[this.storedMessage.length-1]
                    });
                    this.storedMessage.push(response.data.text);
                    this.pleaseWait = false;
                    this.$nextTick(() => {
                        this.$refs['display_box'].scrollTop = this.$refs['display_box'].scrollHeight
                    });
                    console.log(response.data);
                    this.enterClicked = false;
                }    
            } 
        }
    }
</script>

<style>

    .box {
        display: inline-block;
        position: relative;
        width: 25rem;
        height: 35rem;
    }

    .display_box {
        width: 25rem;
        height: 33rem;
        background-color: gainsboro;
        padding-top: 1rem;
        border: 0.07rem solid black;
        overflow-y: scroll;
    }

    ::-webkit-scrollbar {
        width: 0;
    }

    .search {
        width: 25rem;
        height: 2rem;
    }

    .message {
        width: 100%;
        padding: 0.5rem;
        padding-left: 1.5rem;
        text-align: left;
        margin: 0;
        margin-bottom: 1rem;
    }

    .enter {
        position: absolute;
        height: 2.3rem;
        right: 0%;
        border: none;
        background: transparent;
        cursor: pointer;
        bottom: -0.5%;
        font-family: 'Poppins', sans-serif;
        opacity: 0.4;
    }

    .upload {
        font-family: 'Poppins', sans-serif;
        height: 2.3rem;
        border: none;
        cursor: pointer;
        background: transparent;
    }

    .wait {
        margin: 0px;
        width: fit-content;
        height: fit-content;
        position: absolute;
        bottom: 6%;
        right: 40%;
    }

</style>