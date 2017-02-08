<template>
  <div class="ui editor"> 
    <codemirror ref="editor" :value="code" :options="editorOption" @change="change"></codemirror>
  </div>
</template>

<script>
  
  import { mapGetters } from 'vuex'
  import codemirror from 'vue-codemirror-lite/codemirror.vue'
  import 'codemirror/mode/r/r'
  import 'codemirror/theme/monokai.css'

  export default {
    name: 'home',
    components: {
      codemirror
    },
    data() {
      return {
        editorOption: {
          mode: 'r',
          theme: 'monokai',
          lineNumbers: true,
          lineWrapping: true
        }
      }
    },
    computed: {
        ...mapGetters([
            'code',
        ]),
        editor() {
          // get current editor object
          return this.$refs.editor.editor
        }
    },
    mounted()
    {
      this.editor.getInputField().classList.add('mousetrap')
    },
    methods: {
      change(data)
      {
          this.$store.dispatch('readFlash', 'read').then((d)=>{
              if( !d ) {
                 this.$store.dispatch('setModified', true)
                 this.$store.dispatch('setHost', data)
              }
          })
          
      }
    }
  }
</script>

<style>
  .editor, .CodeMirror {
    height: 100vh;
  }
</style>
