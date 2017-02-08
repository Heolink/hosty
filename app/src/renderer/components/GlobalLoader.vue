<template>
    <div class="ui page dimmer" :class="{ active: globalLoaderDisplay }">
      <div class="ui text loader">{{ text }}</div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    export default {
        props: ['text'],
        data() {
            return {

            }
        },
        computed: {
            ...mapGetters([
                'globalLoaderDisplay',
            ])
        },
        mounted()
        {
            
        }
    }
</script>