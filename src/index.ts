import { AnyKeyWeakMap } from "./any-key-weak-map";

const UNCACHED = 1;
const CACHED = 2;

interface BaseCacheNode<T> {
	cache: AnyKeyWeakMap<any, CacheNode<T>>;
}
interface UncachedNode<T = any> extends BaseCacheNode<T> {
	status: typeof UNCACHED;
	result: void;
}
interface CachedNode<T = any> extends BaseCacheNode<T> {
	status: typeof CACHED;
	result: T;
}
type CacheNode<T = any> = CachedNode<T> | UncachedNode<T>;

type AnyFunction = (this: any, ...args: any[]) => any;

type MemoizedFunction<Fn extends AnyFunction> = Fn & {
	clearCache: (...args: ClearCacheArgs<Fn>) => boolean;
};

type HashFunction<T = any> = (value: T) => any;

type HashFunctionTuple<T extends readonly any[]> = {
	[K in keyof T]?: HashFunction<T[K]>;
};

type Prefixes<T extends readonly unknown[]> = T extends readonly [
	infer Head,
	...infer Tail,
]
	? [] | [Head, ...Prefixes<Tail>]
	: [];

type ClearCacheArgs<Fn extends AnyFunction> =
	number extends Parameters<Fn>["length"] ? any[] : Prefixes<Parameters<Fn>>;

interface MemoizeOptions<Fn extends AnyFunction> {
	hashFunction?: HashFunction | HashFunctionTuple<Parameters<Fn>>;
}

/**
 * https://github.com/tc39/proposal-upsert
 */
function getOrInsert<TItem>(
	cache: {
		get: (item: TItem) => CacheNode | undefined;
		set: (item: TItem, node: CacheNode) => void;
	},
	item: TItem,
): CacheNode {
	let cacheNode = cache.get(item);
	if (!cacheNode) {
		cacheNode = {
			status: UNCACHED,
			result: undefined,
			cache: new AnyKeyWeakMap<any, CacheNode>(),
		} as const satisfies UncachedNode;
		cache.set(item, cacheNode);
	}
	return cacheNode;
}

function applyHashFunction(
	arg: any,
	index: number,
	options?: MemoizeOptions<any>,
): any {
	let cacheKey = arg;

	if (options?.hashFunction) {
		if (typeof options.hashFunction === "function") {
			cacheKey = options.hashFunction(arg);
		} else {
			const hashFn = options.hashFunction[index];
			if (hashFn) {
				cacheKey = hashFn(arg);
			}
		}
	}

	return cacheKey;
}

export const memoizePureFunction = <Fn extends AnyFunction>(
	fn: Fn,
	options?: MemoizeOptions<Fn>,
): MemoizedFunction<Fn> => {
	let functionCache = new AnyKeyWeakMap<Fn, CacheNode>();

	const memoizedPureFunction = function (
		this: ThisParameterType<Fn>,
		...args: Parameters<Fn>
	) {
		let cacheNode = getOrInsert(functionCache, fn);
		for (const [i, arg] of args.entries()) {
			const cacheKey = applyHashFunction(arg, i, options);
			cacheNode = getOrInsert(cacheNode.cache, cacheKey);
		}

		if (cacheNode.status === UNCACHED) {
			cacheNode.result = fn.apply(this, args);
			(cacheNode as unknown as CachedNode).status = CACHED;
		}

		return cacheNode.result;
	} as MemoizedFunction<Fn>;

	memoizedPureFunction.clearCache = ((...args: any[]): boolean => {
		if (args.length === 0) {
			functionCache = new AnyKeyWeakMap<Fn, CacheNode>();
			return true;
		}

		const rootNode = functionCache.get(fn);
		if (!rootNode) return false;

		let currentNode = rootNode;
		for (let i = 0; i < args.length - 1; i++) {
			const cacheKey = applyHashFunction(args[i], i, options);
			const nextNode = currentNode.cache.get(cacheKey);
			if (!nextNode) return false;
			currentNode = nextNode;
		}

		const lastIndex = args.length - 1;
		const lastCacheKey = applyHashFunction(args[lastIndex], lastIndex, options);
		return currentNode.cache.delete(lastCacheKey);
	}) as MemoizedFunction<Fn>["clearCache"];

	return memoizedPureFunction as unknown as MemoizedFunction<Fn>;
};
