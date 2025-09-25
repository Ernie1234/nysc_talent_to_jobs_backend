import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { createDocumentSchema, updateDocumentSchema } from '@/validations/document-validation';
import {
  createDocumentService,
  getArchivedDocumentsService,
  getDocumentsService,
  getSingleDocumentService,
  restoreArchiveService,
  updateDocumentService,
} from '@/services/document-service';
import { HTTPSTATUS } from '@/config/http-config';
import { BadRequestException, NotFoundException } from '@/utils/app-error';

export const createDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const { title, status, summary, themeColor, thumbnail } = createDocumentSchema.parse(req.body);

  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  const newDoc = await createDocumentService(
    user.id,
    `${user?.firstName} ${user?.lastName}`,
    user.email,
    {
      title,
      status,
      summary,
      themeColor,
      thumbnail,
    }
  );

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Document created successfully ✅',
    data: newDoc,
  });
});

export const updateDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const updateData = updateDocumentSchema.parse(req.body);

  const user = req.user;
  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  const updatedDocument = await updateDocumentService(documentId, user.id, updateData);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Document updated successfully',
    data: updatedDocument,
  });
});

export const restoreDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const { documentId, status } = req.body;

  const user = req.user;
  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  if (status !== 'archived') {
    throw new BadRequestException('Status must be archived before restore');
  }

  const restoredDocument = await restoreArchiveService(documentId, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Document restored successfully',
    data: restoredDocument,
  });
});

export const allDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  const documents = await getDocumentsService(user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Documents fetched successfully',
    data: documents,
  });
});

export const getSingleDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const user = req.user;
  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  const document = await getSingleDocumentService(documentId as string, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Document fetched successfully',
    data: document,
  });
});

export const deleteDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  const documents = await getArchivedDocumentsService(user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Documents deleted successfully',
    data: documents,
  });
});
