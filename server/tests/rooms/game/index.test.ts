import {GameState, AccomplishmentSet, Player, Trade, Accomplishment} from "@port-of-mars/server/rooms/game/state";
import {CURATOR, PIONEER, RESEARCHER, ENTREPRENEUR, TradeData, Role} from "@port-of-mars/shared/types";
import {getAccomplishmentByID, getAccomplishmentIDs} from "@port-of-mars/server/data/Accomplishment";
import * as _ from 'lodash'
import {getMarsEvent, mockGameStateInitOpts} from "@port-of-mars/server/util";
import {canSendTradeRequest} from "@port-of-mars/shared/validation";
import {
  OutOfCommissionCurator,
  OutOfCommissionPioneer,
  OutOfCommissionResearcher,
  OutOfCommissionPolitician,
  OutOfCommissionEntrepreneur,
  BreakdownOfTrust,
  PersonalGain
} from "@port-of-mars/server/rooms/game/state/marsevents/state";
import {MarsEvent} from "@port-of-mars/server/rooms/game/state/marsevents/MarsEvent";


describe('a Researcher Player Accomplishment', () => {
  const repo = new AccomplishmentSet(RESEARCHER);
  const p = new Player(RESEARCHER);
  it('can be purchased if their role matches', () => {
    const accomplishment = getAccomplishmentByID(RESEARCHER, 1);
    p.purchaseAccomplishment(accomplishment);
    expect(p.inventory.science).toBe(-accomplishment.science);
    expect(p.victoryPoints).toBe(accomplishment.victoryPoints);
  });

  it('cannot be purchased if their roles do not match', () => {
    const accomplishment = getAccomplishmentByID(PIONEER, 21);
    const possibleAccomplishments = getAccomplishmentIDs(RESEARCHER);
    expect(possibleAccomplishments.includes(accomplishment.id)).toBe(false);
  });

  it('replenish returns correct amount of accomplishments', () => {
    p.refreshPurchasableAccomplishments();
    expect(p.accomplishments.purchasable.length).toBe(3);
  });

  it('screw cards handle contributed upkeep correctly', () => {
    const grantFunkAccomplishment = getAccomplishmentByID(RESEARCHER, 14);
    expect(p.systemHealthChanges.netChange()).toBe(0);
    p.purchaseAccomplishment(grantFunkAccomplishment);
    expect(p.systemHealthChanges.netChange()).toBe(-6);
  });

  it('cards in hand are removed from the deck of possible cards', () => {
    //from the beginning
    const id = p.accomplishments.purchasable[0].id;
    expect(p.accomplishments.deck.includes(id)).toBe(false);

    //after calling refreshPurchasableAccomplishments()
    p.purchaseAccomplishment(p.accomplishments.purchasable[0]);
    p.refreshPurchasableAccomplishments();
    for (const a of p.accomplishments.purchasable) {
      expect(p.accomplishments.deck.includes(a.id)).toBe(false);
    }
  });

  it('purchasing cards removes them from purchasable', () => {
    expect(p.accomplishments.purchasable.length).toBe(3);
    p.purchaseAccomplishment(p.accomplishments.purchasable[0]);
    expect(p.accomplishments.purchasable.length).toBe(2);
  });

  it('trying to replenish after all cards are purchased is handled without error', () => {
    p.accomplishments.deck = [];
    const purchasableSize = p.accomplishments.purchasable.length;
    p.refreshPurchasableAccomplishments();
    expect(p.accomplishments.purchasable.length).toBe(purchasableSize);
  });

});

describe('a player snapshot', () => {
  const p1 = new Player(RESEARCHER);
  const p2 = new Player(CURATOR);
  it('can be round tripped', () => {
    p2.fromJSON(p1.toJSON());
    expect(_.isEqual(p1, p2)).toBeTruthy();
  });
});

