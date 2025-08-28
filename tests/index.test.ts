import { describe, expect, test, vi } from "vitest";
import {
	clearCache,
	clearGlobalCache,
	memoizePureFunction,
} from "../src/index";

describe("memoizePureFunction", () => {
	test("should memoize function calls with same arguments", () => {
		const mockFn = vi.fn((x: number, y: number) => x + y);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(1, 2);
		const result2 = memoized(1, 2);

		expect(result1).toBe(3);
		expect(result2).toBe(3);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should call function multiple times for different arguments", () => {
		const mockFn = vi.fn((x: number, y: number) => x + y);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(1, 2);
		const result2 = memoized(3, 4);
		const result3 = memoized(1, 2);

		expect(result1).toBe(3);
		expect(result2).toBe(7);
		expect(result3).toBe(3);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle functions with no arguments", () => {
		const mockFn = vi.fn(() => Math.random());
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized();
		const result2 = memoized();

		expect(result1).toBe(result2);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should handle functions with single argument", () => {
		const mockFn = vi.fn((x: number) => x * 2);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(5);
		const result2 = memoized(5);
		const result3 = memoized(10);

		expect(result1).toBe(10);
		expect(result2).toBe(10);
		expect(result3).toBe(20);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle different types of arguments", () => {
		const mockFn = vi.fn(
			(str: string, num: number, bool: boolean) => `${str}-${num}-${bool}`,
		);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized("test", 42, true);
		const result2 = memoized("test", 42, true);
		const result3 = memoized("test", 42, false);

		expect(result1).toBe("test-42-true");
		expect(result2).toBe("test-42-true");
		expect(result3).toBe("test-42-false");
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle object arguments", () => {
		const obj1 = { a: 1 };
		const obj2 = { a: 1 };
		const mockFn = vi.fn((obj: { a: number }) => obj.a * 2);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(obj1);
		const result2 = memoized(obj1);
		const result3 = memoized(obj2);

		expect(result1).toBe(2);
		expect(result2).toBe(2);
		expect(result3).toBe(2);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle array arguments", () => {
		const arr1 = [1, 2, 3];
		const arr2 = [1, 2, 3];
		const mockFn = vi.fn((arr: number[]) => arr.reduce((sum, n) => sum + n, 0));
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(arr1);
		const result2 = memoized(arr1);
		const result3 = memoized(arr2);

		expect(result1).toBe(6);
		expect(result2).toBe(6);
		expect(result3).toBe(6);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle null and undefined arguments", () => {
		const mockFn = vi.fn((a: any, b: any) => `${a}-${b}`);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(null, undefined);
		const result2 = memoized(null, undefined);
		const result3 = memoized(undefined, null);

		expect(result1).toBe("null-undefined");
		expect(result2).toBe("null-undefined");
		expect(result3).toBe("undefined-null");
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should preserve function return types", () => {
		const stringFn = (x: number) => x.toString();
		const numberFn = (x: string) => Number.parseInt(x, 10);
		const booleanFn = (x: number) => x > 0;

		const memoizedString = memoizePureFunction(stringFn);
		const memoizedNumber = memoizePureFunction(numberFn);
		const memoizedBoolean = memoizePureFunction(booleanFn);

		const stringResult: string = memoizedString(42);
		const numberResult: number = memoizedNumber("123");
		const booleanResult: boolean = memoizedBoolean(5);

		expect(stringResult).toBe("42");
		expect(numberResult).toBe(123);
		expect(booleanResult).toBe(true);
	});

	test("should handle functions that throw errors", () => {
		const mockFn = vi.fn((shouldThrow: boolean) => {
			if (shouldThrow) throw new Error("Test error");
			return "success";
		});
		const memoized = memoizePureFunction(mockFn);

		expect(() => memoized(true)).toThrow("Test error");
		expect(() => memoized(true)).toThrow("Test error");
		expect(memoized(false)).toBe("success");
		expect(memoized(false)).toBe("success");
		expect(mockFn).toHaveBeenCalledTimes(3);
	});

	test("should work with functions that return undefined", () => {
		const mockFn = vi.fn(() => undefined);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized();
		const result2 = memoized();

		expect(result1).toBeUndefined();
		expect(result2).toBeUndefined();
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should work with functions that return null", () => {
		const mockFn = vi.fn(() => null);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized();
		const result2 = memoized();

		expect(result1).toBeNull();
		expect(result2).toBeNull();
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should handle many arguments", () => {
		const mockFn = vi.fn((...args: number[]) =>
			args.reduce((sum, n) => sum + n, 0),
		);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(1, 2, 3, 4, 5);
		const result2 = memoized(1, 2, 3, 4, 5);
		const result3 = memoized(1, 2, 3, 4, 6);

		expect(result1).toBe(15);
		expect(result2).toBe(15);
		expect(result3).toBe(16);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle argument order sensitivity", () => {
		const mockFn = vi.fn((a: number, b: number) => a - b);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(5, 3);
		const result2 = memoized(3, 5);
		const result3 = memoized(5, 3);

		expect(result1).toBe(2);
		expect(result2).toBe(-2);
		expect(result3).toBe(2);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});
});

