<template>
  <div id="#app">
    <global-loader text="Chargement..."></global-loader>
    <div class="ui sidebar inverted vertical menu">
      <a class="item" @click="restoreBackup">
        Annuler toute les modifications
      </a>
      <a class="item">
        2
      </a>
      <a class="item">
        3
      </a>
    </div>
    <div class="pusher">
      <div class="ui compact inverted top fixed borderless  menu">
      <a class="item" :class="{ orange:modified, active:modified }"  @click="save">
        <i class="save icon"></i>
        Sauvegarder
      </a>
      <a class="item" @click="reload">
        <i class="refresh icon"></i>
        Recharger
      </a>
      <a class="item" @click="displayHistory">
        <i class="history icon"></i>
        Historique
      </a>
      <div class="right  menu">
        <div class="ui  right aligned category search item">
          <div class="ui inverted transparent icon input">
            <input class="prompt" placeholder="Rechercher une ip, un domaine" type="text">
            <i class="search inverted link icon "></i>
          </div>
          <div class="results"></div>
        </div>
      </div>
    </div>
    <div class="content-app">
      <router-view></router-view>
    </div>
    </div>
    
    <div class="ui small basic confirm modal">
      <div class="ui icon header">
        <i class="warning icon"></i>
        Confirmer
      </div>
      <div class="content">
        <p style="text-align: center">{{ confirmText }}</p>
      </div>
      <div class="actions">
        <div class="ui red basic cancel inverted button">
          <i class="remove icon"></i>
          Non
        </div>
        <div class="ui green ok inverted button">
          <i class="checkmark icon"></i>
          Oui
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  
  import mousetrap from 'mousetrap'
  import { mapGetters } from 'vuex'
  
  export default {
    data() {
      return {
        confirmText: 'êtes-vous sûr ?'
      }
    },
    computed: {
        ...mapGetters([
            'modified',
        ]),
    },
    mounted()
    {
      mousetrap.bind(['command+s', 'ctrl+s'], (e) => {
          this.$store.dispatch('save')
      })
    },
    methods: {
      displayHistory()
      {
        $('.ui.sidebar').sidebar('toggle')
      },
      save()
      {
        this.$store.dispatch('save')
      },
      reload()
      {
        
        if( this.$store.getters.modified ) {
          this.confirmText = 'recharger le fichier Hosts ? ça supprimera vos modification'
          $('.confirm.modal')
          .modal({
            closable  : false,
            onDeny    : () =>{
            },
            onApprove : () => {
              this.$store.dispatch('read')
            }
          })
          .modal('show')
          
        }  else {
          this.$store.dispatch('read')
        }
        
      },
      restoreBackup()
      {
          
          this.confirmText = 'recharger le fichier Hosts avant toute modification ?'
          $('.confirm.modal')
          .modal({
            closable  : false,
            onDeny    : () =>{
                $('.ui.sidebar').sidebar('toggle')
            },
            onApprove : () => {
              this.$store.dispatch('restoreBackup')
              $('.ui.sidebar').sidebar('toggle')
            }
          })
          .modal('show')
          
        
      }
      
    }
  }
</script>

<style>
  .content-app {
    margin-top: 40px;
  }
</style>
