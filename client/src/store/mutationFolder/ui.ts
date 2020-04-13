import { State, defaultTradeData } from '@port-of-mars/client/store/state';
import { Role, ResourceAmountData } from '@port-of-mars/shared/types';
import {
  ModalViewType,
  ModalDataType,
} from '@port-of-mars/client/types/modals';

// NOTE :: CONTROL MODAL VISIBILITY

function SET_MODAL_VISIBLE(
  state: State,
  payload: { type: ModalViewType; data: ModalDataType }
) {
  state.userInterface.modalView.type = payload.type;
  state.userInterface.modalView.data = payload.data;
  state.userInterface.modalView.visible = true;
}

function SET_MODAL_HIDDEN(state: State, payload: any) {
  state.userInterface.modalView.visible = false;
  state.userInterface.modalView.type = null;
  state.userInterface.modalView.data = null;
}

// TODO :: Need to re-implement in tutorial

// function SET_TRADE_REQUEST_MODAL_VISIBILITY(state: State, payload: boolean) {
//   state.ui.modalViews.tradeRequestModal.visible = payload;
//   if (payload == false) {
//     state.ui.tradeData = defaultTradeData();
//   }
// }

// NOTE :: TRADE SPECIFIC

function OPEN_TRADE_MODAL_WARM(state: State, payload: { role: Role }) {
  state.ui.tradeData.to.role = payload.role;
  // state.ui.modalViews.tradeRequestModal.visible = true;
}

function SET_GET_RESOURCES(state: State, payload: ResourceAmountData) {
  state.ui.tradeData.from.resourceAmount = payload;
}

function SET_SEND_RESOURCES(state: State, payload: ResourceAmountData) {
  state.ui.tradeData.to.resourceAmount = payload;
}

function SET_TRADE_PARTNER_NAME(state: State, payload: Role) {
  state.ui.tradeData.to.role = payload;
}

function SET_TRADE_PLAYER_NAME(state: State, payload: Role) {
  state.ui.tradeData.from.role = payload;
}

function RESET_TRADE_MODAL(state: State, payload: any) {
  state.ui.tradeData = defaultTradeData();
}

// NOTE :: EXPORT

export default {
  SET_MODAL_VISIBLE,
  SET_MODAL_HIDDEN,
  SET_GET_RESOURCES,
  SET_SEND_RESOURCES,
  SET_TRADE_PARTNER_NAME,
  SET_TRADE_PLAYER_NAME,
  OPEN_TRADE_MODAL_WARM,
  RESET_TRADE_MODAL,
};