describe("clearCache", () => {
	test("should clear cache for specific function", () => {
		const mockFn = vi.fn((x: number) => x * 2);
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized(5);
		expect(result1).toBe(10);
		expect(mockFn).toHaveBeenCalledTimes(1);

		const result2 = memoized(5);
		expect(result2).toBe(10);
		expect(mockFn).toHaveBeenCalledTimes(1);

		clearCache(mockFn);

		const result3 = memoized(5);
		expect(result3).toBe(10);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should only clear cache for the specified function", () => {
		const mockFn1 = vi.fn((x: number) => x * 2);
		const mockFn2 = vi.fn((x: number) => x * 3);
		const memoized1 = memoizePureFunction(mockFn1);
		const memoized2 = memoizePureFunction(mockFn2);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		clearCache(mockFn1);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(2);
		expect(mockFn2).toHaveBeenCalledTimes(1);
	});

	test("should handle clearing cache for function with multiple arguments", () => {
		const mockFn = vi.fn((x: number, y: number) => x + y);
		const memoized = memoizePureFunction(mockFn);

		memoized(1, 2);
		memoized(3, 4);
		memoized(1, 2);
		expect(mockFn).toHaveBeenCalledTimes(2);

		clearCache(mockFn);

		memoized(1, 2);
		memoized(3, 4);
		expect(mockFn).toHaveBeenCalledTimes(4);
	});

	test("should handle clearing cache for function that hasn't been memoized yet", () => {
		const mockFn = vi.fn((x: number) => x * 2);

		expect(() => clearCache(mockFn)).not.toThrow();

		const memoized = memoizePureFunction(mockFn);
		const result = memoized(5);
		expect(result).toBe(10);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should clear cache for functions with no arguments", () => {
		const mockFn = vi.fn(() => Math.random());
		const memoized = memoizePureFunction(mockFn);

		const result1 = memoized();
		const result2 = memoized();
		expect(result1).toBe(result2);
		expect(mockFn).toHaveBeenCalledTimes(1);

		clearCache(mockFn);

		memoized();
		expect(mockFn).toHaveBeenCalledTimes(2);
	});
});

describe("clearGlobalCache", () => {
	test("should clear all cached functions", () => {
		const mockFn1 = vi.fn((x: number) => x * 2);
		const mockFn2 = vi.fn((x: number) => x * 3);
		const memoized1 = memoizePureFunction(mockFn1);
		const memoized2 = memoizePureFunction(mockFn2);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		clearGlobalCache();

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(2);
		expect(mockFn2).toHaveBeenCalledTimes(2);
	});

	test("should clear cache for functions with different argument patterns", () => {
		const mockFn1 = vi.fn((x: number, y: number) => x + y);
		const mockFn2 = vi.fn((str: string) => str.length);
		const mockFn3 = vi.fn(() => "no-args");

		const memoized1 = memoizePureFunction(mockFn1);
		const memoized2 = memoizePureFunction(mockFn2);
		const memoized3 = memoizePureFunction(mockFn3);

		memoized1(1, 2);
		memoized1(3, 4);
		memoized2("hello");
		memoized3();
		expect(mockFn1).toHaveBeenCalledTimes(2);
		expect(mockFn2).toHaveBeenCalledTimes(1);
		expect(mockFn3).toHaveBeenCalledTimes(1);

		memoized1(1, 2);
		memoized2("hello");
		memoized3();
		expect(mockFn1).toHaveBeenCalledTimes(2);
		expect(mockFn2).toHaveBeenCalledTimes(1);
		expect(mockFn3).toHaveBeenCalledTimes(1);

		clearGlobalCache();

		memoized1(1, 2);
		memoized2("hello");
		memoized3();
		expect(mockFn1).toHaveBeenCalledTimes(3);
		expect(mockFn2).toHaveBeenCalledTimes(2);
		expect(mockFn3).toHaveBeenCalledTimes(2);
	});

	test("should not throw when clearing empty cache", () => {
		expect(() => clearGlobalCache()).not.toThrow();
	});

	test("should allow new functions to be memoized after global clear", () => {
		const mockFn1 = vi.fn((x: number) => x * 2);
		const memoized1 = memoizePureFunction(mockFn1);

		memoized1(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);

		clearGlobalCache();

		const mockFn2 = vi.fn((x: number) => x * 3);
		const memoized2 = memoizePureFunction(mockFn2);

		memoized2(5);
		memoized2(5);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		memoized1(5);
		expect(mockFn1).toHaveBeenCalledTimes(2);
	});
});

