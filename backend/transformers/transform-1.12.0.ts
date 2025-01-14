import { appLogger } from '../helpers/app-logger';
import { denounceTransformation } from '../helpers/announce-transformation';
import { MigrationMetaData } from '../../domain/interfaces';
import { writeFileSync } from 'fs';
import { broadcastStatusUpdate } from './helpers/status-update';
import path, { join } from 'path';
import { QueryTypes, Sequelize } from 'sequelize';
import { ImageResizeService } from '../service/ImageResizeService';
import { PageAlignmentService } from '../service/search/CoordinateAlignmentService';

// If the Page size const are imported the whole server app (don't know why) is build into transformer
const DEFAULT_THUMBNAIL_WIDTH = 610;
const RATIO = 0.7142857142857143;
const DEFAULT_THUMBNAIL_HEIGHT = DEFAULT_THUMBNAIL_WIDTH / RATIO;

export const MIGRATION_TEST_NAME = 'transform-1.12.0';
const pageAlignment = new PageAlignmentService(DEFAULT_THUMBNAIL_WIDTH, DEFAULT_THUMBNAIL_HEIGHT);

interface Page {
  id: number;
  filePath: string;
  fileName: string;
  thumbnail: string | null;
  image: string;
  width: number;
  height: number;
}

const createThumbnail = async (
  page: Page,
  jobStore: MigrationMetaData,
  totalPages: number,
  currentIndex: number,
): Promise<void> => {
  const resizeService = new ImageResizeService(DEFAULT_THUMBNAIL_WIDTH, DEFAULT_THUMBNAIL_HEIGHT);
  const originalPath = path.join(page.filePath, page.fileName);
  const thumbFilePath = path.join(page.filePath, page.fileName.replace('.jpg', '_thumb.jpg'));

  try {
    await resizeService.resizeImage(originalPath, thumbFilePath);
    appLogger(`Thumbnail created: ${thumbFilePath}`, 'migration-worker', 'logEntryTransformer');

    // Calculate progress (start at 1% and end at 50% for thumbnail creation phase)
    const progressPerPage = 0.49 / totalPages; // 49% spread across all pages for thumbnails
    const currentProgress = 0.01 + progressPerPage * (currentIndex + 1);
    jobStore.percentCompleted = Math.min(0.5, currentProgress);
    jobStore.output = `Creating thumbnail ${currentIndex + 1} of ${totalPages}`;
    broadcastStatusUpdate(jobStore);
  } catch (error) {
    appLogger(error, 'migration-worker', 'logEntryTransformer');
    jobStore.output = `Error creating thumbnail for ${page.fileName}: ${error}`;
    broadcastStatusUpdate(jobStore);
  }
};

const updateOffsets = async (
  page: Page,
  db: Sequelize,
  jobStore: MigrationMetaData,
  totalPages: number,
  currentIndex: number,
): Promise<void> => {
  const offsets = pageAlignment.calculateOffsets(page.width, page.height);

  await db.query(
    `
    UPDATE Pages
    SET 
      "thumbnailPaddingX" = :paddingX,
      "thumbnailPaddingY" = :paddingY,
      "thumbnailScale" = :scale
    WHERE thumbnailScale is NULL AND id = :pageId
  `,
    {
      replacements: {
        paddingX: offsets.xPadding,
        paddingY: offsets.yPadding,
        scale: offsets.scale,
        pageId: page.id,
      },
    },
  );

  // Calculate progress (start at 50% and end at 99% for offset updates)
  const progressPerPage = 0.49 / totalPages; // 49% spread across all pages for offsets
  const currentProgress = 0.5 + progressPerPage * (currentIndex + 1);
  jobStore.percentCompleted = Math.min(0.99, currentProgress);
  jobStore.output = `Updating offsets ${currentIndex + 1} of ${totalPages}`;
  broadcastStatusUpdate(jobStore);
};

if (!process.env.READWORKS_PROJECT_FILE || !process.env.READWORKS_DATA_DIR) process.exit();

(async () => {
  if (!process.env.READWORKS_PROJECT) return;

  const jobStore: MigrationMetaData = { percentCompleted: 0.01, output: 'Starting migration...' };
  broadcastStatusUpdate(jobStore);

  // run the job
  appLogger(`Migration 1.12.0 running}`, 'migration-worker', 'logEntryTransformer');

  const database = join(process.env.READWORKS_PROJECT, 'db.rwxdb');

  appLogger('the database  => ' + database, 'migration-worker', 'logEntryTransformer');

  const db = new Sequelize({
    dialect: 'sqlite',
    database: 'document',
    benchmark: true,
    storage: database,
    logging: !!process.env.SQL_LOGGING || false,
  });

  const query = `
    UPDATE "Pages"
    SET "image" = "thumbnail"
    WHERE "image" IS NULL OR "image" = '';
  `;
  const affectedRows = await db.query(query);

  appLogger(`Updated ${affectedRows.toString()} rows.`, 'migration-worker', 'logEntryTransformer');

  const pages: Page[] = await db.query(
    'SELECT "id", "filePath", "fileName", "thumbnail", "image", "width", "height" FROM "Pages" WHERE "thumbnail" = "image"',
    { type: QueryTypes.SELECT },
  );

  // Convert thumbnail creation to track progress
  for (let i = 0; i < pages.length; i++) {
    await createThumbnail(pages[i], jobStore, pages.length, i);
  }

  await db.query('UPDATE "Pages" SET "thumbnail" = REPLACE(image, ".jpg", "_thumb.jpg")', {
    type: QueryTypes.SELECT,
  });

  const missingOffsetPages: Page[] = await db.query(
    'SELECT "id", "filePath", "fileName", "thumbnail", "image", "width", "height" FROM "Pages" where "thumbnailScale" is null',
    { type: QueryTypes.SELECT },
  );

  // Update offsets with progress tracking
  for (let i = 0; i < missingOffsetPages.length; i++) {
    await updateOffsets(missingOffsetPages[i], db, jobStore, missingOffsetPages.length, i);
  }
  appLogger(
    `Migration for ${MIGRATION_TEST_NAME} done. denouncing now from queue`,
    'migration-worker',
    'logEntryTransformer',
  );

  // tell the queue i'm done
  denounceTransformation(MIGRATION_TEST_NAME);

  if (!!process.env.READWORKS_PROJECT_FILE)
    writeFileSync(
      process.env.READWORKS_PROJECT_FILE,
      MIGRATION_TEST_NAME.replace('transform-', ''),
      'utf-8',
    );

  jobStore.percentCompleted = 0.99;
  jobStore.output = `Transformer job ${MIGRATION_TEST_NAME} finished`;
  broadcastStatusUpdate(jobStore);

  process.exit();
})();
