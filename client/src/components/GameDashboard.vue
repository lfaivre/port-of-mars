<template>
  <div class="c-game-dashboard">
    <GameboardContainer
      v-if="shouldDisplayGame"
    />
<!--    <NewRound v-if="gamePhase === phase.newRound" />-->
    <Defeat v-if="gamePhase === phase.defeat" />
    <Victory v-if="gamePhase === phase.victory" />
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator';
  import GameboardContainer from '@port-of-mars/client/components/root/GameboardContainer.vue';
  import Victory from '@port-of-mars/client/components/root/Victory.vue';
  import Defeat from '@port-of-mars/client/components/root/Defeat.vue';
  import NewRound from '@port-of-mars/client/components/game/phases/NewRound.vue';
  import { Phase } from '@port-of-mars/shared/types';
  @Component({
    components: {
      GameboardContainer,
      Victory,
      Defeat,
      NewRound
    },
  })
  export default class GameDashboard extends Vue {
    get phase() {
      return Phase;
    }
    /**
     * Gets the current phase of the game.
     * @returns The current phase.
     */
    get gamePhase() {
      return this.$tstore.state.phase;
    }

    get shouldDisplayGame() {
      return ![Phase.defeat, Phase.victory].includes(this.gamePhase)
    }
  }
</script>

<style lang="scss" scoped>
  @import '@port-of-mars/client/stylesheets/views/GameDashboard.scss';
</style>
