# @ianduvall/memoize

[![npm](https://img.shields.io/npm/v/@ianduvall/memoize.svg)](https://npmjs.com/package/@ianduvall/memoize)
[![CI](https://github.com/ianduvall/memoize/actions/workflows/ci.yml/badge.svg)](https://github.com/ianduvall/memoize/actions/workflows/ci.yml)

A TypeScript library for memoizing pure functions with infinite cache size and automatic memory management.

## Install

```bash
pnpm add @ianduvall/memoize
```

## Important Notes

- **Pure Functions Only**: This library is designed for pure functions (i.e. functions that always return the same output given the same input and have no side effects)
- **Reference Equality**: Non-primitive values are compared by reference
- **Memory Management**: Uses WeakMap internally to allow garbage collection of unused cache entries

## Usage Examples

### Basic Usage

```ts
import { memoizePureFunction } from "@ianduvall/memoize";

const expensiveFunction = (x: number, y: number) => {
	// Some expensive computation
	console.log("Computing...");
	return x + y;
};

const memoized = memoizePureFunction(expensiveFunction);

// First call - executes function
const result1 = memoized(1, 2); // Logs: "Computing..."

// Second call with same arguments - returns cached result
const result2 = memoized(1, 2); // No log, returns cached result
```

### Custom Hash Functions

You can provide custom hash functions to control how arguments are compared for caching:

```ts
// Single hash function for all arguments
const memoizedWithHash = memoizePureFunction(expensiveFunction, {
	hashFunction: (arg) => JSON.stringify(arg),
});

// Different hash functions per argument position with full type inference
const processUser = (
	user: { name: string; id: number },
	settings: { theme: string },
) => `${user.name} prefers ${settings.theme}`;

const memoizedProcess = memoizePureFunction(processUser, {
	hashFunction: [
		(user) => user.id, // TypeScript infers: { name: string; id: number }
		(settings) => settings.theme, // TypeScript infers: { theme: string }
	],
});

// Mixed configuration - some arguments use custom hash, others use reference equality
const memoizedMixed = memoizePureFunction(processUser, {
	hashFunction: [
		(user) => user.id, // Custom hash for first argument
		undefined, // Reference equality for second argument
	],
});
```

### React Hooks

Alternative to React's `useMemo` hook, `memoizePureFunction` can be used to share memoization across usages of a hook. This is useful for hooks that need to do some expensive computation but need to be called in many places.

```ts
const calculateSomethingExpensive = memoizePureFunction(
	function expensiveComputation(user) {},
);
const useExpensiveUserProperty = () => {
	const user = useUser();

	return calculateSomethingExpensive(user);
};
```

This can be more ergonomic than alternative solutions to this problem, like hoisting into a context provider, because it maintains the lazy, pull-based sematics of `useMemo`.

### Cache Management

```ts
import {
	memoizePureFunction,
	clearCache,
	clearGlobalCache,
} from "@ianduvall/memoize";

const fn = (x: number) => x * 2;
const memoized = memoizePureFunction(fn);

// Clear cache for a specific function
clearCache(fn);

// Clear all caches globally
clearGlobalCache();
```

## Type Safety

The memoized function preserves the exact type signature of the original function and provides full type inference for hash functions:

```ts
const stringFunction = (x: number): string => x.toString();
const numberFunction = (x: string): number => Number.parseInt(x, 10);
const booleanFunction = (x: number): boolean => x > 0;

const memoizedString = memoizePureFunction(stringFunction);
const memoizedNumber = memoizePureFunction(numberFunction);
const memoizedBoolean = memoizePureFunction(booleanFunction);

// TypeScript will enforce correct types
const str: string = memoizedString(42); // ✅
const num: number = memoizedNumber("123"); // ✅
const bool: boolean = memoizedBoolean(5); // ✅
```

### Hash Function Type Inference

Hash functions receive correctly typed arguments based on the original function signature:

```ts
const processData = (
	user: { id: number; name: string },
	config: { enabled: boolean },
) => {
	return `${user.name}: ${config.enabled}`;
};

const memoized = memoizePureFunction(processData, {
	hashFunction: [
		(user) => user.id, // user is inferred as { id: number; name: string }
		(config) => config.enabled, // config is inferred as { enabled: boolean }
	],
});

// TypeScript provides full autocomplete and type checking for hash function parameters
```

## License

[MIT](./LICENSE) License © 2025 [Ian Duvall](https://github.com/ianduvall)
