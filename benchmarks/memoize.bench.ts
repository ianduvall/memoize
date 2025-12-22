import fastMemoize from "fast-memoize";
import { bench, describe } from "vitest";
import { memoizePureFunction } from "../src/index";

// ============================================
// Cache Hit Scenarios (measuring lookup speed)
// ============================================

describe("single primitive argument - cache hit", () => {
	const fn = (x: number) => x * 2;
	const memoized = memoizePureFunction(fn);
	const fastMemoized = fastMemoize(fn);

	// Warm up cache
	memoized(42);
	fastMemoized(42);

	bench("@ianduvall/memoize", () => {
		memoized(42);
	});

	bench("fast-memoize", () => {
		fastMemoized(42);
	});
});

describe("multiple primitive arguments - cache hit", () => {
	const fn = (a: number, b: number, c: number) => a + b + c;
	const memoized = memoizePureFunction(fn);
	const fastMemoized = fastMemoize(fn);

	// Warm up cache
	memoized(1, 2, 3);
	fastMemoized(1, 2, 3);

	bench("@ianduvall/memoize", () => {
		memoized(1, 2, 3);
	});

	bench("fast-memoize", () => {
		fastMemoized(1, 2, 3);
	});
});

describe("string argument - cache hit", () => {
	const fn = (s: string) => s.toUpperCase();
	const memoized = memoizePureFunction(fn);
	const fastMemoized = fastMemoize(fn);

	// Warm up cache
	memoized("hello world");
	fastMemoized("hello world");

	bench("@ianduvall/memoize", () => {
		memoized("hello world");
	});

	bench("fast-memoize", () => {
		fastMemoized("hello world");
	});
});

describe("object argument (same reference) - cache hit", () => {
	const fn = (obj: { a: number; b: number }) => obj.a + obj.b;
	const memoized = memoizePureFunction(fn);
	const fastMemoized = fastMemoize(fn);

	const obj = { a: 1, b: 2 };

	// Warm up cache
	memoized(obj);
	fastMemoized(obj);

	bench("@ianduvall/memoize", () => {
		memoized(obj);
	});

	bench("fast-memoize", () => {
		fastMemoized(obj);
	});
});

// =============================================
// Cache Miss Scenarios (measuring insertion speed)
// =============================================

describe("single argument - cache miss", () => {
	const fn = (x: number) => x * 2;

	bench("@ianduvall/memoize", () => {
		// Create fresh memoized function each iteration to ensure cache miss
		const memoized = memoizePureFunction(fn);
		memoized(1);
		memoized(2);
		memoized(3);
		memoized(4);
		memoized(5);
	});

	bench("fast-memoize", () => {
		const fastMemoized = fastMemoize(fn);
		fastMemoized(1);
		fastMemoized(2);
		fastMemoized(3);
		fastMemoized(4);
		fastMemoized(5);
	});
});

describe("multiple arguments - cache miss", () => {
	const fn = (a: number, b: number) => a + b;

	bench("@ianduvall/memoize", () => {
		const memoized = memoizePureFunction(fn);
		memoized(1, 2);
		memoized(3, 4);
		memoized(5, 6);
		memoized(7, 8);
		memoized(9, 10);
	});

	bench("fast-memoize", () => {
		const fastMemoized = fastMemoize(fn);
		fastMemoized(1, 2);
		fastMemoized(3, 4);
		fastMemoized(5, 6);
		fastMemoized(7, 8);
		fastMemoized(9, 10);
	});
});

// =============================================
// Mixed Scenarios (hits and misses)
// =============================================

describe("fibonacci (recursive memoization)", () => {
	bench("@ianduvall/memoize", () => {
		const fib: (n: number) => number = memoizePureFunction((n: number) => {
			if (n <= 1) return n;
			return fib(n - 1) + fib(n - 2);
		});
		fib(20);
	});

	bench("fast-memoize", () => {
		const fib: (n: number) => number = fastMemoize((n: number) => {
			if (n <= 1) return n;
			return fib(n - 1) + fib(n - 2);
		});
		fib(20);
	});
});

describe("mixed hits and misses", () => {
	const fn = (x: number) => x * 2;
	const memoized = memoizePureFunction(fn);
	const fastMemoized = fastMemoize(fn);

	// Pre-populate cache with some values
	for (let i = 0; i < 50; i++) {
		memoized(i);
		fastMemoized(i);
	}

	let counter = 0;

	bench("@ianduvall/memoize", () => {
		// Mix of hits (0-49) and misses (50+)
		const key = counter % 100;
		memoized(key);
		counter++;
	});

	counter = 0;

	bench("fast-memoize", () => {
		const key = counter % 100;
		fastMemoized(key);
		counter++;
	});
});