describe("global cache behavior", () => {
	test("should share cache across multiple calls to memoizePureFunction with same function", () => {
		const mockFn = vi.fn((x: number) => x * 2);
		const memoized1 = memoizePureFunction(mockFn);
		const memoized2 = memoizePureFunction(mockFn);

		const result1 = memoized1(5);
		expect(result1).toBe(10);
		expect(mockFn).toHaveBeenCalledTimes(1);

		const result2 = memoized2(5);
		expect(result2).toBe(10);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should maintain separate caches for different function instances", () => {
		const createMultiplier = (factor: number) => (x: number) => x * factor;
		const double = vi.fn(createMultiplier(2));
		const triple = vi.fn(createMultiplier(3));

		const memoizedDouble = memoizePureFunction(double);
		const memoizedTriple = memoizePureFunction(triple);

		memoizedDouble(5);
		memoizedTriple(5);
		expect(double).toHaveBeenCalledTimes(1);
		expect(triple).toHaveBeenCalledTimes(1);

		memoizedDouble(5);
		memoizedTriple(5);
		expect(double).toHaveBeenCalledTimes(1);
		expect(triple).toHaveBeenCalledTimes(1);

		clearCache(double);

		memoizedDouble(5);
		memoizedTriple(5);
		expect(double).toHaveBeenCalledTimes(2);
		expect(triple).toHaveBeenCalledTimes(1);
	});

	test("should handle global cache with functions of different signatures", () => {
		const addFn = vi.fn((a: number, b: number) => a + b);
		const lenFn = vi.fn((str: string) => str.length);
		const noArgFn = vi.fn(() => "constant");

		const memoizedAdd = memoizePureFunction(addFn);
		const memoizedLen = memoizePureFunction(lenFn);
		const memoizedNoArg = memoizePureFunction(noArgFn);

		memoizedAdd(1, 2);
		memoizedLen("test");
		memoizedNoArg();
		expect(addFn).toHaveBeenCalledTimes(1);
		expect(lenFn).toHaveBeenCalledTimes(1);
		expect(noArgFn).toHaveBeenCalledTimes(1);

		memoizedAdd(1, 2);
		memoizedLen("test");
		memoizedNoArg();
		expect(addFn).toHaveBeenCalledTimes(1);
		expect(lenFn).toHaveBeenCalledTimes(1);
		expect(noArgFn).toHaveBeenCalledTimes(1);

		clearCache(lenFn);

		memoizedAdd(1, 2);
		memoizedLen("test");
		memoizedNoArg();
		expect(addFn).toHaveBeenCalledTimes(1);
		expect(lenFn).toHaveBeenCalledTimes(2);
		expect(noArgFn).toHaveBeenCalledTimes(1);
	});

	test("should handle re-memoizing function after cache clear", () => {
		const mockFn = vi.fn((x: number) => x * 2);
		let memoized = memoizePureFunction(mockFn);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(1);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(1);

		clearCache(mockFn);
		memoized = memoizePureFunction(mockFn);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(2);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});
});

