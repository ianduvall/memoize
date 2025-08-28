export class AnyKeyWeakMap<Key, Value> implements WeakMap<any, Value> {
	#weakMap?: WeakMap<any, Value>;
	#strongMap?: Map<any, Value>;

	constructor(entries?: ReadonlyArray<readonly [Key, Value]> | null) {
		if (!entries) return;
		for (const [key, value] of entries) {
			this.set(key, value);
		}
	}

	#map(key: Key) {
		if (
			(typeof key === "object" && key !== null) ||
			typeof key === "function"
		) {
			return (this.#weakMap ??= new WeakMap<any, Value>());
		}
		return (this.#strongMap ??= new Map<any, Value>());
	}

	set(key: Key, value: Value): this {
		this.#map(key).set(key, value);
		return this;
	}

	get(key: Key): Value | undefined {
		return this.#map(key).get(key);
	}

	has(key: Key): boolean {
		return this.#map(key).has(key);
	}

	delete(key: Key): boolean {
		return this.#map(key).delete(key);
	}

	get [Symbol.toStringTag](): string {
		return "AnyKeyWeakMap";
	}
}
