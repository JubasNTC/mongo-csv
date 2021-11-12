require('dotenv').config();

import * as fs from 'fs';
import * as path from 'path';

import { MongoClient } from 'mongodb';
import { drive_v2 } from 'googleapis';

import * as argv from 'minimist';
import * as csvParser from 'csv-parser';

import { MongoRepository } from './mongo.repository';
import { downloadFile, driveFactory } from './helpers';

const { url } = argv(process.argv.slice(2));

(async (): Promise<void> => {
  const client = new MongoClient(url);

  try {
    console.info('======= connecting to mongodb =======');

    const connection: MongoClient = await client.connect();

    const moviesRepo: MongoRepository = new MongoRepository({
      connection,
      dbName: 'films_ratings',
      collectionName: 'movies_metadata',
    });

    const ratingsRepo: MongoRepository = new MongoRepository({
      connection,
      dbName: 'films_ratings',
      collectionName: 'ratings',
    });

    console.info('======= configuring google drive =======');

    const drive: drive_v2.Drive = driveFactory({
      clientId: process.env.CLIENT_ID || '',
      clientSecret: process.env.CLIENT_SECRET || '',
      redirectUri: process.env.REDIRECT_URL || '',
      accessToken: process.env.ACCESS_TOKEN || '',
      refreshToken: process.env.REFRESH_TOKEN || '',
    });

    console.info('======= downloading files =======');

    const ratingsDestination = path.resolve(__dirname, '../var', 'ratings.csv');
    const moviesDestination = path.resolve(
      __dirname,
      '../var',
      'movies_metadata.csv'
    );

    await Promise.all([
      downloadFile({
        drive,
        fileId: '1RQaeUc1SR7j0S6p5usaavLIoLrpS7wJR',
        destination: moviesDestination,
      }),
      downloadFile({
        drive,
        fileId: '1qdzHHBdNrCA3pj3aV44WkAJ36sqJU_TS',
        destination: ratingsDestination,
      }),
    ]);

    console.info('======= reading files and inserting data =======');

    // TODO: Put it in a separate function

    await new Promise((resole, reject) => {
      fs.createReadStream(moviesDestination)
        .pipe(csvParser())
        .on(
          'data',
          async ({
            id,
            original_title,
          }: {
            id: string,
            original_title: string,
          }) => {
            try {
              await moviesRepo.add({
                movie_id: id,
                original_title,
              });
            } catch (error) {
              reject(error);
            }
          }
        )
        .on('end', resole)
        .on('error', reject);
    });

    new Promise((resole, reject) => {
      fs.createReadStream(ratingsDestination)
        .pipe(csvParser())
        .on(
          'data',
          async ({ movieId, rating }: { movieId: string, rating: string }) => {
            try {
              await ratingsRepo.add({
                movie_id: movieId,
                rating,
              });
            } catch (error) {
              reject(error);
            }
          }
        )
        .on('end', resole)
        .on('error', reject);
    });

    console.info('======= top 10 movies =======');

    const topTen = await ratingsRepo.collection
      .aggregate([
        {
          $lookup: {
            from: 'movies_metadata',
            localField: 'movie_id',
            foreignField: 'movie_id',
            as: 'top_ten',
          },
        },
      ])
      .sort({ rating: -1 })
      .limit(5)
      .toArray();

    console.dir(
      {
        topTen: topTen.map(({ movie_id, rating }: any) => ({
          movie_id,
          rating,
        })),
      },
      { depth: 4 }
    );

    console.info('======= done =======');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
})();
