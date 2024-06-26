import Settings from './local-storage.js';
import Logger from './logger.js';

// TODO: Absolutely redo these, they're just so I can get the profile page going
enum ErrorCode {
  InvalidRequest = 1,
  Maintenance = 2,
  InvalidApiKey = 3,
  InternalError = 4,
  UserDisabled = 5,
  CachedOnly = 6,
  ServiceDown = 999,
}

export type TscSpy = {
  success: true;
  message: string;
  insertedAt: string; // this is a date in string format
  spy: {
    userId: number;
    userName: string;
    estimate: {
      stats: number;
      lastUpdated: string; // this is a date in string format
    };
    statInterval?: {
      min: string;
      max: string;
      fairFight: string;
      battleScore: number;
      lastUpdated: string; // this is a date in string format
    };
  };
};

type TscSpyErrorable =
  | TscSpy
  | {
      success: false;
      code: ErrorCode;
    }
  | {
      error: boolean;
      message: string;
    };

type Errorable<T> = T | { error: boolean; message: string };

export type UserBasic = {
  level: number;
  gender: 'Enby' | 'Female' | 'Male';
  player_id: number;
  name: string;
  status: {
    color: 'blue' | 'green' | 'red';
    description: string;
    details: string;
    state: 'Hospital' | 'Okay' | 'Jail' | 'Traveling' | 'Abroad' | 'Federal' | 'Fallen';
    // Epoch TS (in seconds)
    until: number;
  };
};

export function errorToString(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.InvalidRequest:
      return 'Invalid request';
    case ErrorCode.Maintenance:
      return 'Maintenance';
    case ErrorCode.InvalidApiKey:
      return 'Invalid API Key';
    case ErrorCode.InternalError:
      return 'Internal Error';
    case ErrorCode.UserDisabled:
      return 'User Disabled';
    case ErrorCode.CachedOnly:
      return 'Cached Only';
    case ErrorCode.ServiceDown:
      return 'Service Down';
    default:
      return 'Unknown error';
  }
}

const CACHE_TIME = 12 * 60 * 60 * 1000; // 12 hours

export function getTSCSpyOld(userId: string): Promise<TscSpyErrorable> {
  const spy = Settings.getJSON<TscSpy>(`spy-${userId}`);

  if (spy) {
    if (spy.insertedAt && new Date().getTime() - new Date(spy.insertedAt).getTime() < CACHE_TIME) {
      Logger.debug('Spy cache still valid');
      return Promise.resolve(spy);
    } else {
      Logger.debug('Spy cache expired, fetching new data');
      Settings.setJSON(`spy-${userId}`, null);
    }
  }

  const data = {
    apiKey: Settings.get('tsc-key') ?? '',
    userId: userId,
  };

  return new Promise((resolve, _reject) => {
    const request = GM.xmlHttpRequest ?? (GM as any).xmlhttpRequest;
    request({
      method: 'POST',
      url: `https://tsc.diicot.cc/next`,
      timeout: 30_000,
      headers: {
        Authorization: '10000000-6000-0000-0009-000000000001',
        'x-requested-with': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(data),
      onload(response: Tampermonkey.Response<TscSpyErrorable>) {
        const res = JSON.parse(response.responseText) as TscSpyErrorable;

        if (!('error' in res) && res.success) {
          Settings.setJSON(`spy-${userId}`, {
            ...res,
            insertedAt: new Date().getTime(),
          });
        }

        resolve(res);
      },
      onerror(err: Tampermonkey.ErrorResponse) {
        Logger.debug(`Data used: `, data);
        resolve({
          error: true,
          message: `Failed to fetch spy ${err.statusText}`,
        });
      },
      onabort() {
        resolve({
          error: true,
          message: 'Request aborted',
        });
      },
      ontimeout() {
        resolve({
          error: true,
          message: 'Request timed out',
        });
      },
    });
  });
}

export async function getLocalUserData(): Promise<Errorable<UserBasic>> {
  if (Settings.get('tsc-key') === null) {
    return {
      error: true,
      message: 'API Key not set',
    };
  }
  const userData = Settings.getJSON<UserBasic & { insertedAt: Date }>('user-data');

  if (userData) {
    if (
      userData.insertedAt &&
      new Date().getTime() - new Date(userData.insertedAt).getTime() < CACHE_TIME
    ) {
      Logger.debug('User data cache still valid');
      return userData;
    } else {
      Logger.debug('User data cache expired, fetching new data');
      Settings.setJSON('user-data', null);
    }
  }

  const res = await fetch(
    `https://api.torn.com/user/?selections=basic&key=${Settings.get('tsc-key')}&comment=TSC-Next`
  );

  if (!res.ok) {
    return {
      error: true,
      message: res.statusText,
    };
  }

  const data = await res.json();

  if (data.error) {
    return {
      error: true,
      message: data.error.error,
    };
  }

  Settings.setJSON('user-data', {
    ...data,
    insertedAt: new Date().getTime(),
  });

  return data;
}

export function getYATASpy(_userId: string): Promise<unknown> {
  // todo
  throw new Error('Not implemented');
}

export function getTornStatsSpy(_userId: string): Promise<unknown> {
  // todo
  throw new Error('Not implemented');
}
