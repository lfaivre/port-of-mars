import { State, defaultTradeData } from '@port-of-mars/shared/game/client/state';
import { Role, ResourceAmountData } from '@port-of-mars/shared/types';
import {
  ModalViewType,
  ModalDataType,
} from '@port-of-mars/shared/game/client/modals';
import {
  ChatMarsLogView,
  HUDLeftView,
  HUDRightView,
} from '@port-of-mars/shared/game/client/panes';

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

// NOTE :: CONTROL PROFILE MENU VISIBILITY

function SET_PROFILE_MENU_VISIBILITY(state: State, payload: boolean) {
  state.userInterface.profileMenuView.visible = payload;
}

// NOTE :: CONTROL PANE VIEWS

function SET_CHATMARSLOG_VIEW(state: State, payload: ChatMarsLogView) {
  state.userInterface.chatMarsLogView = payload;
}

function SET_HUDLEFT_VIEW(state: State, payload: HUDLeftView) {
  state.userInterface.hudLeftView = payload;
}

function SET_HUDRIGHT_VIEW(state: State, payload: HUDRightView) {
  state.userInterface.hudRightView = payload;
}

function SET_RESOURCE_COSTS_VISIBLE(state: State, payload: boolean) {
  state.userInterface.toggleResourceCost = payload;
}

// function SET_TRADE_FILTER(state: State, payload: boolean) {
//   state.userInterface.toggleYourTrades = payload;
// }

// TODO :: Need to re-implement in tutorial

// function SET_TRADE_REQUEST_MODAL_VISIBILITY(state: State, payload: boolean) {
//   state.ui.modalViews.tradeRequestModal.visible = payload;
//   if (payload == false) {
//     state.ui.tradeData = defaultTradeData();
//   }
// }

// NOTE :: TRADE SPECIFIC

function OPEN_TRADE_MODAL_WARM(state: State, payload: { role: Role }) {
  state.ui.tradeData.recipient.role = payload.role;
  // state.ui.modalViews.tradeRequestModal.visible = true;
}

function SET_GET_RESOURCES(state: State, payload: ResourceAmountData) {
  state.ui.tradeData.sender.resourceAmount = payload;
}

function SET_SEND_RESOURCES(state: State, payload: ResourceAmountData) {
  state.ui.tradeData.recipient.resourceAmount = payload;
}

function SET_TRADE_PARTNER_NAME(state: State, payload: Role) {
  state.ui.tradeData.recipient.role = payload;
}

function SET_TRADE_PLAYER_NAME(state: State, payload: Role) {
  state.ui.tradeData.sender.role = payload;
}

function RESET_TRADE_MODAL(state: State, payload: any) {
  state.ui.tradeData = defaultTradeData();
}

// NOTE :: EXPORT

export default {
  SET_MODAL_VISIBLE,
  SET_MODAL_HIDDEN,
  SET_PROFILE_MENU_VISIBILITY,
  SET_CHATMARSLOG_VIEW,
  SET_HUDLEFT_VIEW,
  SET_HUDRIGHT_VIEW,
  SET_GET_RESOURCES,
  SET_SEND_RESOURCES,
  SET_TRADE_PARTNER_NAME,
  SET_TRADE_PLAYER_NAME,
  OPEN_TRADE_MODAL_WARM,
  RESET_TRADE_MODAL,
  SET_RESOURCE_COSTS_VISIBLE,
  // SET_TRADE_FILTER
};