describe('a game state snapshot', () => {

  it('can be round tripped', async () => {
    const options = mockGameStateInitOpts(x => x, () => 10);
    const g1 = new GameState(options);
    const g2 = new GameState(options);
    g2.fromJSON(g1.toJSON());
    expect(_.isEqual(g1, g2)).toBeTruthy();
    g2.maxRound = g1.maxRound + 1;
    expect(_.isEqual(g1, g2)).toBeFalsy()
    g1.players[CURATOR].timeBlocks = 15;
    expect(g2.players[CURATOR].timeBlocks).toBe(10);
  });
});

describe('a mars event', () => {
  describe('a personal gain event', () => {
    it('can be serialized and deserialized', () => {
      const me = getMarsEvent('personalGain');
      const marsEvent = new MarsEvent(me);
      const marsEvent2 = new MarsEvent(marsEvent.toJSON());
      expect(_.isEqual(marsEvent, marsEvent2)).toBeTruthy();
    })
  })
})

describe('an accomplishment', () => {
  it('can be serialized and deserialized', () => {
    const accomplishment = new Accomplishment(getAccomplishmentByID(CURATOR, 81));
    const accomplishment2 = new Accomplishment(getAccomplishmentByID(CURATOR, 81));
    accomplishment2.fromJSON(accomplishment.toJSON());
    expect(_.isEqual(accomplishment, accomplishment2)).toBeTruthy();
    expect(accomplishment.upkeep).toBe(accomplishment2.upkeep)
    expect(accomplishment.upkeep).toBe(0);
  })
})

/*
describe('a personal gain event', () => {
  const gameState = new GameState(mockGameStateInitOpts(x => x, () => 10));
  it('gets players who voted yes', () => {
    // check upkeep and
    // votes associated with roles and timeblocks affected
  });

});
*/

describe('trading validations', () => {
  const g = new GameState(mockGameStateInitOpts(x => x, () => 10));
  g.players['Curator'].inventory.update({
    finance: 0,
    culture: 3,
    science: 0,
    legacy: 0,
    government: 0,
  });

  g.players['Entrepreneur'].inventory.update({
    finance: 3,
    culture: 1,
    science: 0,
    legacy: 0,
    government: 0,
  });

  g.tradeSet['invalid-request'] = new Trade(
    'invalid-request',
    {
      role: 'Curator',
      resourceAmount: {
        science: 0,
        government: 0,
        legacy: 0,
        finance: 0,
        culture: 3
      }
    },
    {
      role: 'Entrepreneur',
      resourceAmount: {
        science: 0,
        government: 0,
        legacy: 0,
        finance: 5,
        culture: 0
      }
    },
    'Active'
  );

  g.tradeSet['valid-request'] = new Trade(
    'valid-request',
    {
      role: 'Entrepreneur',
      resourceAmount: {
        science: 0,
        government: 0,
        legacy: 0,
        finance: 1,
        culture: 0
      }
    },
    {
      role: 'Curator',
      resourceAmount: {
        science: 0,
        government: 0,
        legacy: 0,
        finance: 0,
        culture: 3
      }
    },
    'Active'
  );

  const invalidTrade: Trade = g.tradeSet['invalid-request'];
  const validTrade: Trade = g.tradeSet['valid-request'];

  it('Curator can send trade request that Entrepeneur cannot accept', () => {
    expect(canSendTradeRequest(g.players[invalidTrade.sender.role as Role], invalidTrade.sender.resourceAmount)).toBe(true);
  });

  it('Entrepeneur must have enough resources to complete trade request', () => {
    expect(g.canCompleteTrade(g.players[invalidTrade.sender.role], g.players[invalidTrade.recipient.role], invalidTrade));
  })

  it('Entrepeneur can send valid trade request', () => {
    expect(canSendTradeRequest(g.players[validTrade.sender.role as Role], validTrade.sender.resourceAmount)).toBe(true);
  });

  it('can be completed', () => {
    expect(g.players.Curator.inventory.finance).toBe(0);
    expect(g.players.Curator.inventory.culture).toBe(3);
    g.acceptTrade('valid-request');
    expect(g.players.Curator.inventory.culture).toBe(0);
    expect(g.players.Curator.inventory.finance).toBe(1);
    expect(g.players.Entrepreneur.inventory.culture).toBe(4);
    expect(g.players.Entrepreneur.inventory.finance).toBe(2);
  })
});


