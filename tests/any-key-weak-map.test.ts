import { describe, expect, test } from "vitest";
import { AnyKeyWeakMap } from "../src/any-key-weak-map";

describe("AnyKeyWeakMap", () => {
	test("constructor seeds initial entries", () => {
		const map = new AnyKeyWeakMap<string, number>([
			["a", 1],
			["b", 2],
		]);
		expect(map.get("a")).toBe(1);
		expect(map.get("b")).toBe(2);
		expect(map.has("a")).toBe(true);
	});

	test("methods work for primitives", () => {
		const map = new AnyKeyWeakMap<any, string>();
		map.set("x", "X");
		map.set(42, "N");
		map.set(true, "T");
		const sym = Symbol("s");
		map.set(sym, "S");

		expect(map.get("x")).toBe("X");
		expect(map.get(42)).toBe("N");
		expect(map.get(true)).toBe("T");
		expect(map.get(sym)).toBe("S");
		expect(map.has("x")).toBe(true);
		expect(map.delete("x")).toBe(true);
		expect(map.has("x")).toBe(false);
	});

	test("works with object and function keys via weak semantics", () => {
		const map = new AnyKeyWeakMap<object, string>();
		const testObject = { a: 1 };
		const testFunction = () => {};
		map.set(testObject, "O");
		map.set(testFunction, "F");
		expect(map.get(testObject)).toBe("O");
		expect(map.get(testFunction)).toBe("F");
		expect(map.has(testObject)).toBe(true);
		expect(map.delete(testFunction)).toBe(true);
		expect(map.has(testFunction)).toBe(false);
	});

	test("string vs new String() don't collide", () => {
		const map = new AnyKeyWeakMap<any, number>();
		const prim = "hello";
		const boxed = new Object("hello");
		map.set(prim, 1);
		map.set(boxed, 2);
		expect(map.get(prim)).toBe(1);
		expect(map.get(boxed)).toBe(2);
	});

	test("number vs new Number() don't collide", () => {
		const map = new AnyKeyWeakMap<any, number>();
		const prim = 7;
		const boxed = new Object(7);
		map.set(prim, 1);
		map.set(boxed, 2);
		expect(map.get(prim)).toBe(1);
		expect(map.get(boxed)).toBe(2);
	});

	test("[Symbol.toStringTag] is AnyKeyWeakMap", () => {
		const map = new AnyKeyWeakMap();

		expect(map[Symbol.toStringTag]).toBe("AnyKeyWeakMap");
	});

	test("set returns this for chaining", () => {
		const map = new AnyKeyWeakMap<any, number>();
		const ret = map.set("a", 1).set("b", 2);
		expect(ret).toBe(map);
		expect(map.get("a")).toBe(1);
		expect(map.get("b")).toBe(2);
	});

	test("delete returns false for missing keys", () => {
		const map = new AnyKeyWeakMap<any, number>();
		// primitive missing
		expect(map.delete("missing")).toBe(false);
		// object missing
		expect(map.delete({ x: 1 })).toBe(false);
	});
});
