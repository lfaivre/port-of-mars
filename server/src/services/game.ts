import {Game, GameEvent} from "@port-of-mars/server/entity";
import {BaseService} from "@port-of-mars/server/services/db";

export class GameService extends BaseService {
  async findById(id: number): Promise<Game> {
    return await this.em.getRepository(Game).findOneOrFail({id});
  }

  async findEventsByGameId(gameId: number): Promise<Array<GameEvent>> {
    return await this.em.getRepository(GameEvent).find({where: {gameId}, order: {id: "ASC"}});
  }

  async getActiveGameRoomId(userId: number): Promise<string | undefined> {
    const game = await this.em.getRepository(Game)
      .createQueryBuilder("game")
      .innerJoin("game.players", "player")
      .innerJoin("player.user", "user")
      .where("user.id = :userId", {userId})
      .orderBy("game.dateCreated", "DESC")
      .getOne();

    return game?.roomId;
  }
}