describe('inverting pending inventory', () => {
  const g = new GameState(mockGameStateInitOpts(x => x, () => 10));
  g.players['Curator'].inventory.update({
    finance: 0,
    culture: 3,
    science: 0,
    legacy: 0,
    government: 0,
  });

  it('sets the pending investments to the inverted inventory while preserving the inventory', () => {
    g.players['Curator'].invertPendingInventory();
    expect(g.players['Curator'].pendingInvestments.culture).toBe(-3);
    expect(g.players['Curator'].inventory.culture).toBe(3);
  });
});

describe('out of commission event reduces timeblocks for each role', () => {
  const g = new GameState(mockGameStateInitOpts(x => x, () => 10));

  it('gives each role 3 timeblocks', () => {
    for (const p of g.players) {
      expect(p.timeBlocks).toBe(10);
    }
    new OutOfCommissionCurator().finalize(g);
    new OutOfCommissionEntrepreneur().finalize(g);
    new OutOfCommissionResearcher().finalize(g);
    new OutOfCommissionPolitician().finalize(g);
    new OutOfCommissionPioneer().finalize(g);
    g.applyPendingActions();
    for (const p of g.players) {
      expect(p.timeBlocks).toBe(3);
    }
  });
});

describe('Pending Mars Events', () => {
  const g = new GameState(mockGameStateInitOpts(x => x, () => 10));
  const oppositeState = new GameState(mockGameStateInitOpts(x => x, () => 10));
  oppositeState.fromJSON(g.toJSON());
  it('are applied in the proper order', () => {
    new OutOfCommissionCurator().finalize(g);
    new PersonalGain({
      Curator: true,
      Entrepreneur: true,
      Pioneer: true,
      Politician: true,
      Researcher: true
    }).finalize(g);
    expect(g.players[CURATOR].timeBlocks).toBe(10);
    g.applyPendingActions();
    expect(g.players[CURATOR].timeBlocks).toBe(3);

    new PersonalGain({
      Curator: true,
      Entrepreneur: true,
      Pioneer: true,
      Politician: true,
      Researcher: true
    }).finalize(oppositeState);
    new OutOfCommissionCurator().finalize(oppositeState);
    expect(oppositeState.players[CURATOR].timeBlocks).toBe(10);
    oppositeState.applyPendingActions();
    expect(oppositeState.players[CURATOR].timeBlocks).toBe(3);
  });
});

describe('Breakdown of trust saves timeBlocks', () => {
  const g = new GameState(mockGameStateInitOpts(x => x, () => 10));

  it('gives each role 10 timeblocks with no other events active', () => {
    const breakdownOfTrust = new BreakdownOfTrust();
    breakdownOfTrust.initialize(g);
    breakdownOfTrust.finalize(g);

    for (const p of g.players) {
      expect(p.timeBlocks).toBe(10);
    }
  })

  it('gives each role 3 timeblocks when paired with out of commission', () => {

    for (const p of g.players) {
      expect(p.timeBlocks).toBe(10);
    }
    new OutOfCommissionCurator().finalize(g);
    new OutOfCommissionEntrepreneur().finalize(g);
    new OutOfCommissionResearcher().finalize(g);
    new OutOfCommissionPolitician().finalize(g);
    new OutOfCommissionPioneer().finalize(g);

    const breakdownOfTrust = new BreakdownOfTrust();
    breakdownOfTrust.initialize(g);
    breakdownOfTrust.finalize(g);
    g.applyPendingActions();
    for (const p of g.players) {
      expect(p.timeBlocks).toBe(3);
    }

  });
});
