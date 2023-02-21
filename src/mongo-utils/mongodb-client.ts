import { DeleteResult } from "mongodb";
import {
  AnyObject,
  Connection,
  ConnectOptions,
  createConnection,
  FilterQuery,
  HydratedDocument,
  Model,
  QueryOptions,
  SaveOptions,
  Schema,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";

export interface MongoConfig {
  url: string;
}

const cnnOptions: ConnectOptions = {
  autoIndex: false,
};

export async function createMongodbCient(cfg: MongoConfig) {
  /**
   * create mongoose helper object
   * @param cfg
   * @returns
   */
  async function create(cfg: MongoConfig): Promise<Connection> {
    const conn = createConnection(cfg.url, cnnOptions);
    return conn.asPromise();
  }

  /**
   * config shema models
   * @param {...Array<[string, Schema]>} schemas
   */
  function configModels(...schemas: Array<[string, Schema]>) {
    for (let d of schemas) {
      db.model(d[0], d[1]);
    }
  }

  /**
   * get model by name key
   * @param modelName
   * @returns
   */
  function model<T = any>(modelName: string): T {
    return db.model(modelName) as T;
  }

  /**
   * create a new doc by model name
   * @param modelName
   * @param doc
   * @returns
   */
  function newOne<T>(modelName: string, doc?: Partial<T>): HydratedDocument<T> {
    const GetModel = model(modelName);
    return new GetModel(doc) as HydratedDocument<T>;
  }

  /**
   * create many docs by model name and pojo objects
   * @param modelName
   * @param docs
   * @returns
   */
  function newMany<T>(
    modelName: string,
    docs: Array<Partial<T>>
  ): Array<HydratedDocument<T>> {
    const GetModel = model(modelName);
    return docs.map((val) => new GetModel(val) as HydratedDocument<T>);
  }

  /**
   * create many docs & directly save these
   * @param modelName
   * @param docs
   * @param options
   * @returns
   */
  async function createMany<T = any>(
    modelName: string,
    docs: Array<Partial<T>>,
    options?: SaveOptions
  ): Promise<HydratedDocument<T>[]> {
    return db.model<T>(modelName).create(docs, options);
  }

  /**
   * insert many docs to db
   * @param modelName
   * @param docs
   * @returns
   */
  async function insertMany<T = any>(
    modelName: string,
    docs: Array<Partial<T>> | Partial<T>
  ): Promise<HydratedDocument<T>[]> {
    return db.model<T>(modelName).insertMany(docs);
  }

  /**
   * find & delete docs by its id
   * @param modelName
   * @param ids
   * @returns
   */
  async function findByIdAndDelete<T = any>(
    modelName: string,
    ids: Array<any>
  ): Promise<Array<HydratedDocument<T> | null>> {
    const DBModel = db.model(modelName);
    return Promise.all(
      ids.map((id) => DBModel.findByIdAndDelete<HydratedDocument<T>>(id))
    );
  }

  /**
   * delete one doc
   * @param modelName
   * @param filter
   * @param options
   * @returns
   */
  async function deleteOne<T = any>(
    modelName: string,
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Promise<boolean> {
    const DBModel = db.model(modelName);
    const delResult: DeleteResult = await DBModel.deleteOne(filter, options);
    return delResult.acknowledged;
  }

  /**
   * delete many docs
   * @param modelName
   * @param filter
   * @param options
   * @returns
   */
  async function deleteMany<T = any>(
    modelName: string,
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Promise<boolean> {
    const DBModel = db.model(modelName);
    const delResult: DeleteResult = await DBModel.deleteMany(filter, options);
    return delResult.acknowledged;
  }

  /**
   * find & update docs by its id
   * @param modelName
   * @param id
   * @param options
   * @returns
   */
  async function findByIdAndUpdate<T = any>(
    modelName: string,
    id: any,
    update?: UpdateQuery<any>,
    options?: QueryOptions<T>
  ): Promise<HydratedDocument<T> | null> {
    const DBModel = db.model(modelName);
    return await DBModel.findByIdAndUpdate(id, update, options);
  }

  /**
   * update one doc
   * @param modelName
   * @param filter
   * @param update
   * @param options
   * @returns
   */
  async function updateOne<T = any>(
    modelName: string,
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T>
  ): Promise<boolean> {
    const DBModel = db.model(modelName);
    const updResult: UpdateWriteOpResult = await DBModel.updateOne(
      filter,
      update,
      options
    );
    return updResult.acknowledged;
  }

  async function updateMany<T = any>(
    modelName: string,
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: QueryOptions<T>
  ): Promise<boolean> {
    const DBModel = db.model(modelName);
    const updResult: UpdateWriteOpResult = await DBModel.updateMany(
      filter,
      update,
      options
    );
    return updResult.acknowledged;
  }

  /**
   * find & replace one doc
   * @param modelName
   * @param id
   * @param replacement
   * @param options
   * @returns
   */
  async function findByIdAndReplace<T = any>(
    modelName: string,
    id: any,
    replacement: T | AnyObject,
    options?: QueryOptions<T>
  ): Promise<HydratedDocument<T> | null> {
    const DBModel = db.model(modelName);
    return await DBModel.findOneAndReplace({ _id: id }, replacement, options);
  }

  /**
   * get the docs count
   * @param modelName 
   * @param filter 
   * @param options 
   * @returns 
   */
  async function countDocuments<T = any>(
    modelName: string,
    filter: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Promise<number> {
    const DBModel = db.model(modelName);
    return await DBModel.countDocuments(filter, options);
  }

  async function close() {
    await db.close();
  }

  const db = await create(cfg);
  return {
    db,
    close,
    configModels,
    model,
    newOne,
    newMany,
    createMany,
    insertMany,
    findByIdAndDelete,
    deleteOne,
    deleteMany,
    findByIdAndUpdate,
    updateOne,
    updateMany,
    findByIdAndReplace,
    countDocuments,
  };
}

export type MongodbClient = ReturnType<typeof createMongodbCient>;

// import { Channel, connect, Connection, ConsumeMessage, Options } from "amqplib";

// export interface QueueEntry {
//   queue: string;
//   options?: Options.AssertQueue;
//   exchanges?: Array<{
//     bindingExchange: string;
//     bindingKey: string;
//   }>;
// }

// export interface ExchangeEntry {
//   exchange: string;
//   type: "direct" | "topic" | "headers" | "fanout" | "match" | string;
//   options?: Options.AssertExchange;
// }

// export interface ClientConfig {
//   url?: string | Options.Connect;
//   exchanges?: Array<ExchangeEntry>;
//   queues?: Array<QueueEntry>;
// }

// export interface SubscribeConfig {}

// export class AmqpClient {
//   cnn: Connection | null = null;
//   constructor() {}

//   /**
//    * initialize the amqp client object
//    * @param cfg
//    * @returns
//    */
//   async config(cfg: ClientConfig): Promise<boolean> {
//     try {
//       if (cfg.url) {
//         this.cnn = await connect(cfg.url);
//       } else {
//         this.cnn = await connect("amqp://localhost");
//       }
//       const ch = await this.cnn!.createChannel();

//       if (cfg.exchanges) {
//         for (let entry of cfg.exchanges) {
//           await ch.assertExchange(entry.exchange, entry.type, entry.options);
//         }
//       }

//       if (cfg.queues) {
//         for (let entry of cfg.queues) {
//           await ch.assertQueue(entry.queue, entry.options);
//           if (entry.exchanges) {
//             for (let ex of entry.exchanges) {
//               await ch.bindQueue(
//                 entry.queue,
//                 ex.bindingExchange,
//                 ex.bindingKey
//               );
//             }
//           }
//         }
//       }
//       await ch.close();
//       return true;
//     } catch (error) {
//       this.cnn = null;
//       return false;
//     }
//   }

//   /**
//    * close the client
//    * @returns
//    */
//   async close(): Promise<boolean> {
//     try {
//       if (this.cnn) {
//         await this.cnn!.close();
//       }
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }

//   /**
//    * public messages to exchange
//    * @param exchange
//    * @param routingKey
//    * @param data
//    * @returns
//    */
//   async publish(
//     exchange: string,
//     routingKey: string,
//     data: Buffer | Array<Buffer>
//   ): Promise<boolean> {
//     try {
//       const ch = await this.cnn!.createChannel();
//       if (Array.isArray(data)) {
//         for (let d of data) {
//           await ch.publish(exchange, routingKey, d);
//         }
//       } else {
//         await ch.publish(exchange, routingKey, data);
//       }

//       await ch.close();
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }

//   /**
//    * subscibe queue messages
//    * @param queue
//    * @param onMessage
//    * @param consumeOptions
//    * @returns
//    */
//   async subscribe(
//     queue: string,
//     onMessage: (msg: ConsumeMessage | null) => void,
//     consumeOptions?: Options.Consume
//   ): Promise<Channel | null> {
//     try {
//       const ch = await this.cnn!.createChannel();
//       await ch.consume(queue, onMessage, consumeOptions);
//       return ch;
//     } catch (error) {
//       return null;
//     }
//   }

//   /**
//    * send messages to queue
//    * @param queue
//    * @param data
//    * @returns
//    */
//   async send(queue: string, data: Buffer | Array<Buffer>): Promise<boolean> {
//     try {
//       const ch = await this.cnn!.createChannel();
//       if (Array.isArray(data)) {
//         for (let d of data) {
//           await ch.sendToQueue(queue, d);
//         }
//       } else {
//         await ch.sendToQueue(queue, data);
//       }
//       await ch.close();
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }
// }