describe("type inference", () => {
	test("should infer correct types for hash functions", () => {
		const mockFn = vi.fn(
			(
				user: { name: string; id: number },
				product: { price: number; category: string },
			) => `${user.name} bought ${product.category} for ${product.price}`,
		);

		const singleHashMemoized = memoizePureFunction(mockFn, {
			hashFunction: (arg: any) =>
				typeof arg === "object" ? JSON.stringify(arg) : arg,
		});

		const arrayHashMemoized = memoizePureFunction(mockFn, {
			hashFunction: [(user) => user.id, (product) => product.category],
		});

		const user = { name: "Alice", id: 1 };
		const product = { price: 100, category: "electronics" };

		const result1 = singleHashMemoized(user, product);
		const result2 = arrayHashMemoized(user, product);

		expect(result1).toBe("Alice bought electronics for 100");
		expect(result2).toBe("Alice bought electronics for 100");
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle mixed hash function array with correct types", () => {
		const mockFn = vi.fn(
			(str: string, num: number, bool: boolean) => `${str}-${num}-${bool}`,
		);

		const memoized = memoizePureFunction(mockFn, {
			hashFunction: [
				(s) => s.toUpperCase(),
				undefined,
				(b) => (b ? "TRUE" : "FALSE"),
			],
		});

		const result = memoized("test", 42, true);
		expect(result).toBe("test-42-true");
		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});

describe("custom hash functions", () => {
	test("should use single hash function for all arguments", () => {
		const mockFn = vi.fn(
			(obj1: { id: number }, obj2: { id: number }) => obj1.id + obj2.id,
		);
		const hashFn = vi.fn((obj: { id: number }) => obj.id);
		const memoized = memoizePureFunction(mockFn, { hashFunction: hashFn });

		const obj1a = { id: 1 };
		const obj1b = { id: 1 };
		const obj2a = { id: 2 };
		const obj2b = { id: 2 };

		const result1 = memoized(obj1a, obj2a);
		const result2 = memoized(obj1b, obj2b);

		expect(result1).toBe(3);
		expect(result2).toBe(3);
		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(hashFn).toHaveBeenCalledTimes(4);
	});

	test("should use different hash functions per argument index", () => {
		const mockFn = vi.fn(
			(user: { name: string }, product: { price: number }) =>
				`${user.name}-${product.price}`,
		);
		const userHashFn = vi.fn((user: { name: string }) => user.name);
		const productHashFn = vi.fn((product: { price: number }) => product.price);
		const memoized = memoizePureFunction(mockFn, {
			hashFunction: [userHashFn, productHashFn],
		});

		const user1a = { name: "john" };
		const user1b = { name: "john" };
		const product1a = { price: 100 };
		const product1b = { price: 100 };

		const result1 = memoized(user1a, product1a);
		const result2 = memoized(user1b, product1b);

		expect(result1).toBe("john-100");
		expect(result2).toBe("john-100");
		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(userHashFn).toHaveBeenCalledTimes(2);
		expect(productHashFn).toHaveBeenCalledTimes(2);
	});

	test("should use different hash functions for different argument positions", () => {
		const mockFn = vi.fn(
			(a: { val: number }, b: { val: number }) => a.val + b.val,
		);
		const firstArgHashFn = vi.fn((obj: { val: number }) => `first-${obj.val}`);
		const secondArgHashFn = vi.fn(
			(obj: { val: number }) => `second-${obj.val}`,
		);
		const memoized = memoizePureFunction(mockFn, {
			hashFunction: [firstArgHashFn, secondArgHashFn],
		});

		const obj1 = { val: 1 };
		const obj2 = { val: 2 };

		memoized(obj1, obj2);

		expect(firstArgHashFn).toHaveBeenCalledWith(obj1);
		expect(secondArgHashFn).toHaveBeenCalledWith(obj2);
		expect(firstArgHashFn).not.toHaveBeenCalledWith(obj2);
		expect(secondArgHashFn).not.toHaveBeenCalledWith(obj1);
	});

	test("should work with string hash function", () => {
		const mockFn = vi.fn(
			(obj: { name: string; age: number }) => `${obj.name} is ${obj.age}`,
		);
		const hashFn = (obj: { name: string; age: number }) =>
			`${obj.name}-${obj.age}`;
		const memoized = memoizePureFunction(mockFn, { hashFunction: hashFn });

		const person1 = { name: "Alice", age: 25 };
		const person2 = { name: "Alice", age: 25 };
		const person3 = { name: "Bob", age: 30 };

		const result1 = memoized(person1);
		const result2 = memoized(person2);
		const result3 = memoized(person3);

		expect(result1).toBe("Alice is 25");
		expect(result2).toBe("Alice is 25");
		expect(result3).toBe("Bob is 30");
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle hash function returning objects", () => {
		const mockFn = vi.fn((obj: { data: any }) => obj.data);
		const keyObj1 = { key: "test" };
		const hashFn = () => keyObj1;
		const memoized = memoizePureFunction(mockFn, { hashFunction: hashFn });

		const input1 = { data: "value1" };
		const input2 = { data: "value2" };

		const result1 = memoized(input1);
		const result2 = memoized(input2);

		expect(result1).toBe("value1");
		expect(result2).toBe("value1");
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should handle hash function returning null/undefined", () => {
		const mockFn = vi.fn((obj: any) => obj?.value || "default");
		const hashFn = vi.fn(() => null);
		const memoized = memoizePureFunction(mockFn, { hashFunction: hashFn });

		const obj1 = { value: "first" };
		const obj2 = { value: "second" };

		const result1 = memoized(obj1);
		const result2 = memoized(obj2);

		expect(result1).toBe("first");
		expect(result2).toBe("first");
		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(hashFn).toHaveBeenCalledTimes(2);
	});

	test("should work with mixed hash function configurations", () => {
		const mockFn = vi.fn(
			(a: string, b: { id: number }, c: number) => `${a}-${b.id}-${c}`,
		);
		const objHashFn = (obj: { id: number }) => obj.id;
		const memoized = memoizePureFunction(mockFn, {
			hashFunction: [undefined, objHashFn, undefined],
		});

		const obj1 = { id: 1 };
		const obj2 = { id: 1 };

		const result1 = memoized("test", obj1, 42);
		const result2 = memoized("test", obj2, 42);

		expect(result1).toBe("test-1-42");
		expect(result2).toBe("test-1-42");
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should handle hash function throwing errors", () => {
		const mockFn = vi.fn((obj: any) => obj.value);
		const hashFn = () => {
			throw new Error("Hash error");
		};
		const memoized = memoizePureFunction(mockFn, { hashFunction: hashFn });

		expect(() => memoized({ value: "test" })).toThrow("Hash error");
	});

	test("should preserve normal behavior when no hash functions provided", () => {
		const mockFn = vi.fn(
			(obj1: { a: number }, obj2: { b: number }) => obj1.a + obj2.b,
		);
		const memoized = memoizePureFunction(mockFn, {});

		const obj1 = { a: 1 };
		const obj2 = { b: 2 };

		const result1 = memoized(obj1, obj2);
		const result2 = memoized(obj1, obj2);
		const result3 = memoized({ a: 1 }, { b: 2 });

		expect(result1).toBe(3);
		expect(result2).toBe(3);
		expect(result3).toBe(3);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should work with no arguments function and hash functions", () => {
		const mockFn = vi.fn(() => Math.random());
		const memoized = memoizePureFunction(mockFn, { hashFunction: () => "key" });

		const result1 = memoized();
		const result2 = memoized();

		expect(result1).toBe(result2);
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test("should work with single argument and hash functions array", () => {
		const mockFn = vi.fn((obj: { val: string }) => obj.val.toUpperCase());
		const hashFn = (obj: { val: string }) => obj.val;
		const memoized = memoizePureFunction(mockFn, { hashFunction: [hashFn] });

		const obj1 = { val: "hello" };
		const obj2 = { val: "hello" };

		const result1 = memoized(obj1);
		const result2 = memoized(obj2);

		expect(result1).toBe("HELLO");
		expect(result2).toBe("HELLO");
		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});

describe("edge cases", () => {
	test("should handle clearing cache for non-existent function gracefully", () => {
		const unmemoizedFn = vi.fn((x: number) => x * 2);
		expect(() => clearCache(unmemoizedFn)).not.toThrow();
	});

	test("should handle function identity correctly", () => {
		const fn1 = (x: number) => x * 2;
		const fn2 = (x: number) => x * 2;

		const mockFn1 = vi.fn(fn1);
		const mockFn2 = vi.fn(fn2);

		const memoized1 = memoizePureFunction(mockFn1);
		const memoized2 = memoizePureFunction(mockFn2);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(1);
		expect(mockFn2).toHaveBeenCalledTimes(1);

		clearCache(mockFn1);

		memoized1(5);
		memoized2(5);
		expect(mockFn1).toHaveBeenCalledTimes(2);
		expect(mockFn2).toHaveBeenCalledTimes(1);
	});

	test("should handle multiple sequential cache clears", () => {
		const mockFn = vi.fn((x: number) => x * 2);
		const memoized = memoizePureFunction(mockFn);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(1);

		clearCache(mockFn);
		clearCache(mockFn);
		clearCache(mockFn);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test("should handle multiple sequential global cache clears", () => {
		const mockFn = vi.fn((x: number) => x * 2);
		const memoized = memoizePureFunction(mockFn);

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(1);

		clearGlobalCache();
		clearGlobalCache();
		clearGlobalCache();

		memoized(5);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});
});
