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
  Document
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

  /**
   * get distinct array result
   * @param modelName 
   * @param field 
   * @param filter 
   * @returns 
   */
  async function distinct<T = any, ReturnType = any>(
    modelName: string,
    field: string,
    filter?: FilterQuery<T>
  ): Promise<Array<ReturnType>> {
    const DBModel = db.model(modelName);
    return await DBModel.distinct(field, filter);
  }

  async function exists<T = any>(
    modelName: string,
    filter: FilterQuery<T>
  ): Promise<Pick<Document<T>, '_id'> | null> {
    const DBModel = db.model(modelName);
    return await DBModel.exists(filter);
  }

  // exists(filter: FilterQuery<T>, callback: Callback<{ _id: InferId<T> } | null>): QueryWithHelpers<Pick<Document<T>, '_id'> | null, HydratedDocument<T, TMethodsAndOverrides, TVirtuals>, TQueryHelpers, T>;
  // exists(filter: FilterQuery<T>): QueryWithHelpers<{ _id: InferId<T> } | null, HydratedDocument<T, TMethodsAndOverrides, TVirtuals>, TQueryHelpers, T>;



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
    distinct,
    exists
  };
}

export type MongodbClient = ReturnType<typeof createMongodbCient>;

