import jwt from 'jsonwebtoken';

function getTokenPayload(token) {
    return jwt.verify(token, process.env.APP_SECRET);
}

export function getUserId(req, authToken) {
    if (req) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
          throw new Error('No token found');
        }
        const { userId } = getTokenPayload(token);
        return userId;
      }
    } else if (authToken) {
      const { userId } = getTokenPayload(authToken);
      return userId;
    }
  
    throw new Error('Not authenticated');
}

export function checkPassword(password) {
  let result = {};
  result.isValid = false;
  if (password.length < 8) {
    result.message = 'MUST contain at least 8 characters';
    return result;
    // throw new Error();
  }
  if (password.length > 16) {
    result.message = 'MUST contain at most 16 characters';
    return result;
    // throw new Error('MUST contain at most 16 characters');
  }
  if(! /^[a-z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+$/.test(password)) {
    result.message = 'Contains INVALID characters';
    return result;
    // throw new Error("INVALID characters");
  }
  result.isValid = true;
  return result;
}

export function updateBillingDate(oldDate, frequency) {
  const now = new Date();
  oldDate = new Date(oldDate);
  console.log(oldDate);
  let diffMonths;
  switch (frequency) {
    case 'DAILY':
      oldDate = now;
      break;
    case 'WEEKLY':
      let diff = (now.getTime() - oldDate.getTime()) / 1000;
      diff /= (60 * 60 * 24 * 7);
      let weeks = Math.ceil(diff);
      oldDate.setDate(oldDate.getDate() + weeks*7);
      break;
    case 'MONTHLY':
      oldDate.setMonth(now.getMonth());
      if (oldDate < now) {
        oldDate.setMonth(oldDate.getMonth()+1);
      }
      break;
    case 'QUARTERLY':
      diffMonths = (now.getFullYear() - oldDate.getFullYear()) *  12;
      diffMonths -= oldDate.getMonth();
      diffMonths += now.getMonth();
      // get upper bound
      if  (now.getDate() > oldDate.getDate()) {
        diffMonths += 1;
      }
      let increQuarters = Math.ceil(diffMonths/3);
      oldDate.setMonth(oldDate.getMonth() + increQuarters*3);
      break;
    case 'HALFYEARLY':
      diffMonths = (now.getFullYear() - oldDate.getFullYear()) * 12;
      diffMonths -= oldDate.getMonth();
      diffMonths += now.getMonth();
      // get upper bound
      if  (now.getDate() > oldDate.getDate()) {
        diffMonths += 1;
      }
      let increHalfYears = Math.ceil(diffMonths/6);
      oldDate.setMonth(oldDate.getMonth() + increHalfYears*6);
      break;
    case 'YEARLY':
      oldDate.setFullYear(oldDate.getFullYear()+1);
      break;
  }
  console.log(oldDate);
  return oldDate;
}