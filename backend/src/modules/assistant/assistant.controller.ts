import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { sendResponse } from '../../helpers/globals';
import { enqueueChat } from './queue';
import { sanitizeHistory } from './history';

// The question is pushed onto a BullMQ queue. Only ONE chat job is processed
// at a time (see worker.ts concurrency); everyone else waits and is streamed
// progress + the answer over Socket.IO.
export const ask = catchAsync(async (req: any, res: any) => {
  const { question } = req.body;
  const history = sanitizeHistory(req.body.history);
  const requestId =
    typeof req.body.requestId === 'string' && req.body.requestId
      ? req.body.requestId.slice(0, 64)
      : `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (typeof question !== 'string' || !question.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Question is required');
  }

  const result = await enqueueChat({
    userId: req.user.id,
    requestId,
    question: question.trim(),
    history,
  });

  sendResponse(res, {
    code: StatusCodes.ACCEPTED,
    data: result,
  });
});