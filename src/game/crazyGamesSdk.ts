/**
 * CrazyGames v3 SDK Integration Module for Ring Out
 * Docs: https://docs.crazygames.com/sdk/html5/v3/
 */

declare global {
  interface Window {
    CrazyGames?: {
      SDK?: {
        environment?: string;
        init: () => Promise<void>;
        ad: {
          requestAd: (
            type: 'midgame' | 'rewarded',
            callbacks?: {
              adStarted?: () => void;
              adFinished?: () => void;
              adError?: (error: unknown) => void;
            }
          ) => Promise<void>;
        };
        game: {
          gameplayStart: () => void;
          gameplayStop: () => void;
          happytime: () => void;
        };
        user: {
          getUser: () => Promise<{ id: string; username: string } | null>;
          getXsollaUserToken: () => Promise<string>;
        };
      };
    };
  }
}

class CrazyGamesManager {
  private isInitialized = false;
  private isAdPlaying = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (typeof window !== 'undefined' && window.CrazyGames?.SDK) {
      try {
        await window.CrazyGames.SDK.init();
        this.isInitialized = true;
        console.log('[CrazyGames] SDK v3 initialized successfully in', window.CrazyGames.SDK.environment);
      } catch (err) {
        console.warn('[CrazyGames] SDK init error:', err);
      }
    } else {
      console.log('[CrazyGames] Running in standalone/dev mode (Mock SDK active)');
    }
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.CrazyGames?.SDK;
  }

  public getIsAdPlaying(): boolean {
    return this.isAdPlaying;
  }

  public gameplayStart(): void {
    if (this.isAvailable()) {
      try {
        window.CrazyGames?.SDK?.game.gameplayStart();
      } catch (err) {
        console.warn('[CrazyGames] gameplayStart error:', err);
      }
    }
  }

  public gameplayStop(): void {
    if (this.isAvailable()) {
      try {
        window.CrazyGames?.SDK?.game.gameplayStop();
      } catch (err) {
        console.warn('[CrazyGames] gameplayStop error:', err);
      }
    }
  }

  public happyTime(): void {
    if (this.isAvailable()) {
      try {
        window.CrazyGames?.SDK?.game.happytime();
      } catch (err) {
        console.warn('[CrazyGames] happytime error:', err);
      }
    }
  }

  public requestMidgameAd(callbacks?: {
    onStart?: () => void;
    onFinish?: () => void;
    onError?: (err: unknown) => void;
  }): void {
    if (!this.isAvailable()) {
      console.log('[CrazyGames Mock] Midgame ad simulated (Development mode)');
      callbacks?.onStart?.();
      setTimeout(() => {
        callbacks?.onFinish?.();
      }, 500);
      return;
    }

    this.isAdPlaying = true;
    callbacks?.onStart?.();

    window.CrazyGames?.SDK?.ad.requestAd('midgame', {
      adStarted: () => {
        this.isAdPlaying = true;
        callbacks?.onStart?.();
      },
      adFinished: () => {
        this.isAdPlaying = false;
        callbacks?.onFinish?.();
      },
      adError: (err) => {
        this.isAdPlaying = false;
        console.warn('[CrazyGames] Midgame ad error:', err);
        callbacks?.onError?.(err);
        callbacks?.onFinish?.();
      },
    }).catch((err) => {
      this.isAdPlaying = false;
      callbacks?.onError?.(err);
      callbacks?.onFinish?.();
    });
  }

  public requestRewardedAd(callbacks: {
    onStart?: () => void;
    onReward: () => void;
    onFinish?: () => void;
    onError?: (err: unknown) => void;
  }): void {
    if (!this.isAvailable()) {
      console.log('[CrazyGames Mock] Rewarded ad simulated (Development mode) -> Granting reward!');
      callbacks.onStart?.();
      setTimeout(() => {
        callbacks.onReward();
        callbacks.onFinish?.();
      }, 600);
      return;
    }

    this.isAdPlaying = true;
    callbacks.onStart?.();

    window.CrazyGames?.SDK?.ad.requestAd('rewarded', {
      adStarted: () => {
        this.isAdPlaying = true;
        callbacks.onStart?.();
      },
      adFinished: () => {
        this.isAdPlaying = false;
        callbacks.onReward();
        callbacks.onFinish?.();
      },
      adError: (err) => {
        this.isAdPlaying = false;
        console.warn('[CrazyGames] Rewarded ad error:', err);
        callbacks.onError?.(err);
        callbacks.onFinish?.();
      },
    }).catch((err) => {
      this.isAdPlaying = false;
      callbacks.onError?.(err);
      callbacks.onFinish?.();
    });
  }

  public async getXsollaToken(): Promise<string | null> {
    if (!this.isAvailable()) {
      console.log('[CrazyGames Mock] getXsollaToken simulated');
      return null;
    }
    try {
      return (await window.CrazyGames?.SDK?.user.getXsollaUserToken()) || null;
    } catch (err) {
      console.warn('[CrazyGames] getXsollaUserToken error:', err);
      return null;
    }
  }
}

export const crazyGames = new CrazyGamesManager();
