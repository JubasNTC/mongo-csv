import { Collection, MongoClient } from 'mongodb';

interface IMongoRepository {
  connection: MongoClient;
  dbName: string;
  collectionName: string;
}

class MongoRepository {
  private readonly _collection: Collection;

  constructor({ connection, dbName, collectionName }: IMongoRepository) {
    this._collection = connection.db(dbName).collection(collectionName);
  }

  public async add(docs: Object): Promise<void> {
    await this._collection.insertOne(docs);
  }

  public get collection(): Collection {
    return this._collection;
  }
}

export { MongoRepository };