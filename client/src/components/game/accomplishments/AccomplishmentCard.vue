<template>
  <div class="c-accomplishmentcard container" :class="cardTypeStyling">
    <div class="title-wrapper row">
      <div class="title col-12">
        <p>{{ accomplishment.label }}</p>
        <font-awesome-icon
          :icon="['fas', 'info-circle']"
          size="lg"
          @click="handleClick"
          class="icon"
        />
      </div>
    </div>

    <div class="info-wrapper row">
      <div class="points col-3">
        <p>Points</p>
        <p>{{ accomplishment.victoryPoints }}</p>
      </div>
      <div class="flavortext col-9">
        <p>{{ accomplishment.flavorText }}</p>
      </div>
    </div>

    <div class="cost-wrapper row">
      <div class="cost col-12">
        <div
          v-for="investment in accomplishmentCost"
          :class="{
            'unattainable-resource': shouldResourceBeGrayedOut(investment),
          }"
          :key="investment + Math.random()"
          class="container"
        >
          <img
            :src="
              require(`@port-of-mars/client/assets/icons/${investment}.svg`)
            "
            alt="Investment"
          />
        </div>
      </div>
    </div>

    <div v-if="type === cardType.purchase" class="purchase-wrapper row">
      <div class="purchase col-12">
        <button :disabled="!canPurchase" @click="handlePurchase()">
          Purchase Accomplishment
        </button>
      </div>
    </div>

    <div v-if="type === cardType.discard" class="discard-wrapper row">
      <div class="discard col-12">
        <button @click="handleDiscard()">
          Discard Accomplishment
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  InjectReactive,
  Inject,
} from 'vue-property-decorator';
import { AccomplishmentCardType } from '@port-of-mars/client/types/cards.ts';
import {
  AccomplishmentData,
  Investment,
  INVESTMENTS,
  Resource,
} from '@port-of-mars/shared/types';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { GameRequestAPI } from '@port-of-mars/client/api/game/request';
import { canPurchaseAccomplishment } from '@port-of-mars/shared/validation';

import * as _ from 'lodash';

library.add(faInfoCircle);
Vue.component('font-awesome-icon', FontAwesomeIcon);

@Component({})
export default class AccomplishmentCard extends Vue {
  @Inject() readonly api!: GameRequestAPI;

  @Prop({
    default: () => ({
      id: undefined,
      role: undefined,
      label: undefined,
      flavorText: undefined,
      science: undefined,
      government: undefined,
      legacy: undefined,
      finance: undefined,
      culture: undefined,
      upkeep: undefined,
      victoryPoints: undefined,
      effect: undefined,
    }),
  })
  private accomplishment!: AccomplishmentData;

  @Prop({ default: AccomplishmentCardType.default })
  private type!: AccomplishmentCardType;

  // NOTE :: All / Default Type

  get cardType() {
    return AccomplishmentCardType;
  }

  private handleClick() {
    this.$tstore.commit('SET_CARD_MODAL_VISIBILITY', {
      visible: true,
      data:{
        type:'ModalCard',
        info:{
          card: 'accomplishment',
          payload: this.accomplishment
        },
      }
    })
  }

  get cardTypeStyling() {
    switch (this.type) {
      case AccomplishmentCardType.purchase:
        return this.canPurchase ? 'purchasable' : 'unpurchasable';
      case AccomplishmentCardType.discard:
        return this.canPurchase ? 'purchasable' : 'default';
      case AccomplishmentCardType.default:
        return 'default';
      default:
        return 'default';
    }
  }

  get accomplishmentCost() {
    return INVESTMENTS.filter(
      (investment) => this.accomplishment[investment] !== 0
    ).flatMap((investment) =>
      _.fill(Array(Math.abs(this.accomplishment[investment])), investment)
    );
  }

  // NOTE :: Purchase Type

  get canPurchase() {
    return canPurchaseAccomplishment(
      this.accomplishment,
      this.$tstore.getters.player.inventory
    );
  }

  private handlePurchase() {
    if (this.canPurchase) {
      this.api.purchaseAccomplishment(this.accomplishment);
    }
  }

  get playerInventory() {
    return _.clone(this.$tstore.getters.player.inventory);
  }

  private shouldResourceBeGrayedOut(investment: Investment) {
    if (investment === 'upkeep') {
      return false;
    }

    if (this.playerInventory[investment] > 0) {
      this.playerInventory[investment]--;
      return false;
    }
    return true;
  }

  // NOTE :: Discard Type

  private handleDiscard() {
    if (this.$store.getters.layout == 'tutorial') {
      this.api.discardAccomplishment(this.accomplishment.id);

    } else {
      this.$tstore.commit('SET_CARD_MODAL_VISIBILITY', {
      visible: true,
      data:{
        type:'ModalConfirmation',
        info:{
          text: `Selecting \"Yes\" will discard the accomplishment \"${this.accomplishment.label}\" and a new card will be drawn next round.`,
          victoryPoints: this.accomplishment.victoryPoints,
          cost: this.accomplishmentCost,
          phaseOpened: this.$store.state.phase,
          type: 'discardAccomplishment',
          actionData: this.accomplishment.id
        },
      }
    })

    }
    }
  }
</script>

<style lang="scss" scoped>
@import '@port-of-mars/client/stylesheets/game/accomplishments/AccomplishmentCard.scss';
</style>