declare global {
  interface Array<T> {
    done(): Promise<{ -readonly [P in keyof this]: Awaited<this[P]> }>;
    asyncMap<U>(
      callbackfn: (value: any, index: number, array: any[]) => Promise<U>
    ): Promise<U[]>;
  }
}

Array.prototype.done = function () {
  return Promise.all(this);
};

Array.prototype.asyncMap = function <U>(
  callbackfn: (value: any, index: number, array: any[]) => Promise<U>
) {
  return this.map(callbackfn).done();
};

export {};
